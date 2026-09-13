'use server'

import { getSessionUserId } from "@/modules/identity/session";
import { setChatId } from "../infra/notification-repository";

export async function setChatIdUser(chatId: string) {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  try {
    return await setChatId(userId, chatId);
  } catch (error) {
    console.error("Erro ao salvar Chat ID: ", error);
    return null;
  }
}
