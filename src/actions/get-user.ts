'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";   
import { headers } from "next/headers";

export async function getUser () {



    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user?.id) {
        return null;
    }

    
    try {
    const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });


    if(!user)  return
    
    return user;

    }
    catch (error) {
        console.error("Erro ao buscar:", error);
    }
}

getUser();