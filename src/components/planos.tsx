'use client'

import { createAbacatePayCheckout } from "@/actions/abacate-pay"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUser } from "@/actions/get-user"
import { useEffect, useState } from "react"

interface Plan {
  name: string
  price: string
  period: string
  planId: string
  description: string
  features: string[]
  isPopular: boolean
}

interface PlansProps {
  currentPlanId?: string | null
}

const plans: Plan[] = [
  {
    name: "Noob",
    price: "Grátis", // Atualizei aqui visualmente para ficar mais claro que é o plano base
    period: "",
    planId: "plano_noob_mensal",
    description: "Ideal para quem está começando.",
    features: ["Acesso básico ao sistema", "Suporte via email", "1 Projeto ativo"],
    isPopular: false,
  },
  {
    name: "Pro",
    price: "R$ 9,90",
    period: "/mês",
    planId: "plano_pro_mensal",
    description: "A escolha certa para crescer.",
    features: [
      "Tudo do plano Noob",
      "Suporte prioritário",
      "Projetos ilimitados",
      "Relatórios avançados",
    ],
    isPopular: true,
  },
  {
    name: "Hacker",
    price: "R$ 19,90",
    period: "/mês",
    planId: "plano_hacker_mensal",
    description: "Poder total para times avançados.",
    features: [
      "Tudo do plano Pro",
      "Acesso à API",
      "Consultoria técnica",
      "IP Dedicado",
    ],
    isPopular: false,
  },
]

export default function Plans({ currentPlanId }: PlansProps) {


  
  const [userPlanId, setUserPlanId] = useState<string | null | undefined>(currentPlanId)

  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      
      if (user && user.planId) {
        setUserPlanId(user.planId);
      }
    }
    fetchUser();
  }, []);

  const activePlanId = userPlanId ?? "plano_noob_mensal"

  const handleSubscribe = async (planId: string) => {

    if (planId === activePlanId || planId === "plano_noob_mensal") return
    
    await createAbacatePayCheckout(planId)
  }
  

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Escolha o plano ideal para você
        </h2>
        <p className="text-muted-foreground">
          Faça upgrade a qualquer momento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrentPlan = plan.planId === activePlanId

          const isFreePlan = plan.planId === "plano_noob_mensal"
          const isDisabled = isCurrentPlan || isFreePlan

          return (
            <Card
              key={plan.planId}
              className={cn(
                "relative flex flex-col transition-shadow overflow-visible",
                plan.isPopular && "border-primary shadow-lg lg:scale-105 z-10",
                isCurrentPlan && !plan.isPopular && "border-primary/50"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Mais Popular</Badge>
                </div>
              )}

              <CardHeader className="pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground font-medium">
                      {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="flex-1 pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 mt-0.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.planId)}
                  disabled={isDisabled}
                  variant={plan.isPopular ? "default" : "outline"}
                  className="w-full cursor-pointer disabled:cursor-not-allowed"
                >

                  {isCurrentPlan 
                    ? "Plano Atual" 
                    : isFreePlan 
                      ? "Plano Gratuito" 
                      : `Assinar ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}