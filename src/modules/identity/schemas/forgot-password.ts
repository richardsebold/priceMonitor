import z from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O campo de email precisa ser preenchido" })
    .email({ message: "Informe um email válido" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
