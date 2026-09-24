"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/modules/identity/session";
import { CATALOG_USER_ID } from "@/modules/price-tracking/domain/catalog";
import { normalizeProductUrl } from "@/modules/price-tracking/domain/product-url";
import { rankDeals, toDeal, type Deal } from "../domain/deals";

const MAX_DEALS = 12;

export type DealItem = Deal & {
  popularity: number;
  alreadyTracked: boolean;
};

export async function getDeals(): Promise<DealItem[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const [catalog, tracked] = await Promise.all([
    prisma.productHistory.findMany({
      where: { userId: CATALOG_USER_ID },
      select: {
        id: true,
        url: true,
        name: true,
        image: true,
        store: true,
        price: true,
        lastPriceReadAt: true,
        history: { select: { price: true, createdAt: true } },
      },
    }),
    prisma.productHistory.findMany({
      where: { userId: { not: CATALOG_USER_ID } },
      select: { url: true, userId: true },
    }),
  ]);

  const usersByUrl = new Map<string, Set<string>>();
  for (const product of tracked) {
    if (product.userId === CATALOG_USER_ID) continue;
    const key = normalizeProductUrl(product.url);
    const users = usersByUrl.get(key) ?? new Set<string>();
    users.add(product.userId);
    usersByUrl.set(key, users);
  }

  const now = new Date();
  const deals: DealItem[] = [];
  for (const { history, ...product } of catalog) {
    const deal = toDeal(product, history, now);
    if (!deal) continue;
    const users = usersByUrl.get(normalizeProductUrl(product.url));
    deals.push({
      ...deal,
      popularity: users?.size ?? 0,
      alreadyTracked: users?.has(userId) ?? false,
    });
  }

  return rankDeals(deals).slice(0, MAX_DEALS);
}
