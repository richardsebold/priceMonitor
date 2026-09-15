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
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ForgotPasswordFormValues } from "@/modules/identity/schemas/forgot-password";
import { forgotPasswordSchema } from "@/modules/identity/schemas/forgot-password";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { BorderBeam } from "./ui/border-beam";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/reset-password",
    });

    if (error) {
      toast.error("Erro ao pedir redefinição de senha: " + error.message);
      return;
    }

    setIsSent(true);
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
        {isSent ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-green-100">
                <MailCheck className="size-5 text-green-600" />
              </div>
              <CardTitle className="text-xl">Verifique seu e-mail</CardTitle>
              <CardDescription>
                Se esse e-mail estiver cadastrado, enviamos um link para
                redefinir sua senha. O link expira em 1 hora.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldDescription className="text-center">
                Lembrou a senha? <a href="/login">Voltar para o login</a>
              </FieldDescription>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Esqueceu sua senha?</CardTitle>
              <CardDescription>
                Informe seu e-mail e enviaremos um link para redefinir sua
                senha
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
                        <span className="text-red-500" role="alert">
                          {errors.email?.message as string}
                        </span>
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
                          Enviando...
                        </>
                      ) : (
                        "Enviar link de redefinição"
                      )}
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Lembrou a senha? <a href="/login">Voltar para o login</a>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
