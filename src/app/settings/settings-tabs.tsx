'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { SignupReform } from "@/components/signup-reform"
import type { getUser } from "@/actions/get-user"

type UserWithPlan = Awaited<ReturnType<typeof getUser>>

interface SettingsTabsProps {
  userInfos: UserWithPlan
}

export function SettingsTabs({ userInfos }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:w-100">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="notifications">Notificações</TabsTrigger>
        <TabsTrigger value="billing">Assinatura</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <SignupReform />
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Escolha o que você deseja receber no seu e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Alertas de Preço</Label>
                <p className="text-sm text-muted-foreground">
                  Receba um e-mail quando a meta for atingida ou o preço cair 10% do primeiro valor cadastrado.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Resumo Semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Um relatório com as variações dos seus produtos.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>
              Gerencie seu plano atual e informações de faturamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="font-medium">Plano Atual: {userInfos?.plan?.name || "Gratuito"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Você está no plano gratuito. Limite de 1 produto.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Link href="/planos">
              <Button variant="default" className="cursor-pointer">Fazer Upgrade</Button>
            </Link>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              Cancelar Assinatura
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
