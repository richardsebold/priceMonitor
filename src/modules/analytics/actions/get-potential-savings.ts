'use server'

import { prisma } from "@/lib/prisma";
import { sumPotentialSavings } from "../domain/metrics";

export async function getPotentialSavings(userId: string) {
  const products = await prisma.productHistory.findMany({
    where: {
      targetReached: true,
      userId: userId
    },
  })

  return sumPotentialSavings(products)
}
