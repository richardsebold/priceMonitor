import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Sidebar from "@/components/sidebar"
import Link from "next/link"
import { SignupReform } from "@/components/signup-reform"
import { useEffect, useState } from "react"
import { getUser } from "@/actions/get-user"

export default function SettingsPage() {

const [userInfos, setUserInfos] = useState(null);

useEffect(() => {
  async function fetchUser() {
    try {
      const user = await getUser();
      setUserInfos(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  fetchUser();
}, []);


  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      
      <Sidebar />


      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e preferências de e-mail.
        </p>
      </div>

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
                <p className="font-medium">Plano Atual: Noob</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Você está no plano gratuito. Limite de 1 produto.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Link href="/planos">
              <Button variant="default"  className="cursor-pointer">Fazer Upgrade</Button>
              </Link>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                Cancelar Assinatura
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}