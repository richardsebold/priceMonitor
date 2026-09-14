import { prisma } from "@/lib/prisma";
import { scrapeProduct, type ScrapedProduct } from "../scraping/scrape-product";
import { detectPriceEvent, isTargetReached, type PriceEvent } from "../domain/price-events";
import { isImplausiblePriceChange } from "../domain/price-plausibility";

const CONFIRMATION_TOLERANCE_RATIO = 0.02;
const CONFIRMATION_TOLERANCE_FLOOR = 1;
const CONFIRMATION_TIMEOUT_MS = 20000;

type PriceCheckJobOptions = {
  onPriceEvent: (event: PriceEvent) => Promise<void>;
};

type ConfirmationAttempt = {
  result: ScrapedProduct | null;
  error: unknown;
  timedOut: boolean;
};

async function scrapeWithTimeout(url: string, timeoutMs: number): Promise<ConfirmationAttempt> {
  let timedOut = false;
  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => {
      timedOut = true;
      resolve(null);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([scrapeProduct(url), timeout]);
    return { result, error: null, timedOut };
  } catch (error) {
    return { result: null, error, timedOut: false };
  }
}

function describeConfirmationFailure(attempt: ConfirmationAttempt): string {
  if (attempt.timedOut) return `timeout após ${CONFIRMATION_TIMEOUT_MS}ms`;
  if (attempt.error) return `erro: ${attempt.error instanceof Error ? attempt.error.message : String(attempt.error)}`;
  if (attempt.result) return String(attempt.result.price);
  return "falhou";
}

export async function runPriceCheckJob({ onPriceEvent }: PriceCheckJobOptions) {
  console.log("Iniciando rotina de verificação de preços...");

  const products = await prisma.productHistory.findMany({
    include: {
      user: { select: { email: true } },
    },
  });

  if (!products || products.length === 0) {
    console.log("Nenhum produto cadastrado para verificar.");
    return;
  }

  for (const { user, ...product } of products) {
    try {
      console.log(
        `Buscando preço de ${product.url} para o usuário: ${user.email}`,
      );

      const newSearch = await scrapeProduct(product.url);

      if (!newSearch || newSearch.price <= 0) {
        console.error(
          `[SCRAPE] Falha ao obter preço — produto "${product.name}" (id: ${product.id}, usuário: ${user.email}, url: ${product.url})`,
        );
        continue;
      }

      let confirmedPrice = newSearch.price;

      if (isImplausiblePriceChange(product.price, newSearch.price)) {
        const attempt = await scrapeWithTimeout(product.url, CONFIRMATION_TIMEOUT_MS);
        const confirmSearch = attempt.result;

        const tolerance = Math.max(newSearch.price * CONFIRMATION_TOLERANCE_RATIO, CONFIRMATION_TOLERANCE_FLOOR);
        const confirmedByRescrape =
          confirmSearch !== null &&
          confirmSearch.price > 0 &&
          Math.abs(confirmSearch.price - newSearch.price) <= tolerance;

        if (!confirmedByRescrape) {
          console.warn(
            `[SCRAPE] leitura implausível não confirmada — produto "${product.name}" (id: ${product.id}): anterior=${product.price}, leitura1=${newSearch.price}, leitura2=${describeConfirmationFailure(attempt)}`,
          );
          continue;
        }

        confirmedPrice = confirmSearch.price;
        console.warn(
          `[SCRAPE] leitura implausível confirmada — produto "${product.name}" (id: ${product.id}): anterior=${product.price}, leitura1=${newSearch.price}, leitura2=${confirmSearch.price}`,
        );
      }

      if (product.price !== confirmedPrice) {
        await prisma.productHistory.update({
          where: { id: product.id },
          data: { price: confirmedPrice },
        });

        await prisma.priceHistory.create({
          data: {
            price: confirmedPrice,
            productId: product.id,
          },
        });
      }

      const eventType = detectPriceEvent({
        previousPrice: product.price,
        currentPrice: confirmedPrice,
        priceTarget: product.priceTarget,
        targetReached: product.targetReached,
      });

      const targetReached = isTargetReached(confirmedPrice, product.priceTarget);
      if (targetReached !== product.targetReached) {
        await prisma.productHistory.update({
          where: { id: product.id },
          data: { targetReached },
        });
      }

      if (!eventType) continue;

      console.log(
        eventType === "TARGET_REACHED"
          ? `[ALERTA] Meta atingida para o produto ${product.name} (Usuário: ${user.email})`
          : `[ALERTA] Queda de 10% para o produto ${product.name} (Usuário: ${user.email})`,
      );

      await onPriceEvent({
        type: eventType,
        userId: product.userId,
        product: { ...product, price: confirmedPrice, targetReached },
        previousPrice: product.price,
      });
    } catch (error) {
      console.error(`Erro ao atualizar produto ${product.id}:`, error);
    }
  }

  console.log("Rotina finalizada!");
}
