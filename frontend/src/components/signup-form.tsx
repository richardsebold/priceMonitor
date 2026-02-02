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
import { useHookFormMask } from "use-mask-input";
import { FieldValues, useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Checkbox } from "./ui/checkbox";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [address, setAddress] = useState({ city: "", street: "" });

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    control,
  } = useForm({
    mode: "onChange",
  });

  const registerWithMask = useHookFormMask(register);

  async function handleZipCodeBlur(event: React.FocusEvent<HTMLInputElement>) {
    const zipCode = event.target.value;

    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${zipCode}`);

    if (res.ok) {
      const data = await res.json();
      setAddress({
        city: data.city,
        street: data.street,
      });
    }
  }

  async function onSubmit(data: FieldValues) {
    console.log("Form Data Submitted:");
    console.log(data);

    const res = await fetch("https://apis.codante.io/api/register-user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.log(resData);
      for (const field in resData.errors) {
        setError(field, { type: "manual", message: resData.errors[field] });
      }
    } else {
      console.log(resData);
      
    }
  }

  return (
    <Card {...props}>
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
                {...register("firstname", {
                  required: "O campo primeiro nome precisa ser preenchido",
                  minLength: {
                    value: 3,
                    message: "O nome deve ter no mínimo 3 caracteres",
                  },
                  maxLength: {
                    value: 50,
                    message: "O nome deve ter no máximo 50 caracteres",
                  },
                })}
              />
              <FieldDescription>
                  {errors.firstname && (
                  <p className="text-red-500" role="alert">
                    {errors.firstname?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="lastname">Sobrenome</FieldLabel>
              <Input
                id="lastname"
                type="text"
                placeholder="Doe"
                {...register("lastname", {
                  required: "O campo sobrenome precisa ser preenchido",
                  minLength: {
                    value: 2,
                    message: "O sobrenome deve ter no mínimo 2 caracteres",
                  },
                  maxLength: {
                    value: 50,
                    message: "O sobrenome deve ter no máximo 50 caracteres",
                  },
                })}
              />
              <FieldDescription>
                {errors.lastname && (
                  <p className="text-red-500" role="alert">
                    {errors.lastname?.message as string}
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
                {...register("email", {
                  required: "O campo email precisa ser preenchido",
                  pattern: {
                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                    message: "Endereço de email inválido",
                  },
                })}
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
                  {...register("password", {
                    required: "O campo senha precisa ser preenchido",
                    minLength: {
                      value: 8,
                      message: "A senha deve ter no mínimo 8 caracteres",
                    },
                  })}
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
                  {...register("password_confirmation", {
                    required:
                      "O campo de confirmação da senha precisa ser preenchido",
                    minLength: {
                      value: 8,
                      message:
                        "A confirmaçáo da senha deve ter no mínimo 8 caracteres",
                    },
                    validate(value, formValues) {
                      if (value === formValues.password) return true;
                      return "As senhas não coincidem";
                    },
                    
                  })}
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
            <Field>
              <FieldLabel htmlFor="phone">Telefone Celular</FieldLabel>
              <Input
                id="phone"
                type="text"
                placeholder="(00) 0 0000-0000"
                {...registerWithMask("phone", "(99) 9 9999-9999", {
                  required: "O campo telefone precisa ser preenchido",
                  pattern: {
                    value: /^\(\d{2}\) \d{1} \d{4}-\d{4}$/,
                    message: "Telefone inválido",
                  },
                })}
              />
              <FieldDescription>
                {errors.phone && (
                  <p className="text-red-500">
                    {errors.phone?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="cpf" className="">
                CPF
              </FieldLabel>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                {...registerWithMask("cpf", "999.999.999-99", {
                  required: "O campo CPF precisa ser preenchido",
                  pattern: {
                    value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                    message: "CPF inválido",
                  },
                })}
              />

              <FieldDescription className="">
                {errors.cpf && (
                  <p className="text-red-500" role="alert">
                    {errors.cpf?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="cep">CEP</FieldLabel>
              <Input
                id="cep"
                type="text"
                placeholder="00000-000"
                {...registerWithMask("zipcode", "99999-999", {
                  required: "O campo CEP precisa ser preenchido",
                  pattern: { value: /^\d{5}-\d{3}$/, message: "CEP inválido" },
                  onBlur: handleZipCodeBlur,
                })}
              />
              <FieldDescription className="">
                {errors.zipcode && (
                  <p className="text-red-500" role="alert">
                    {errors.zipcode?.message as string}
                  </p>
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Endereço</FieldLabel>
              <Input
                id="address"
                type="text"
                placeholder="Rua"
                className="disabled:bg-slate-200"
                value={address.street}
                {...register("address")}
                disabled
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="city">Cidade</FieldLabel>
              <Input
                id="city"
                type="text"
                placeholder="Cidade"
                className="disabled:bg-slate-200"
                value={address.city}
                {...register("city")}
                disabled
              />
            </Field>
            <FieldGroup className="py-2 w-76">

              <Field>

                <div className="flex items-center gap-2">
                  <Controller
                    name="terms"
                    control={control}
                    rules={{
                      required:
                        "Você precisa aceitar os termos e condições para continuar",
                    }}
                    render={({ field }) => (
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />

                  <FieldLabel htmlFor="terms">
                    Aceito os{" "}
                    <a href="#" className="underline">
                      termos e condições de uso
                    </a>
                  </FieldLabel>
                </div>


                <FieldDescription className="">
                  {errors.terms && (
                    <p className="text-red-500">
                      {errors.terms.message as string}
                    </p>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  className="cursor-pointer disabled:bg-slate-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
                <Button variant="outline" type="button">
                  Criar conta com Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Já tem uma conta? <a href="login">Entrar</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
