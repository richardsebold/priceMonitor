'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";

export async function setChatIdUser(chatId: string) {


    const session = await auth.api.getSession({
        headers: await headers()
    });


    if (!session || !session.user?.id) {
        throw new Error("Usuário não autenticado");
    }

    try {

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id, 
            },
            data: {
                chatId: chatId, 
            },
        });

        return updatedUser;

    } catch (error) {
        console.error("Erro ao salvar Chat ID:", error);
        return null; 
    }
}