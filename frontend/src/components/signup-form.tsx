"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SignupFormValues } from "../schema";
import { signupSchema } from "../schema";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignupForm({ ...form }: React.ComponentProps<typeof Card>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onChange",
  });

    const handleLoginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };



  async function onSubmit(formData: SignupFormValues) {

    const {} = await authClient.signUp.email(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackURL: "/",

      },
      {
        onRequest: (ctx) => {
          console.log("User registering:", ctx);
        },
        onSuccess: (ctx) => {
          toast.success("Conta criada com sucesso!");
          reset();
          console.log("User registered:", ctx);
          router.replace("/dashboard");
        },

        onError: (ctx) => {
          toast.error("Erro ao criar conta: " + ctx.error.message);
          console.log("User registration failed:", ctx);
        },
      },
    );
  }

  return (
    <Card className="shadow-2xl" {...form}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Crie sua conta</CardTitle>
        <CardDescription>
          Insira seus dados abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-2">
            <Field>
              <FieldLabel htmlFor="firstname">Primeiro Nome</FieldLabel>
              <Input
                id="firstname"
                type="text"
                placeholder="John Doe"
                {...register("name")}
              />
              <FieldDescription>
                {errors.name && (
                  <p className="text-red-500">
                    {errors.name?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              <FieldDescription>
                {errors.email && (
                  <p className="text-red-500" role="alert">
                    {errors.email?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <div className="relative">
                <Input
                  className="relative"
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  {...register("password")}
                />
                <span className="absolute right-3 top-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <EyeIcon
                        size={20}
                        className="cursor-pointer text-slate-600"
                      />
                    ) : (
                      <EyeOffIcon
                        size={20}
                        className="cursor-pointer text-slate-600"
                      />
                    )}
                  </button>
                </span>
              </div>
              <FieldDescription>
                {errors.password && (
                  <p className="text-red-500" role="alert">
                    {errors.password?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirme sua senha
              </FieldLabel>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={isPasswordVisible ? "text" : "password"}
                  {...register("password_confirmation")}
                />
                <span className="absolute right-3 top-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <EyeIcon
                        size={20}
                        className="cursor-pointer text-slate-600"
                      />
                    ) : (
                      <EyeOffIcon
                        size={20}
                        className="cursor-pointer text-slate-600"
                      />
                    )}
                  </button>
                </span>
              </div>
              <FieldDescription>
                {errors.password_confirmation && (
                  <p className="text-red-500" role="alert">
                    {errors.password_confirmation?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            
            
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  className="cursor-pointer disabled:bg-slate-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" color="green" size={50} />
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
                <Button variant="outline" type="button" onClick={handleLoginWithGoogle} disabled={isSubmitting}>
                  Criar conta com Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Já tem uma conta? <a href="#">Entrar</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
