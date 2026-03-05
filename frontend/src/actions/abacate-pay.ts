"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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

  // Monta o payload
  const payload = {

    customer: {
      email: session.user.email,
      name: session.user.name,
      // phone: session.user.phone  Pegar no db, usar apenas o session id para buscar o usuario no banco e retornar de forma completa ele.
      // As demais propriedades do cliente (cellphone, taxId) podem ser opcionais ou preenchidas com dados fictícios para testes

    },

    products: [
      {
        externalId: plan.id, // O ID do banco
        name: plan.name, // Ex: "Plano Ilimitado"
        quantity: 1, // Sempre 1 assinatura
        price: plan.price, // Lembre-se: em centavos! (Ex: 1500)
        description: plan.description || "Assinatura mensal do Price Tracker",
      },
    ],

  };

  // 4. Faz a requisição para a API da AbacatePay

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer abc_dev_j4Ng5w5fmqBdRtq4cDfhnazA",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        frequency: "ONE_TIME",
        methods: ["PIX", "CARD"],
        products: [
          {
            externalId: "products.ext",
            name: "Plano Hacker",
            description: payload.products[0].description,
            quantity: 1,
            price: 1990,
          },
        ],
        returnUrl: "http://localhost:3000/dashboard",
        completionUrl: "http://localhost:3000/produtos",
        customerId: "cust_abcdefghij",
        customer: {
          name: payload.customer.name,
          cellphone: "47997714395",
          email: payload.customer.email,
          taxId: "12537948980",
        },
        allowCoupons: false,
        coupons: ["TTEESSTTE10", "tEsTe10", "PRACA10"],
        externalId: "seu_id_123",
        metadata: { externalId: "123" },
      }),
    };

    fetch("https://api.abacatepay.com/v1/billing/create", options)
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));

    }



