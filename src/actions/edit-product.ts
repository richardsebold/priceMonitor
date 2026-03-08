'use server'

import { prisma } from "@/lib/prisma";

type EditProduct = {
    idProduct: string,
    newProduct: string
}

export async function editProduct ({idProduct, newProduct} : EditProduct) {

    try {
        if(!idProduct || !newProduct) return

        const editedProduct = await prisma.productHistory.updateMany({
            where: {id: idProduct}, 
            data: {url: newProduct}
        });

        if(!editedProduct) return

        return editedProduct;

    } catch (error) {
        console.error("Erro ao buscar:", error);
    }


}