
import z from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, {"message": "O campo de email precisa ser preenchido"}),
  password: z.string().min(1, {"message": "O campo de senha precisa ser preenchido"}),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(1, {"message": "O campo de nome precisa ser preenchido"}).max(100, {"message": "O campo de nome precisa ter menos de 100 caracteres"}),
  email: z.string().min(1, {"message": "O campo de email precisa ser preenchido"}),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  password_confirmation: z.string().min(1, {"message": "O campo de confirmação de senha precisa ser preenchido"}),
}).refine((formData) => formData.password === formData.password_confirmation, {
  message: "As senhas não conferem",
  path: ["password_confirmation"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;