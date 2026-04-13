"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "./get-user";
import { redirect } from "next/navigation";

export async function createAbacatePayCheckout(planId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Plano não encontrado");
  }

  const user = await getUser();

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: plan.id,
          quantity: 1,
        },
      ],
      methods: ["CARD", "PIX"],
      returnUrl: `${appUrl}/cancelado`,
      completionUrl: `${appUrl}/sucesso`,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    }),
  };

  const response = await fetch(
    "https://api.abacatepay.com/v2/checkouts/create",
    options,
  );
  
  const data = await response.json();

  if (!response.ok) {
    console.error("Erro na AbacatePay:", data);
    throw new Error("Falha ao criar o checkout de pagamento.");
  }

  const checkoutUrl = data.data?.url || data.url;

  if (!checkoutUrl) {
    console.error("Resposta inesperada:", data);
    throw new Error("A API não retornou o link de pagamento.");
  }

  redirect(checkoutUrl);
}