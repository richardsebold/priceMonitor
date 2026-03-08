"use client";

import { cn } from "@/lib/utils";
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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginFormValues } from "../schema";
import { loginSchema } from "../schema";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { BorderBeam } from "./ui/border-beam";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  async function onSubmit(data: LoginFormValues) {
    const {} = await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onRequest: (ctx) => {
          console.log("User logging in:", ctx);
        },
        onSuccess: (ctx) => {
          toast.success("Login realizado com sucesso!");
          console.log("User logged in:", ctx);
          router.replace("/dashboard");
        },
        onError: (ctx) => {
          toast.error("Erro ao realizar login: " + ctx.error.message);
          console.log("User login failed:", ctx);
        },
      },
    );
  }

  const handleLoginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-2xl relative overflow-hidden">
        <BorderBeam
          duration={8}
          size={300}
          borderWidth={2}
          reverse
          className="from-transparent via-green-500 to-transparent"
        />
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Insira suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  {...register("email")}
                  disabled={isSubmitting}
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    {...register("password")}
                    disabled={isSubmitting}
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
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continue com
              </FieldSeparator>
              <Field>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  type="button"
                  onClick={handleLoginWithGoogle}
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login com Google
                </Button>
                <FieldDescription className="text-center">
                  Não tem uma conta? <a href="/signup">Cadastre-se</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="#">Termos de serviço</a> e{" "}
        <a href="#">Política de Privacidade</a>.
      </FieldDescription>
    </div>
  );
}
