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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SignupReform } from "@/components/signup-reform"
import { DeleteAccount } from "@/components/delete-account"
import { cancelAbacatePaySubscription } from "@/actions/abacate-pay"
import { setPriceAlertsEnabled } from "@/actions/update-notification-prefs"
import {
  CANCELLATION_REASONS,
  isWithinRefundWindow,
  refundDeadline,
  REFUND_WINDOW_DAYS,
  type CancellationReason,
} from "@/lib/refund"
import type { getUser } from "@/actions/get-user"

type UserWithPlan = Awaited<ReturnType<typeof getUser>>

interface SettingsTabsProps {
  userInfos: UserWithPlan
}

function formatDate(date: Date | string | null | undefined) {
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
  const [reason, setReason] = useState<CancellationReason | "">("")
  const [comment, setComment] = useState("")

  const planName = userInfos?.plan?.name || "Gratuito"
  const endDateLabel = formatDate(userInfos?.subscriptionEnd)
  const status = userInfos?.subscriptionStatus
  const hasActiveSubscription =
    !!userInfos?.plan && status !== "FREE" && status !== "CANCELLED"

  const refundEligible =
    hasActiveSubscription && isWithinRefundWindow(userInfos?.subscriptionStart)
  const refundDeadlineLabel = formatDate(
    refundDeadline(userInfos?.subscriptionStart),
  )

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
    if (!reason) {
      toast.error("Selecione o motivo do cancelamento.")
      return
    }
    startTransition(async () => {
      try {
        const result = await cancelAbacatePaySubscription({
          reason,
          comment: comment.trim() || undefined,
        })
        if (result.refundRequested) {
          toast.success(
            "Assinatura cancelada. Seu reembolso foi solicitado e será processado em breve.",
          )
        } else {
          toast.success("Assinatura cancelada com sucesso.")
        }
        setOpen(false)
        setReason("")
        setComment("")
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

      <TabsContent value="profile" className="space-y-6">
        <SignupReform />
        <DeleteAccount />
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
              {refundEligible && (
                <p className="text-sm text-emerald-600 mt-2">
                  Você está no período de garantia de {REFUND_WINDOW_DAYS} dias.
                  Se cancelar até {refundDeadlineLabel}, receberá o reembolso
                  integral do valor pago.
                </p>
              )}
              {status === "CANCELLED" && userInfos?.refundRequested && (
                <p className="text-sm text-emerald-600 mt-2">
                  Cancelamento dentro do prazo de {REFUND_WINDOW_DAYS} dias. Seu
                  reembolso foi solicitado e será processado em breve.
                </p>
              )}
              {status === "CANCELLED" &&
                !userInfos?.refundRequested &&
                endDateLabel && (
                  <p className="text-sm text-destructive mt-2">
                    Assinatura cancelada. Você terá acesso ao plano {planName}{" "}
                    até {endDateLabel}, quando voltará automaticamente para o
                    plano gratuito.
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

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                  disabled={!hasActiveSubscription}
                >
                  Cancelar Assinatura
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Cancelar a assinatura do plano {planName}?
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-2">
                      {refundEligible ? (
                        <span className="block">
                          Você está dentro do prazo de garantia de{" "}
                          {REFUND_WINDOW_DAYS} dias: ao confirmar, sua assinatura
                          será encerrada agora e você receberá o{" "}
                          <strong>reembolso integral</strong> do valor pago.
                        </span>
                      ) : (
                        <span className="block">
                          Você não será mais cobrado nas próximas renovações. Seu
                          acesso ao plano <strong>{planName}</strong> permanecerá
                          ativo até{" "}
                          <strong>
                            {endDateLabel ?? "o fim do período já pago"}
                          </strong>
                          . Depois disso, sua conta voltará automaticamente para
                          o plano gratuito.
                        </span>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancel-reason">
                      Por que você está cancelando?
                    </Label>
                    <Select
                      value={reason || undefined}
                      onValueChange={(v) => setReason(v as CancellationReason)}
                    >
                      <SelectTrigger id="cancel-reason" className="w-full">
                        <SelectValue placeholder="Selecione um motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {CANCELLATION_REASONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancel-comment">
                      Quer contar mais? (opcional)
                    </Label>
                    <Textarea
                      id="cancel-comment"
                      placeholder="Descreva o que motivou o cancelamento..."
                      value={comment}
                      maxLength={1000}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isPending}>
                      Manter assinatura
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleCancel}
                    disabled={isPending || !reason}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  >
                    {isPending ? "Cancelando..." : "Confirmar cancelamento"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
