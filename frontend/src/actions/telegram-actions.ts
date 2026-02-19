'use server'

import { setChatIdUser } from "@/actions/post-chat-id"; 

export async function checkAndLinkTelegram(systemUserId: string) {
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_TOKEN) {
        return { success: false, message: "Token do bot não configurado." };
    }

    try {

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`, { 
            cache: 'no-store' 
        });
        
        const data = await response.json();

        if (!data.ok) {
            return { success: false, message: `Erro Telegram: ${data.description}` };
        }

        const updates = data.result.reverse(); 

        for (const update of updates) {
            if (update.message && update.message.text) {
                const text = update.message.text;
                const chatId = update.message.chat.id.toString();
                const parts = text.split(' ');


                if (parts[0] === '/start' && parts[1] === systemUserId) {
                    
                    await setChatIdUser(chatId);
                    
                    return { success: true, message: "Vinculado com sucesso!" };
                }
            }
        }

        return { success: false, message: "Mensagem de ativação não encontrada. Clique no link e inicie o bot primeiro." };

    } catch (error) {
        console.error("Erro server action:", error);
        return { success: false, message: "Erro interno no servidor." };
    }
}