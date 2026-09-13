"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/modules/identity/session";

export async function getProducts() {
  const userId = await getSessionUserId();

  if (!userId) {
    return [];
  }

  try {
    const products = await prisma.productHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        scrapedAt: "desc",
      },
    });
    if (!products) return;
    return products;
  } catch (error) {
    console.error("Erro ao buscar:", error);
  }
}
