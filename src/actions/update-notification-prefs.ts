"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function setPriceAlertsEnabled(enabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { priceAlertsEnabled: enabled },
  });

  return { priceAlertsEnabled: enabled };
}
