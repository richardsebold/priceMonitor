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
import { useEffect, useState } from "react";
import { useHookFormMask } from "use-mask-input";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Checkbox } from "./ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signupReformSchema, SignupReformValues } from "@/schema-reform";
import { getUser } from "@/actions/get-user";
import { updateUserData } from "@/actions/update-user";

export function SignupReform({ ...props }: React.ComponentProps<typeof Card>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
    control,
  } = useForm<SignupReformValues>({
    resolver: zodResolver(signupReformSchema),
    mode: "onChange",
  });

  const registerWithMask = useHookFormMask(register);

  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      if (user) {
        setValue("email", user.email || "");
        setValue("firstname", user.name?.split(" ")[0] || "");
        setValue("lastname", user.name?.split(" ")[1] || "");
        setValue("cpf", user.cpf || "");
        setValue("phone", user.phone || "");
        setValue("zipcode", user.zipCode || "");
        setValue("address", user.address || "");
        setValue("city", user.city || "");
      }
    }
    fetchUser();
  }, [setValue]);

  async function handleZipCodeBlur(event: React.FocusEvent<HTMLInputElement>) {
    const zipCode = event.target.value;

    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${zipCode}`);

    if (res.ok) {
      const data = await res.json();
      setValue("address", data.street);
      setValue("city", data.city);
    }
  }

  async function onSubmit(formData: SignupReformValues) {
    console.log("Form Data Submitted:", formData);

    const result = await updateUserData(formData);

    if (result.success) {
      toast.success("Dados cadastrados com sucesso!");
      router.push("/dashboard");
    } else {
      toast.error(result.error || "Ocorreu um erro no cadastro.");
    }
  }

  return (
    <Card className="shadow-2xl" {...props}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Atualize seus dados
        </CardTitle>
        <CardDescription>
          Mantenha seus dados atualizados para ter uma melhor experiência.
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
                className="disabled:bg-slate-200"
                disabled
                {...register("firstname")}
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
                {...register("lastname")}
                className="disabled:bg-slate-200"
                disabled
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
                {...register("email")}
                className="disabled:bg-slate-200"
                disabled
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
            <Field>
              <FieldLabel htmlFor="phone">Telefone Celular</FieldLabel>
              <Input
                id="phone"
                type="text"
                placeholder="(00) 0 0000-0000"
                {...registerWithMask("phone", "(99) 9 9999-9999")}
              />
              <FieldDescription>
                {errors.phone && (
                  <p className="text-red-500" role="alert">
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
                {...registerWithMask("cpf", "999.999.999-99")}
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
                    <a href="/termos" className="underline">
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
                    <Loader className="animate-spin" color="green" size={50} />
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
