const ABACATEPAY_API = "https://api.abacatepay.com/v2";

async function post(path: string, body: unknown) {
  const response = await fetch(`${ABACATEPAY_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return { ok: response.ok, data: await response.json() };
}

export async function createSubscriptionCheckout(params: {
  productId: string;
  userId: string;
  planId: string;
}): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const { ok, data } = await post("/subscriptions/create", {
    items: [{ id: params.productId, quantity: 1 }],
    methods: ["CARD"],
    returnUrl: `${appUrl}/cancelado`,
    completionUrl: `${appUrl}/sucesso`,
    metadata: { userId: params.userId, planId: params.planId },
  });

  if (!ok) {
    console.error("Erro na AbacatePay:", data);
    throw new Error("Falha ao criar a assinatura.");
  }

  const checkoutUrl = data.data?.url || data.url;

  if (!checkoutUrl) {
    console.error("Resposta inesperada:", data);
    throw new Error("A API não retornou o link de pagamento.");
  }

  return checkoutUrl;
}

export async function cancelSubscription(subscriptionId: string) {
  const { ok, data } = await post("/subscriptions/cancel", { id: subscriptionId });

  if (!ok) {
    console.error("Erro ao cancelar assinatura:", data);
    throw new Error("Falha ao cancelar a assinatura.");
  }
}
