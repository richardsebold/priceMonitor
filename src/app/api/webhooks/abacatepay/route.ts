import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const secretFromUrl = url.searchParams.get("webhookSecret");
    
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (!secretFromUrl || secretFromUrl !== webhookSecret) {
      console.error("Fraude detectada: A secret enviada na URL não confere.");
      return NextResponse.json({ error: "Acesso Negado" }, { status: 401 });
    }

    const body = await request.json();
    const eventType = body.event; 

    if (eventType === "billing.paid" || eventType === "BILLING.PAID") {
      const email = body.data?.billing?.customer?.metadata?.email;
      const planId = body.data?.billing?.products?.[0]?.externalId;

      if (!email || !planId) {
        console.error("Dados incompletos no Payload", body.data);
        return NextResponse.json({ error: "Dados do usuário ausentes no webhook" }, { status: 400 });
      }

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 30);

      await prisma.user.update({
        where: { email: email },
        data: {
          planId: planId,
          subscriptionStatus: "active",
          subscriptionEnd: dataExpiracao,
        },
      });
      console.log(`Sucesso: Plano ${planId} ativado para ${email}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Erro interno do Webhook:", error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}