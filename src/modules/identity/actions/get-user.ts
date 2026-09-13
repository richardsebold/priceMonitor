'use server'

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "../session";

export async function getUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });
  } catch (error) {
    console.error("Erro ao buscar:", error);
    return null;
  }
}
