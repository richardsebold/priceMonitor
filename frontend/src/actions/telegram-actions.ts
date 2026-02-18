'use server'

import { setChatIdUser } from "@/actions/post-chat-id"; // Sua função de salvar no banco

export async function checkAndLinkTelegram(systemUserId: string) {
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_TOKEN) {
        return { success: false, message: "Token do bot não configurado." };
    }

    try {
        // 1. Busca updates no Telegram (Isso roda no servidor, seguro)
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`, {
            cache: 'no-store' // Importante para não cachear a resposta
        });
        
        const data = await response.json();

        if (!data.ok) {
            return { success: false, message: `Erro Telegram: ${data.description}` };
        }

        // 2. Procura a mensagem correta
        // Percorre de trás para frente para achar a mais recente primeiro (opcional)
        const updates = data.result.reverse(); 

        for (const update of updates) {
            if (update.message && update.message.text) {
                const text = update.message.text;
                const chatId = update.message.chat.id.toString(); // Converte para string
                const parts = text.split(' ');

                // Verifica se é /start SEU_ID
                if (parts[0] === '/start' && parts[1] === systemUserId) {
                    
                    // 3. Chama sua função de salvar no banco
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