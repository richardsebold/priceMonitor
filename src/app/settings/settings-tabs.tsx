'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SignupReform } from "@/components/signup-reform"
import { cancelAbacatePaySubscription } from "@/actions/abacate-pay"
import { setPriceAlertsEnabled } from "@/actions/update-notification-prefs"
import type { getUser } from "@/actions/get-user"

type UserWithPlan = Awaited<ReturnType<typeof getUser>>

interface SettingsTabsProps {
  userInfos: UserWithPlan
}

function formatEndDate(date: Date | string | null | undefined) {
  if (!date) return null
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function SettingsTabs({ userInfos }: SettingsTabsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const planName = userInfos?.plan?.name || "Gratuito"
  const endDateLabel = formatEndDate(userInfos?.subscriptionEnd)
  const status = userInfos?.subscriptionStatus
  const hasActiveSubscription =
    !!userInfos?.plan && status !== "FREE" && status !== "CANCELLED"

  const [priceAlerts, setPriceAlerts] = useState(
    userInfos?.priceAlertsEnabled ?? true,
  )
  const [isUpdatingAlerts, setIsUpdatingAlerts] = useState(false)

  async function handleTogglePriceAlerts(checked: boolean) {
    const previous = priceAlerts
    setPriceAlerts(checked)
    setIsUpdatingAlerts(true)
    try {
      await setPriceAlertsEnabled(checked)
      toast.success(
        checked ? "Alertas de preço ativados." : "Alertas de preço desativados.",
      )
    } catch (err) {
      setPriceAlerts(previous)
      const message =
        err instanceof Error ? err.message : "Falha ao salvar preferência."
      toast.error(message)
    } finally {
      setIsUpdatingAlerts(false)
    }
  }

  function handleCancel() {
    startTransition(async () => {
      try {
        await cancelAbacatePaySubscription()
        toast.success("Assinatura cancelada com sucesso.")
        setOpen(false)
        router.refresh()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Falha ao cancelar a assinatura."
        toast.error(message)
      }
    })
  }

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
              <Switch
                checked={priceAlerts}
                disabled={isUpdatingAlerts}
                onCheckedChange={handleTogglePriceAlerts}
              />
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
              <p className="font-medium">Plano Atual: {planName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Seu plano renovará automaticamente em {endDateLabel}. 
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Para saber mais detalhes do seu plano acesse a página de planos.{" "}
                <Link href="/planos" className="underline">
                  Planos
                </Link>
              </p>
              {status === "CANCELLED" && endDateLabel && (
                <p className="text-sm text-destructive mt-2">
                  Assinatura cancelada. Você terá acesso ao plano {planName} até{" "}
                  {endDateLabel}, quando voltará automaticamente para o plano
                  gratuito.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Link href="/planos">
              <Button variant="default" className="cursor-pointer">
                Fazer Upgrade
              </Button>
            </Link>

            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                  disabled={!hasActiveSubscription}
                >
                  Cancelar Assinatura
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Cancelar a assinatura do plano {planName}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Você não será mais cobrado nas próximas datas de renovação.
                    {endDateLabel ? (
                      <>
                        {" "}
                        Seu acesso ao plano <strong>{planName}</strong>{" "}
                        permanecerá ativo até <strong>{endDateLabel}</strong>{" "}
                        (30 dias após a sua última cobrança). A partir dessa
                        data, sua conta voltará automaticamente para o plano
                        gratuito.
                      </>
                    ) : (
                      <>
                        {" "}
                        Seu acesso ao plano <strong>{planName}</strong>{" "}
                        permanecerá ativo até o fim do período já pago (30 dias
                        após a sua última cobrança). Depois disso, sua conta
                        voltará automaticamente para o plano gratuito.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    Manter assinatura
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleCancel()
                    }}
                    disabled={isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  >
                    {isPending ? "Cancelando..." : "Confirmar cancelamento"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
