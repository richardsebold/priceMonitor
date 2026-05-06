"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "./get-user";
import { redirect } from "next/navigation";

const ABACATEPAY_API = "https://api.abacatepay.com/v2";

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

  if (!plan.abacatepayProductId) {
    throw new Error(
      `Plano ${plan.id} não possui produto cadastrado na AbacatePay. Rode o script de setup.`,
    );
  }

  const user = await getUser();

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const appUrl = process.env.NEXT_PUBLIC_URL;

  const response = await fetch(`${ABACATEPAY_API}/subscriptions/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: plan.abacatepayProductId,
          quantity: 1,
        },
      ],
      methods: ["CARD"],
      returnUrl: `${appUrl}/cancelado`,
      completionUrl: `${appUrl}/sucesso`,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro na AbacatePay:", data);
    throw new Error("Falha ao criar a assinatura.");
  }

  const checkoutUrl = data.data?.url || data.url;

  if (!checkoutUrl) {
    console.error("Resposta inesperada:", data);
    throw new Error("A API não retornou o link de pagamento.");
  }

  redirect(checkoutUrl);
}

export async function cancelAbacatePaySubscription() {
  const user = await getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  if (!user.abacatepaySubscriptionId) {
    throw new Error("Usuário não possui assinatura ativa");
  }

  const response = await fetch(`${ABACATEPAY_API}/subscriptions/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: user.abacatepaySubscriptionId }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro ao cancelar assinatura:", data);
    throw new Error("Falha ao cancelar a assinatura.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: "CANCELLED" },
  });

  return { success: true };
}
