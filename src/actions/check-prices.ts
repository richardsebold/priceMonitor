'use server'

import { prisma } from "@/lib/prisma";
import { scrapeProduct } from "./scrape-product";
import { sendPriceAlert } from "../actions/enviar-email";

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

      if (!newSearch) {
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
      }

      await prisma.priceHistory.create({
        data: {
          price: newSearch.price,
          productId: product.id,
        },
      });

      const isBelowTarget = newSearch.price <= product.priceTarget;
      const dropped10Percent = newSearch.price <= (product.price * 0.9);

      if ((isBelowTarget || dropped10Percent) && !product.targetReached) {
        console.log(
          `[ALERTA] Meta atingida para o produto ${product.name} (Usuário: ${product.user.email})`,
        );
        
        await prisma.productHistory.update({
          where: { id: product.id },
          data: { targetReached: true },
        });

        await sendPriceAlert(product, product.user.email, product.user.name);
        
      } else if (newSearch.price > product.priceTarget && product.targetReached) {
        await prisma.productHistory.update({
          where: { id: product.id },
          data: { targetReached: false },
        });
      }
    } catch (error) {
      console.error(`Erro ao atualizar produto ${product.id}:`, error);
    }
  }

  console.log("Rotina finalizada!");
}