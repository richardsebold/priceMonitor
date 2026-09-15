import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailAndPasswordConfig, emailVerificationConfig } from "./auth-email-verification";
import { sendEmail } from "./email";
import { EmailTemplateResetPassword } from "@/modules/identity/email-templates/email-template-reset-password";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    ...emailAndPasswordConfig,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Redefina sua senha",
        react: EmailTemplateResetPassword({ userName: user.name, url }),
      }).catch((error) => {
        console.error("Erro ao enviar e-mail de redefinição de senha:", error);
      });
    },
  },
  emailVerification: emailVerificationConfig,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [bearer()],
});
