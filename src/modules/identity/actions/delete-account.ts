"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "../session";

export async function deleteAccount() {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true };
}
