'use server'

import { prisma } from "@/lib/prisma";
export async function getReachedTargetsCount(userId: string) {
  const count = await prisma.productHistory.count({
    where: {
      userId: userId,
      targetReached: true,
    },
  })

  return count
}