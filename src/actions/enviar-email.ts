'use server'


import { Resend } from "resend";
import { EmailTemplate } from "../components/email-template";
import { ProductHistory } from "../../generated/prisma/client";

export async function sendPriceAlert(product: ProductHistory, userEmail: string, userName: string) {

  const resend = new Resend(process.env.RESEND_API_KEY as string);

 try {
     const { data, error } = await resend.emails.send({
       from: `Monitorador de Preços <${process.env.EMAIL_ADDRESS}>`,
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
