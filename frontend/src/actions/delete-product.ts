"use server"

import { prisma } from "@/lib/prisma";

export async function deleteProduct (id: string) {
    try {

        if(!id) return

        const deletedProduct = await prisma.productHistory.delete({
            where: {
                id: id
            }
        });

        if(!deletedProduct) return

        
        return deleteProduct;
    }
    catch (error) {
        console.error("Erro ao buscar:", error);
    }
} 