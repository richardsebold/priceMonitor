import { prisma } from "@/lib/prisma";

export function findPlan(planId: string) {
  return prisma.plan.findUnique({ where: { id: planId } });
}

export function resetForCheckout(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStart: null,
      cancellationReason: null,
      cancellationComment: null,
      refundRequested: false,
    },
  });
}

export function recordCancellation(
  userId: string,
  cancellation: { reason: string; comment: string | null; refundRequested: boolean },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "CANCELLED",
      cancellationReason: cancellation.reason,
      cancellationComment: cancellation.comment,
      refundRequested: cancellation.refundRequested,
      // Cancelamento dentro de 7 dias: reembolso integral, sem manter acesso.
      ...(cancellation.refundRequested ? { subscriptionEnd: new Date() } : {}),
    },
  });
}

export async function activateSubscription(
  userId: string,
  activation: { planId?: string; subscriptionEnd: Date; abacatepaySubscriptionId?: string },
) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStart: true },
  });

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(activation.planId ? { planId: activation.planId } : {}),
      subscriptionStatus: "ACTIVE",
      ...(existing?.subscriptionStart ? {} : { subscriptionStart: new Date() }),
      subscriptionEnd: activation.subscriptionEnd,
      ...(activation.abacatepaySubscriptionId
        ? { abacatepaySubscriptionId: activation.abacatepaySubscriptionId }
        : {}),
    },
  });
}

export function setSubscriptionStatus(userId: string, status: "CANCELLED" | "TRIALING") {
  return prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: status },
  });
}
