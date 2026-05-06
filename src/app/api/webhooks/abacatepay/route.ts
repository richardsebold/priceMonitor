import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);

    const secretFromUrl = url.searchParams.get("webhookSecret");
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (!secretFromUrl || secretFromUrl !== webhookSecret) {
      return NextResponse.json({ error: "Acesso Negado" }, { status: 401 });
    }

    const body = await request.json();
    const eventType: string = body.event;

    const userId =
      body.data?.metadata?.userId ?? body.data?.subscription?.metadata?.userId;
    const planId =
      body.data?.metadata?.planId ?? body.data?.subscription?.metadata?.planId;
    const subscriptionId =
      body.data?.subscription?.id ?? body.data?.id;

    switch (eventType) {
      case "subscription.completed":
      case "subscription.renewed":
      case "billing.paid":
      case "BILLING.PAID": {
        if (!userId) {
          console.warn("Webhook sem userId em metadata:", eventType);
          break;
        }

        const plan = planId
          ? await prisma.plan.findUnique({ where: { id: planId } })
          : null;

        await prisma.user.update({
          where: { id: userId },
          data: {
            ...(planId ? { planId } : {}),
            subscriptionStatus: "ACTIVE",
            subscriptionEnd: computeSubscriptionEnd(plan?.cycle),
            ...(subscriptionId
              ? { abacatepaySubscriptionId: subscriptionId }
              : {}),
          },
        });
        console.log(`Assinatura ativa/renovada para userId=${userId}`);
        break;
      }

      case "subscription.cancelled": {
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "CANCELLED" },
        });
        console.log(`Assinatura cancelada para userId=${userId}`);
        break;
      }

      case "subscription.trial_started": {
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "TRIALING" },
        });
        break;
      }

      default:
        console.log("Evento ignorado:", eventType);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}
