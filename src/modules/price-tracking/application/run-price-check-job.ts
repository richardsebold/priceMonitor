import { prisma } from "@/lib/prisma";
import { scrapeProduct, type ScrapedProduct } from "../scraping/scrape-product";
import { detectPriceEvent, isTargetReached, type PriceEvent } from "../domain/price-events";
import { isImplausiblePriceChange } from "../domain/price-plausibility";

const CONFIRMATION_TOLERANCE_RATIO = 0.02;
const CONFIRMATION_TOLERANCE_FLOOR = 1;

type PriceCheckJobOptions = {
  onPriceEvent: (event: PriceEvent) => Promise<void>;
};

type ConfirmationAttempt = {
  result: ScrapedProduct | null;
  error: unknown;
};

// No timeout race here on purpose: scrapeProduct has no cancellation (an
// AbortController would need to thread through its own fetch/Puppeteer tiers), so
// racing it against a shorter deadline only discards a slow-but-real confirmation and
// leaves the losing browser process running anyway. This call shares the same
// worst-case latency as the primary scrape above it in the loop.
async function attemptConfirmationScrape(url: string): Promise<ConfirmationAttempt> {
  try {
    const result = await scrapeProduct(url);
    return { result, error: null };
  } catch (error) {
    return { result: null, error };
  }
}

// Every attempt stamps lastCheckedAt; consecutiveFailures resets on an accepted
// reading (including an out-of-stock one) and grows on a reading with no usable price.
// Runtime logs on Vercel Hobby last one hour, so these columns are the only lasting
// record of which products are failing.
async function recordCheck(productId: string, outcome: "ok" | "failed") {
  try {
    await prisma.productHistory.update({
      where: { id: productId },
      data: {
        lastCheckedAt: new Date(),
        consecutiveFailures: outcome === "ok" ? 0 : { increment: 1 },
      },
    });
  } catch (error) {
    console.error(`[SCRAPE] Falha ao registrar verificação do produto ${productId}:`, error);
  }
}

function describeConfirmationFailure(attempt: ConfirmationAttempt): string {
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

      let newSearch: ScrapedProduct | null;
      try {
        newSearch = await scrapeProduct(product.url);
      } catch (error) {
        console.error(`[SCRAPE] Erro no scraping — produto ${product.id}:`, error);
        await recordCheck(product.id, "failed");
        continue;
      }

      if (newSearch?.availability === "out_of_stock") {
        console.log(
          `[SCRAPE] esgotado — produto "${product.name}" (id: ${product.id}): leitura de ${newSearch.price} ignorada, preço mantido em ${product.price}`,
        );
        await recordCheck(product.id, "ok");
        continue;
      }

      if (!newSearch || newSearch.price <= 0) {
        console.error(
          `[SCRAPE] Falha ao obter preço — produto "${product.name}" (id: ${product.id}, usuário: ${user.email}, url: ${product.url})`,
        );
        await recordCheck(product.id, "failed");
        continue;
      }

      let confirmedPrice = newSearch.price;

      if (isImplausiblePriceChange(product.price, newSearch.price)) {
        const attempt = await attemptConfirmationScrape(product.url);
        const confirmSearch = attempt.result;

        const tolerance = Math.max(newSearch.price * CONFIRMATION_TOLERANCE_RATIO, CONFIRMATION_TOLERANCE_FLOOR);
        const confirmedByRescrape =
          confirmSearch !== null &&
          confirmSearch.availability !== "out_of_stock" &&
          confirmSearch.price > 0 &&
          Math.abs(confirmSearch.price - newSearch.price) <= tolerance;

        if (!confirmedByRescrape) {
          console.warn(
            `[SCRAPE] leitura implausível não confirmada — produto "${product.name}" (id: ${product.id}): anterior=${product.price}, leitura1=${newSearch.price}, leitura2=${describeConfirmationFailure(attempt)}`,
          );
          await recordCheck(product.id, "failed");
          continue;
        }

        confirmedPrice = confirmSearch.price;
        console.warn(
          `[SCRAPE] leitura implausível confirmada — produto "${product.name}" (id: ${product.id}): anterior=${product.price}, leitura1=${newSearch.price}, leitura2=${confirmSearch.price}`,
        );
      }

      const readAt = new Date();
      await prisma.productHistory.update({
        where: { id: product.id },
        data: { lastPriceReadAt: readAt, lastCheckedAt: readAt, consecutiveFailures: 0 },
      });

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
