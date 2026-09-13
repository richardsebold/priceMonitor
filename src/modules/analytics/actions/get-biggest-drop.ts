"use server"

import { prisma } from "@/lib/prisma";
import { findBiggestDrop } from "../domain/metrics";

export async function getBiggestDrop(userId: string) {
  const products = await prisma.productHistory.findMany({
    include: {
      history: true
    },
    where: {
      userId: userId
    }
  })

  return findBiggestDrop(products)
}
