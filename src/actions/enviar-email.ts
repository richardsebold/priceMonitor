'use server'


import { sendEmail } from "@/lib/email";
import { EmailTemplate } from "../components/email-template";
import { EmailTemplateDrop } from "../components/email-template-drop";
import { ProductHistory } from "../../generated/prisma/client";

export async function sendPriceAlert(product: ProductHistory, userEmail: string, userName: string) {
 try {
     const { data, error } = await sendEmail({
       to: userEmail,
       subject: 'Alerta de Preço Baixo!',
       react: EmailTemplate({ product, userName }),
     });
 
     if (error) {
       console.error("Erro da API do Resend:", error); 
       return Response.json({ error: error.message || error }, { status: 500 });
     }
 
     return Response.json(data);
   } catch (error) {
     console.error("Erro interno/Exceção:", error); 
 
     const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
     return Response.json({ error: errorMessage }, { status: 500 });
   }
}

export async function sendPriceDropAlert(product: ProductHistory, userEmail: string, userName: string, previousPrice: number) {
 try {
     const { data, error } = await sendEmail({
       to: userEmail,
       subject: 'O preço caiu!',
       react: EmailTemplateDrop({ product, userName, previousPrice }),
     });

     if (error) {
       console.error("Erro da API do Resend:", error);
       return Response.json({ error: error.message || error }, { status: 500 });
     }

     return Response.json(data);
   } catch (error) {
     console.error("Erro interno/Exceção:", error);

     const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
     return Response.json({ error: errorMessage }, { status: 500 });
   }
}
