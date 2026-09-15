import z from "zod";

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    password_confirmation: z
      .string()
      .min(1, { message: "O campo de confirmação de senha precisa ser preenchido" }),
  })
  .refine((formData) => formData.password === formData.password_confirmation, {
    message: "As senhas não conferem",
    path: ["password_confirmation"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
