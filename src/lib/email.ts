import type { ReactElement } from "react";
import { Resend } from "resend";

type EmailMessage =
  | { to: string; subject: string; react: ReactElement }
  | { to: string; subject: string; text: string };

export async function sendEmail(message: EmailMessage) {
  const resend = new Resend(process.env.RESEND_API_KEY as string);
  const from = `Monitorador de Preços <${process.env.EMAIL_ADDRESS}>`;
  return resend.emails.send({ from, ...message });
}
