"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getDashboardStats() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) return null

  const userId = session.user.id

  const [user, products, reachedTargets, savings, biggestDropRaw, alerts] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      }),
      prisma.productHistory.findMany({
        where: { userId },
        orderBy: { scrapedAt: "desc" },
      }),
      prisma.productHistory.count({
        where: { userId, targetReached: true },
      }),
      prisma.productHistory.findMany({
        where: { userId, targetReached: true },
        select: { price: true, priceTarget: true },
      }),
      prisma.productHistory.findMany({
        where: { userId },
        include: { history: true },
      }),
      prisma.productHistory.findMany({
        where: { userId, targetReached: true },
        orderBy: { scrapedAt: "desc" },
        take: 10,
      }),
    ])

  if (!user) return null

  const potentialSavings = savings.reduce((acc, p) => {
    if (p.price < p.priceTarget) acc += p.priceTarget - p.price
    return acc
  }, 0)

  let biggestDrop: {
    name: string | null
    drop: string
    oldPrice: number
    currentPrice: number
  } | null = null

  let maxDrop = 0
  for (const product of biggestDropRaw) {
    if (!product.history?.length) continue
    const prices = product.history.map((h) => h.price)
    const maxPrice = Math.max(...prices, product.price)
    if (maxPrice > product.price) {
      const dropPct = ((maxPrice - product.price) / maxPrice) * 100
      if (dropPct > maxDrop) {
        maxDrop = dropPct
        biggestDrop = {
          name: product.name,
          drop: maxDrop.toFixed(1),
          oldPrice: maxPrice,
          currentPrice: product.price,
        }
      }
    }
  }

  return { user, products, reachedTargets, potentialSavings, biggestDrop, alerts }
}
