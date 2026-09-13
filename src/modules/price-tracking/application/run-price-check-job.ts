import { prisma } from "@/lib/prisma";
import { sendPriceAlert, sendPriceDropAlert } from "@/actions/enviar-email";
import { scrapeProduct } from "../scraping/scrape-product";
import { detectPriceEvent, isTargetReached } from "../domain/price-events";

export async function runPriceCheckJob() {
  console.log("Iniciando rotina de verificação de preços...");

  const products = await prisma.productHistory.findMany({
    include: {
      user: true,
    },
  });

  if (!products || products.length === 0) {
    console.log("Nenhum produto cadastrado para verificar.");
    return;
  }

  for (const product of products) {
    try {
      console.log(
        `Buscando preço de ${product.url} para o usuário: ${product.user.email}`,
      );

      const newSearch = await scrapeProduct(product.url);

      if (!newSearch || newSearch.price <= 0) {
        console.error(
          `[SCRAPE] Falha ao obter preço — produto "${product.name}" (id: ${product.id}, usuário: ${product.user.email}, url: ${product.url})`,
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

      const event = detectPriceEvent({
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

      if (!event) continue;

      const { user, ...productData } = product;
      const updatedProduct = { ...productData, price: newSearch.price, targetReached };

      console.log(
        event === "TARGET_REACHED"
          ? `[ALERTA] Meta atingida para o produto ${product.name} (Usuário: ${user.email})`
          : `[ALERTA] Queda de 10% para o produto ${product.name} (Usuário: ${user.email})`,
      );

      if (!user.priceAlertsEnabled) {
        console.log(`[SKIP] Alertas desativados para o usuário ${user.email}`);
        continue;
      }

      if (event === "TARGET_REACHED") {
        await sendPriceAlert(updatedProduct, user.email, user.name);
      } else {
        await sendPriceDropAlert(updatedProduct, user.email, user.name, product.price);
      }

      await prisma.alert.create({
        data: {
          type: event,
          name: updatedProduct.name,
          url: updatedProduct.url,
          price: updatedProduct.price,
          priceTarget: updatedProduct.priceTarget,
          userId: product.userId,
          productId: product.id,
        },
      });
    } catch (error) {
      console.error(`Erro ao atualizar produto ${product.id}:`, error);
    }
  }

  console.log("Rotina finalizada!");
}
