import {
  activateSubscription,
  findPlan,
  setSubscriptionStatus,
} from "../infra/subscription-repository";

const CYCLE_DAYS: Record<string, number> = {
  WEEKLY: 7,
  MONTHLY: 30,
  SEMIANNUALLY: 180,
  ANNUALLY: 365,
};

function computeSubscriptionEnd(cycle?: string | null) {
  const days = CYCLE_DAYS[cycle ?? "MONTHLY"] ?? 30;
  const end = new Date();
  end.setDate(end.getDate() + days);
  return end;
}

type WebhookMetadata = { userId?: string; planId?: string };

export type AbacatePayWebhookBody = {
  event: string;
  data?: {
    id?: string;
    metadata?: WebhookMetadata;
    subscription?: { id?: string; metadata?: WebhookMetadata };
  };
};

export async function handleAbacatePayWebhook(body: AbacatePayWebhookBody) {
  const eventType = body.event;

  const userId = body.data?.metadata?.userId ?? body.data?.subscription?.metadata?.userId;
  const planId = body.data?.metadata?.planId ?? body.data?.subscription?.metadata?.planId;
  const subscriptionId = body.data?.subscription?.id ?? body.data?.id;

  switch (eventType) {
    case "subscription.completed":
    case "subscription.renewed":
    case "billing.paid":
    case "BILLING.PAID": {
      if (!userId) {
        console.warn("Webhook sem userId em metadata:", eventType);
        break;
      }

      const plan = planId ? await findPlan(planId) : null;

      await activateSubscription(userId, {
        planId,
        subscriptionEnd: computeSubscriptionEnd(plan?.cycle),
        abacatepaySubscriptionId: subscriptionId,
      });
      console.log(`Assinatura ativa/renovada para userId=${userId}`);
      break;
    }

    case "subscription.cancelled": {
      if (!userId) break;
      await setSubscriptionStatus(userId, "CANCELLED");
      console.log(`Assinatura cancelada para userId=${userId}`);
      break;
    }

    case "subscription.trial_started": {
      if (!userId) break;
      await setSubscriptionStatus(userId, "TRIALING");
      break;
    }

    default:
      console.log("Evento ignorado:", eventType);
  }
}
