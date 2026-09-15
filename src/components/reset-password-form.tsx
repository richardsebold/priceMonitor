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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ResetPasswordFormValues } from "@/modules/identity/schemas/reset-password";
import { resetPasswordSchema } from "@/modules/identity/schemas/reset-password";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { BorderBeam } from "./ui/border-beam";

export function ResetPasswordForm({
  token,
  className,
  ...props
}: React.ComponentProps<typeof Card> & { token: string | null }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) return;

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      toast.error("Erro ao redefinir senha: " + error.message);
      return;
    }

    toast.success("Senha redefinida com sucesso! Faça login com a nova senha.");
    router.push("/login");
  }

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
        {!token ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-red-100">
                <TriangleAlert className="size-5 text-red-600" />
              </div>
              <CardTitle className="text-xl">Link inválido ou expirado</CardTitle>
              <CardDescription>
                Esse link de redefinição de senha não é mais válido. Peça um
                novo link para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <Button asChild className="cursor-pointer">
                  <a href="/forgot-password">Pedir novo link</a>
                </Button>
              </Field>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Definir nova senha</CardTitle>
              <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="password">Nova senha</FieldLabel>
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
                            <EyeIcon size={20} className="cursor-pointer text-slate-600" />
                          ) : (
                            <EyeOffIcon size={20} className="cursor-pointer text-slate-600" />
                          )}
                        </button>
                      </span>
                    </div>
                    <FieldDescription>
                      {errors.password && (
                        <span className="text-red-500" role="alert">
                          {errors.password?.message as string}
                        </span>
                      )}
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password_confirmation">
                      Confirme a nova senha
                    </FieldLabel>
                    <Input
                      id="password_confirmation"
                      type={isPasswordVisible ? "text" : "password"}
                      {...register("password_confirmation")}
                      disabled={isSubmitting}
                    />
                    <FieldDescription>
                      {errors.password_confirmation && (
                        <span className="text-red-500" role="alert">
                          {errors.password_confirmation?.message as string}
                        </span>
                      )}
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Redefinir senha"
                      )}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
