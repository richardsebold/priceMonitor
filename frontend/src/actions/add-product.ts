"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function NewProduct (product: string) {

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user?.id) {
        return [];
    }

    try {

        if(!product) return

        const newProduct = await prisma.productHistory.create({
            data: {
                url: product,
                userId: session.user.id
            }
        });

        if(!newProduct) return

        return newProduct;
    }
    catch (error) {
        console.error("Erro ao buscar:", error);
    }
}