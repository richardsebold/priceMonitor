'use server'

import { prisma } from "@/lib/prisma";

export async function getPotentialSavings() {
  const products = await prisma.productHistory.findMany({
    where: { 
      targetReached: true 
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