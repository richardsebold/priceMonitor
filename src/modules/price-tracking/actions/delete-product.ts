"use server"

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/modules/identity/session";

export async function deleteProduct(id: string) {
  try {
    if (!id) return;

    const userId = await getSessionUserId();
    if (!userId) return;

    const result = await prisma.productHistory.deleteMany({
      where: { id, userId },
    });

    return result.count > 0 ? result : undefined;
  } catch (error) {
    console.error("Erro ao buscar:", error);
  }
}
