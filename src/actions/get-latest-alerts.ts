"use server"

import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/get-user"

export async function getLatestAlerts() {
  const user = await getUser()
  
  if (!user) return []

  const alerts = await prisma.productHistory.findMany({
    where: {
      userId: user.id,
      targetReached: true
    },
    orderBy: {
      scrapedAt: 'desc'
    },
    take: 10
  })

  return alerts
}