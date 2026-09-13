"use server";

import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { getUser } from "@/modules/identity/actions/get-user";
import { getSessionUserId } from "@/modules/identity/session";
import {
  CANCELLATION_REASONS,
  isWithinRefundWindow,
  type CancellationReason,
} from "../domain/refund";
import { cancelSubscription, createSubscriptionCheckout } from "../infra/abacatepay-client";
import { findPlan, recordCancellation, resetForCheckout } from "../infra/subscription-repository";

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
    await sendEmail({
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

export async function createAbacatePayCheckout(planId: string) {
  if (!(await getSessionUserId())) {
    throw new Error("Usuário não autenticado");
  }

  const plan = await findPlan(planId);

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

  const checkoutUrl = await createSubscriptionCheckout({
    productId: plan.abacatepayProductId,
    userId: user.id,
    planId: plan.id,
  });

  await resetForCheckout(user.id);

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

  if (user.abacatepaySubscriptionId) {
    await cancelSubscription(user.abacatepaySubscriptionId);
  } else {
    console.warn(
      `Cancelamento sem abacatepaySubscriptionId registrado para userId=${user.id}`,
    );
  }

  await recordCancellation(user.id, {
    reason: input.reason,
    comment,
    refundRequested: eligibleForRefund,
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
