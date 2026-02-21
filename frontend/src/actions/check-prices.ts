import { prisma } from "@/lib/prisma";
import { scrapeProduct } from "./scrape-product";
import { sendPriceAlert } from "../actions/enviar-email";

export async function runPriceCheckJob() {
  console.log("Iniciando rotina de verificação de preços...");

  const products = await prisma.productHistory.findMany();

  if (!products || products.length === 0) {
    console.log("Nenhum produto cadastrado para verificar.");
    return;
  }

  for (const product of products) {
    try {
      console.log(`Buscando preço para: ${product.url}`);

      const newSearch = await scrapeProduct(product.url);

      if (!newSearch) continue;

      if (product.price !== newSearch.price) {
        await prisma.productHistory.update({
          where: { id: product.id },
          data: { price: newSearch.price },
        });
      }

      await prisma.priceHistory.create({
        data: {
          price: newSearch.price,
          productId: product.id,
        },
      });

      if (newSearch.price <= product.priceTarget) {
        console.log(
          `[ALERTA] Meta atingida para o produto ${product.name} (Usuário: ${product.userId})`,
        );

        const user = await prisma.user.findUnique({
          where: { id: product.userId },
        });

        if (user) {
          await sendPriceAlert(product);
        }
      }

    } catch (error) {
      console.error(`Erro ao atualizar produto ${product.id}:`, error);
    }
  }

  console.log("Rotina finalizada!");
}
