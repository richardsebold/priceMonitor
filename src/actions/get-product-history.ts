"use server"

import { prisma } from "@/lib/prisma"

export async function getProductHistory(productId: string) {
  try {
    const history = await prisma.priceHistory.findMany({
      where: {
        productId: productId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return history.map((item) => ({
      date: item.createdAt.toISOString(),
      price: item.price,
    }))
  } catch (error) {
    console.error("Erro ao buscar histórico:", error)
    return []
  }
}