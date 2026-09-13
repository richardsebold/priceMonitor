"use server"

import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/modules/identity/session"
import { findBiggestDrop, sumPotentialSavings } from "../domain/metrics"

export async function getDashboardStats() {
  const userId = await getSessionUserId()

  if (!userId) return null

  const [user, products, reachedTargets, savings, productsWithHistory, alerts] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      }),
      prisma.productHistory.findMany({
        where: { userId },
        orderBy: { scrapedAt: "desc" },
      }),
      prisma.alert.count({
        where: { userId, type: "TARGET_REACHED" },
      }),
      prisma.productHistory.findMany({
        where: { userId, targetReached: true },
        select: { price: true, priceTarget: true },
      }),
      prisma.productHistory.findMany({
        where: { userId },
        include: { history: true },
      }),
      prisma.alert.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])

  if (!user) return null

  const potentialSavings = sumPotentialSavings(savings)
  const biggestDrop = findBiggestDrop(productsWithHistory)

  return { user, products, reachedTargets, potentialSavings, biggestDrop, alerts }
}
