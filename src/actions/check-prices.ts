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

      const isBelowTarget = newSearch.price <= product.priceTarget;
      const dropped10Percent = newSearch.price <= (product.price * 0.9);
      const priceChanged = product.price !== newSearch.price;

      if (priceChanged) {
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

      const updatedProduct = { ...product, price: newSearch.price };

      const alertsEnabled = product.user.priceAlertsEnabled;

      if (isBelowTarget && !product.targetReached) {
        console.log(
          `[ALERTA] Meta atingida para o produto ${product.name} (Usuário: ${product.user.email})`,
        );

        await prisma.productHistory.update({
          where: { id: product.id },
          data: { targetReached: true },
        });

        if (alertsEnabled) {
          await sendPriceAlert(updatedProduct, product.user.email, product.user.name);
        } else {
          console.log(
            `[SKIP] Alertas desativados para o usuário ${product.user.email}`,
          );
        }
      } else if (dropped10Percent) {
        console.log(
          `[ALERTA] Queda de 10% para o produto ${product.name} (Usuário: ${product.user.email})`,
        );

        if (alertsEnabled) {
          await sendPriceAlert(updatedProduct, product.user.email, product.user.name);
        } else {
          console.log(
            `[SKIP] Alertas desativados para o usuário ${product.user.email}`,
          );
        }
      }

      if (!isBelowTarget && product.targetReached) {
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