import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    
    const signatureHeader = request.headers.get("x-webhook-signature") || request.headers.get("x-abacate-signature");
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (!signatureHeader || !webhookSecret) {
      console.error("Falha na Segurança: Faltando assinatura ou secret configurado na Vercel.");
      return NextResponse.json({ error: "Acesso Negado" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signatureHeader !== expectedSignature) {
      console.error("Fraude detectada: A assinatura gerada não bate com a enviada.");
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
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