import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {

    const body = await request.json();

    // IMPORTANTE: Em produção, você deve verificar a assinatura (signature) do webhook 
    // usando os headers que a AbacatePay envia para garantir que a requisição é legítima e não um hacker.

    // 2. Verifica qual é o tipo de evento (verifique na documentação deles o nome exato do evento de sucesso)
    // Geralmente é algo como "BILLING.PAID" ou "payment.succeeded"
    const eventType = body.event; 

    if (eventType === "billing.paid" || eventType === "BILLING.PAID") {
      
      const email = body.data?.billing?.customer?.metadata?.email;
      const planId = body.data?.billing?.products?.[0]?.externalId;

      if (!email || !planId) {
        console.error("Email ou ID do plano não encontrados! Payload:", JSON.stringify(body.data, null, 2));
        return NextResponse.json({ error: "Dados do usuário ausentes no webhook" }, { status: 400 });
      }

      const dataExpiracao = new Date();
      
      dataExpiracao.setDate(dataExpiracao.getDate() + 30);

      // 4. Atualiza o banco buscando pelo EMAIL em vez do ID
      await prisma.user.update({
        where: { email: email }, // Como o email é único no Prisma, isso funciona perfeitamente
        data: {
          planId: planId,
          subscriptionStatus: "active",
          subscriptionEnd: dataExpiracao, // Salva o vencimento exato do plano
        },
      });

      console.log(`Plano ${planId} ativado com sucesso (e com 30 dias de validade) para o email ${email}`);
    }

    // 5. Retorna 200 OK para a AbacatePay saber que você recebeu a notificação
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}