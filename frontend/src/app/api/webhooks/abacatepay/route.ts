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

    if (eventType === "BILLING.PAID") {
      // 3. Extrai o metadata que nós enviamos lá no checkout
      const { userId, planId } = body.data.metadata;

      // 4. Atualiza o usuário no banco de dados usando o Prisma
      await prisma.user.update({
        where: { id: userId },
        data: {
          planId: planId
        },
      });

      console.log(`Plano atualizado com sucesso para o usuário ${userId}`);
    }

    // 5. Retorna 200 OK para a AbacatePay saber que você recebeu a notificação
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}