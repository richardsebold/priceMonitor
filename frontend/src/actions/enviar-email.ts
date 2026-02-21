
import { Resend } from "resend";
import { EmailTemplate } from "../components/email-template";
import { ProductHistory, User } from "../../generated/prisma/client";

export async function sendPriceAlert( product: ProductHistory, user: User) {

  const resend = new Resend(process.env.RESEND_API_KEY as string);

 try {
     const { data, error } = await resend.emails.send({
       from: 'Acme <onboarding@resend.dev>',
       to: ['richardsebold21@gmail.com'],
       subject: 'Hello world',
       react: EmailTemplate({ product, user }),
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
