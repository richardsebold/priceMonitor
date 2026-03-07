"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { scrapeProduct } from "../actions/scrape-product";
import { getUser } from "./get-user";

const PLAN_LIMITS: Record<string, number> = {
  "plano_free": 1,          // 0 projetos
  "plano_noob_mensal": 7,   // 1 projeto
  "plano_pro_mensal": 15, // Ilimitado (um número bem alto)
  "plano_hacker_mensal": 30, // Ilimitado
};


export async function NewProduct(url: string, priceTarget: number) {

  const user = await getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    return { success: false, error: "Sessão não encontrada." };
  }
  
  const currentPlan = user.planId || "plano_free";
  const limitForThisPlan = PLAN_LIMITS[currentPlan] || 0;


  const currentUrlCount = await prisma.productHistory.count({
    where: {
      userId: user.id, // Filtra apenas as URLs que pertencem a este usuário
    },
  });

  if (currentUrlCount >= limitForThisPlan) {
    return { 
      success: false, 
      error: "Você atingiu o limite de URLs do seu plano. Faça um upgrade para rastrear mais produtos!" 
    };
  }

  try {
    if (!url) return;

    const newProduct = await scrapeProduct(url);

    if (!newProduct) return;

    const produto = await prisma.productHistory.create({
      data: {
        url: url,
        name: newProduct.name,
        price: newProduct.price,
        priceTarget: priceTarget,
        currency: newProduct.currency,
        image: newProduct.image,
        method: newProduct.method,
        userId: session.user.id,
      },
    });

    if (!produto) return;

    await prisma.priceHistory.create({
      data: {
        price: newProduct.price,
        productId: produto.id,
      },
    }); 

    return produto;

  } catch (error) {
    console.error("Erro ao buscar:", error);
  }
}
