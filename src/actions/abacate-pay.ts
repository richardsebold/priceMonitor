"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "./get-user";
import { redirect } from "next/navigation";
import {
  CANCELLATION_REASONS,
  isWithinRefundWindow,
  type CancellationReason,
} from "@/lib/refund";
import { Resend } from "resend";

const VALID_REASONS = new Set(CANCELLATION_REASONS.map((r) => r.value));

async function notifyRefundRequest(params: {
  userEmail: string;
  userName: string;
  subscriptionId: string;
  reason: string;
  comment: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_EMAIL || process.env.EMAIL_ADDRESS;
  if (!apiKey || !to) {
    console.warn(
      "Reembolso solicitado mas RESEND_API_KEY/SUPPORT_EMAIL não configurados:",
      params,
    );
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Monitorador de Preços <${process.env.EMAIL_ADDRESS}>`,
      to,
      subject: "Solicitação de reembolso (cancelamento em até 7 dias)",
      text: [
        `Usuário: ${params.userName} <${params.userEmail}>`,
        `Assinatura AbacatePay: ${params.subscriptionId}`,
        `Motivo: ${params.reason}`,
        `Comentário: ${params.comment ?? "(nenhum)"}`,
        "",
        "Processe o estorno manualmente no painel da AbacatePay.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Falha ao notificar solicitação de reembolso:", error);
  }
}

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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStart: null,
      cancellationReason: null,
      cancellationComment: null,
      refundRequested: false,
    },
  });

  redirect(checkoutUrl);
}

export async function cancelAbacatePaySubscription(input: {
  reason: CancellationReason;
  comment?: string;
}) {
  const user = await getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const hasActiveSubscription =
    !!user.planId &&
    user.subscriptionStatus !== "FREE" &&
    user.subscriptionStatus !== "CANCELLED";

  if (!hasActiveSubscription) {
    throw new Error("Usuário não possui assinatura ativa");
  }

  if (!input?.reason || !VALID_REASONS.has(input.reason)) {
    throw new Error("Selecione um motivo válido para o cancelamento.");
  }

  const comment = input.comment?.trim() || null;
  // Reembolso só dentro da janela de 7 dias desde a ativação.
  // Após esse prazo (e, portanto, após o ciclo de 30 dias) apenas
  // cancelamos a cobrança recorrente, sem solicitação de estorno.
  const eligibleForRefund = isWithinRefundWindow(user.subscriptionStart);

  // Cancela a cobrança recorrente na AbacatePay (quando há assinatura registrada).
  if (user.abacatepaySubscriptionId) {
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
  } else {
    console.warn(
      `Cancelamento sem abacatepaySubscriptionId registrado para userId=${user.id}`,
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "CANCELLED",
      cancellationReason: input.reason,
      cancellationComment: comment,
      refundRequested: eligibleForRefund,
      // Cancelamento dentro de 7 dias: reembolso integral, sem manter acesso.
      ...(eligibleForRefund ? { subscriptionEnd: new Date() } : {}),
    },
  });

  if (eligibleForRefund) {
    await notifyRefundRequest({
      userEmail: user.email,
      userName: user.name,
      subscriptionId: user.abacatepaySubscriptionId ?? "(não registrado)",
      reason: input.reason,
      comment,
    });
  }

  return { success: true, refundRequested: eligibleForRefund };
}
