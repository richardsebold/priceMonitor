"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "../../generated/prisma/client";
import { scrapeProduct } from "../actions/scrape-product";
import { getUser } from "./get-user";

const PLAN_LIMITS: Record<string, number> = {
  "plano_noob_mensal": 3,  
  "plano_pro_mensal": 10, 
  "plano_hacker_mensal": 30, 
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

  const existing = await prisma.productHistory.findUnique({
    where: { userId_url: { userId: user.id, url } },
  });
  if (existing) {
    return {
      success: false,
      error: "Você já está monitorando este produto.",
    };
  }

  try {
    const newProduct = await scrapeProduct(url);

    if (!newProduct) {
      return {
        success: false,
        error: "Não foi possível ler os dados deste produto.",
      };
    }

    const produto = await prisma.productHistory.create({
      data: {
        url: url,
        name: newProduct.name,
        price: newProduct.price,
        priceTarget: priceTarget,
        currency: newProduct.currency,
        image: newProduct.image,
        method: newProduct.method,
        store: newProduct.store,
        userId: session.user.id,
      },
    });

    await prisma.priceHistory.create({
      data: {
        price: newProduct.price,
        productId: produto.id,
      },
    });

    return produto;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Este produto já está sendo monitorado.",
      };
    }
    console.error("Erro ao buscar:", error);
    return { success: false, error: "Erro ao cadastrar o produto." };
  }
}
