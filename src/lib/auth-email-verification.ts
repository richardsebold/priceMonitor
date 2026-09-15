import { sendEmail } from "./email";
import { sendVerificationEmailSafely } from "@/modules/identity/domain/send-verification-email";
import { VerificationEmail } from "@/modules/identity/email-templates/verification-email";

export const emailAndPasswordConfig = {
  enabled: true,
  requireEmailVerification: true,
} as const;

export const emailVerificationConfig = {
  sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
    void sendVerificationEmailSafely(() =>
      sendEmail({
        to: user.email,
        subject: "Confirme seu e-mail - Monitorador de Preços",
        react: VerificationEmail({ userName: user.name, url }),
      }),
    );
  },
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  expiresIn: 3600,
} as const;
