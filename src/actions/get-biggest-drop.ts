"use server"

import { prisma } from "@/lib/prisma";

export async function getBiggestDrop(userId: string) {
  const products = await prisma.productHistory.findMany({
    include: {
      history: true
    },
    where: {
      userId: userId
    }
  })

  let maxDrop = 0
  let bestProduct = null

  products.forEach(product => {
    if (product.history && product.history.length > 0) {
      const prices = product.history.map(h => h.price)
      const maxPrice = Math.max(...prices, product.price)
      const currentPrice = product.price

      if (maxPrice > currentPrice) {
        const dropPercentage = ((maxPrice - currentPrice) / maxPrice) * 100
        if (dropPercentage > maxDrop) {
          maxDrop = dropPercentage
          bestProduct = {
            name: product.name,
            drop: maxDrop.toFixed(1),
            oldPrice: maxPrice,
            currentPrice: currentPrice,
          }
        }
      }
    }
  })

  return bestProduct
}