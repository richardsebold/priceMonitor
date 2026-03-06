"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "./get-user";

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

  // Monta o payload
  const payload = {

    customer: {
      email: user.email,
      name: user.name,
      phone: user.phone,
      taxId: user.cpf, // CPF ou CNPJ
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
        Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        frequency: "ONE_TIME",
        methods: ["PIX", "CARD"],
        products: [
          {
            externalId: "products.ext",
            name: payload.products[0].name,
            description: payload.products[0].description,
            quantity: 1,
            price: 1990,
          },
        ],
        returnUrl: "http://localhost:3000/dashboard",
        completionUrl: "http://localhost:3000/produtos",
        customerId: "",
        customer: {
          name: payload.customer.name,
          cellphone: payload.customer.phone,
          email: payload.customer.email,
          taxId: payload.customer.taxId,
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



