"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getProductsListWithHistory() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const products = await prisma.productHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { scrapedAt: "desc" },
    include: {
      history: {
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "asc" },
        select: { price: true, createdAt: true },
      },
    },
  });

  return products;
}
