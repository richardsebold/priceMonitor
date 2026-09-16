import { NextResponse } from "next/server";
import { handleAbacatePayWebhook } from "@/modules/billing/application/handle-webhook-event";
import { secretsMatch } from "@/lib/secure-compare";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);

    const secretFromUrl = url.searchParams.get("webhookSecret");
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (!secretsMatch(secretFromUrl, webhookSecret)) {
      return NextResponse.json({ error: "Acesso Negado" }, { status: 401 });
    }

    await handleAbacatePayWebhook(await request.json());

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}
