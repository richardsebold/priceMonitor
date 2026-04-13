

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    
    const signatureHeader = request.headers.get("x-abacatepay-signature");
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (!signatureHeader || !webhookSecret) {
      return NextResponse.json({ error: "Acesso Negado" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signatureHeader !== expectedSignature) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const eventType = body.event; 

    if (eventType === "billing.paid" || eventType === "BILLING.PAID") {
      const email = body.data?.billing?.customer?.metadata?.email;
      const planId = body.data?.billing?.products?.[0]?.externalId;

      if (!email || !planId) {
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
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}