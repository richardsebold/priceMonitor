'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";   
import { headers } from "next/headers";

export async function getProducts () {

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user?.id) {
        return [];
    }

    
    try {
    const products = await prisma.productHistory.findMany({
        where: {
            userId: session.user.id
        }
    });
    if(!products)  return
    return products;

    }
    catch (error) {
        console.error("Erro ao buscar:", error);
    }
}

getProducts();