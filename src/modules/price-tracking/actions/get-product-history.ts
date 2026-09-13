"use server"

import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/modules/identity/session"

export async function getProductHistory(productId: string) {
  try {
    const userId = await getSessionUserId()
    if (!userId) return []

    const history = await prisma.priceHistory.findMany({
      where: {
        productId,
        product: { userId },
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
