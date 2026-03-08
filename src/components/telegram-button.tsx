'use client' // <--- Isso torna o componente interativo

import { Button } from "@/components/ui/button";
import { checkAndLinkTelegram } from "@/actions/telegram-actions";
import { useState } from "react";
import { toast } from "sonner"; // Ou use alert, ou seu sistema de toast preferido

interface TelegramButtonProps {
    userId: string;
}

export function TelegramButton({ userId }: TelegramButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleLink = async () => {
        window.open(`https://t.me/PriceTrackerRapidoBot?start=${userId}`, '_blank'); 
    };

    const handleVerify = async () => {
        setLoading(true);
        const result = await checkAndLinkTelegram(userId);
        
        if (result.success) {
            toast.success(result.message); 

        } else {
            toast.error(result.message); 
        }
        setLoading(false);
    }

    return (
        <div className="flex gap-2 mt-2">
            <Button onClick={handleLink} variant="outline">
                1. Abrir Telegram
            </Button>
            
            <Button onClick={handleVerify} disabled={loading}>
                {loading ? "Verificando..." : "2. Confirmar Vínculo"}
            </Button>
        </div>
    );
}