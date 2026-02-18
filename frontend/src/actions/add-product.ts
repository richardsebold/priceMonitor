"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { scrapeProduct } from "../actions/scrape-product";


export async function NewProduct(url: string, priceTarget: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    return [];
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

    return produto;

  } catch (error) {
    console.error("Erro ao buscar:", error);
  }
}
