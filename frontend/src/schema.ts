import z from "zod";

export const userRegisterSchema = z.object({
  firstname: z.string().min(1, {"message": "O campo de primeiro nome precisa ser preenchido"}),
  lastname: z.string().min(1, {"message": "O campo de sobrenome precisa ser preenchido"}),
  email: z.string().min(1, {"message": "O campo de email precisa ser preenchido"}),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  password_confirmation: z.string().min(8, {"message": "O campo de confirmação de senha precisa ser preenchido"}),
  phone: z.string().min(1, {"message": "O campo de telefone precisa ser preenchido"}).regex(/^\(\d{2}\) \d{1} \d{4}-\d{4}$/, {"message": "Telefone inválido."}),
  cpf: z.string().min(1, {"message": "O campo de CPF precisa ser preenchido"}).regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {"message": "CPF inválido."}),
  zipcode: z.string().min(1, {"message": "O campo de CEP precisa ser preenchido"}).regex(/^\d{5}-\d{3}$/, {"message": "CEP inválido."}),
  address: z.string().min(1, {"message": "O campo de endereço precisa ser preenchido"}),
  city: z.string().min(1, {"message": "O campo de cidade precisa ser preenchido"}),
  terms: z.boolean({ "message": "Você deve aceitar os termos de serviço" }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não conferem",
  path: ["password_confirmation"],
});

export type UserRegister = z.infer<typeof userRegisterSchema>;