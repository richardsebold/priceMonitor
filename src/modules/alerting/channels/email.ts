import type { ReactElement } from "react";
import { sendEmail } from "@/lib/email";
import { EmailTemplate } from "../email-templates/email-template";
import { EmailTemplateDrop } from "../email-templates/email-template-drop";
import type { ProductHistory } from "../../../../generated/prisma/client";

async function deliver(to: string, subject: string, react: ReactElement) {
  try {
    const { error } = await sendEmail({ to, subject, react });
    if (error) console.error("Erro da API do Resend:", error);
  } catch (error) {
    console.error("Erro interno/Exceção:", error);
  }
}

export function sendPriceAlert(product: ProductHistory, userEmail: string, userName: string) {
  return deliver(userEmail, "Alerta de Preço Baixo!", EmailTemplate({ product, userName }));
}

export function sendPriceDropAlert(
  product: ProductHistory,
  userEmail: string,
  userName: string,
  previousPrice: number,
) {
  return deliver(
    userEmail,
    "O preço caiu!",
    EmailTemplateDrop({ product, userName, previousPrice }),
  );
}
