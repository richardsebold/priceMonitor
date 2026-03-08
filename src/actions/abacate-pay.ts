"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "./get-user";
import { redirect } from "next/navigation";

export async function createAbacatePayCheckout(planId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Plano não encontrado");
  }

  const user = await getUser();

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const payload = {
    customer: {
      email: user.email,
      name: user.name,
      phone: user.phone,
      taxId: user.cpf,
    },

    products: [
      {
        externalId: plan.id,
        name: plan.name,
        quantity: 1,
        price: plan.price,
        description: plan.description || "Assinatura mensal do Price Tracker",
      },
    ],
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      frequency: "ONE_TIME",
      methods: ["PIX", "CARD"],
      products: [
        {
          externalId: payload.products[0].externalId,
          name: payload.products[0].name,
          description: payload.products[0].description,
          quantity: 1,
          price: payload.products[0].price
        },
      ],
      returnUrl: "http://localhost:3000/cancelado",
      completionUrl: "http://localhost:3000/sucesso",
      customer: {
        name: payload.customer.name,
        cellphone: payload.customer.phone,
        email: payload.customer.email,
        taxId: payload.customer.taxId,
      },
      allowCoupons: false,
      coupons: ["TTEESSTTE10", "tEsTe10", "PRACA10"],
      metadata: {
        userId: user.id, 
        planId: plan.id,
      },
    }),
  };

  const response = await fetch(
    "https://api.abacatepay.com/v1/billing/create",
    options,
  );
  const data = await response.json();

  if (!response.ok) {
    console.error("Erro na AbacatePay:", data);
    throw new Error("Falha ao criar o checkout de pagamento.");
  }

  const checkoutUrl = data.data?.url || data.url;

  if (!checkoutUrl) {
    console.error("Resposta inesperada:", data);
    throw new Error("A API não retornou o link de pagamento.");
  }

  redirect(checkoutUrl);
}
