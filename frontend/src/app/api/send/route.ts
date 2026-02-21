// import { EmailTemplate } from '../../../components/email-template';
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST() {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       to: ['richardsebold21@gmail.com'],
//       subject: 'Hello world',
//       react: EmailTemplate({ firstName: 'Richard' }),
//     });

//     if (error) {
//       console.error("Erro da API do Resend:", error); 
//       return Response.json({ error: error.message || error }, { status: 500 });
//     }

//     return Response.json(data);
//   } catch (error) {
//     console.error("Erro interno/Exceção:", error); 

//     const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
//     return Response.json({ error: errorMessage }, { status: 500 });
//   }
// }