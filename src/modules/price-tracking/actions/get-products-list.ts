"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/modules/identity/session";

export async function getProductsListWithHistory() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.productHistory.findMany({
    where: { userId },
    orderBy: { scrapedAt: "desc" },
    include: {
      history: {
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "asc" },
        select: { price: true, createdAt: true },
      },
    },
  });
}
