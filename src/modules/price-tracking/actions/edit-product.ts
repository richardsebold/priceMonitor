'use server'

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/modules/identity/session";

type EditProduct = {
  idProduct: string;
  newProduct: string;
};

export async function editProduct({ idProduct, newProduct }: EditProduct) {
  try {
    if (!idProduct || !newProduct) return;

    const userId = await getSessionUserId();
    if (!userId) return;

    const result = await prisma.productHistory.updateMany({
      where: { id: idProduct, userId },
      data: { url: newProduct },
    });

    return result.count > 0 ? result : undefined;
  } catch (error) {
    console.error("Erro ao buscar:", error);
  }
}
