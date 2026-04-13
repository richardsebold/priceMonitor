'use server'

import { prisma } from "@/lib/prisma";

export async function getPotentialSavings(userId: string) {
  const products = await prisma.productHistory.findMany({
    where: { 
      targetReached: true,
      userId: userId
    },
  })

  let totalSavings = 0

  products.forEach((product) => {
    if (product.price < product.priceTarget) {
      totalSavings += (product.priceTarget - product.price)
    }
  })

  return totalSavings
}