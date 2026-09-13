import { prisma } from "@/lib/prisma";
import { scrapeProduct } from "../scraping/scrape-product";
import { detectPriceEvent, isTargetReached, type PriceEvent } from "../domain/price-events";

type PriceCheckJobOptions = {
  onPriceEvent: (event: PriceEvent) => Promise<void>;
};

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

      if (product.price !== newSearch.price) {
        await prisma.productHistory.update({
          where: { id: product.id },
          data: { price: newSearch.price },
        });

        await prisma.priceHistory.create({
          data: {
            price: newSearch.price,
            productId: product.id,
          },
        });
      }

      const eventType = detectPriceEvent({
        previousPrice: product.price,
        currentPrice: newSearch.price,
        priceTarget: product.priceTarget,
        targetReached: product.targetReached,
      });

      const targetReached = isTargetReached(newSearch.price, product.priceTarget);
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
        product: { ...product, price: newSearch.price, targetReached },
        previousPrice: product.price,
      });
    } catch (error) {
      console.error(`Erro ao atualizar produto ${product.id}:`, error);
    }
  }

  console.log("Rotina finalizada!");
}
