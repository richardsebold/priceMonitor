import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    
    const secretFromUrl = url.searchParams.get("webhookSecret");
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (!secretFromUrl || secretFromUrl !== webhookSecret) {
      return NextResponse.json({ error: "Acesso Negado" }, { status: 401 });
    }

    const body = await request.json();
    const eventType = body.event; 

    if (eventType === "billing.paid" || eventType === "BILLING.PAID") {
      const userId = body.data?.metadata?.userId || body.data?.billing?.metadata?.userId;
      const paymentEmail = body.data?.customer?.email || body.data?.billing?.customer?.email;
      const planId = body.data?.metadata?.planId || body.data?.billing?.products?.[0]?.externalId;

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 30);

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            planId: planId,
            subscriptionStatus: "active",
            subscriptionEnd: dataExpiracao,
          },
        });
        console.log(`Sucesso: Plano ativado para o ID ${userId}`);
      } else if (paymentEmail) {
        await prisma.user.update({
          where: { email: paymentEmail },
          data: {
            planId: planId,
            subscriptionStatus: "active",
            subscriptionEnd: dataExpiracao,
          },
        });
        console.log(`Sucesso: Plano ativado via email para ${paymentEmail}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}