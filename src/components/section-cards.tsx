import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartSpline, PackageSearch, PiggyBank, Target } from "lucide-react"
import type { ProductHistory } from "../../generated/prisma/client"

type DropData = {
  name: string | null
  drop: string
  oldPrice: number
  currentPrice: number
} | null

interface SectionCardsProps {
  products: ProductHistory[]
  reachedTargets: number
  potentialSavings: number
  biggestDrop: DropData
}

export function SectionCards({ products, reachedTargets, potentialSavings, biggestDrop }: SectionCardsProps) {
  return (
    <div className="grid md:grid-cols-4 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card mb-12">
      <Card className="@container/card h-full">
        <CardHeader>
          <CardDescription>Produtos Monitorados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {products.length}
          </CardTitle>
          <CardAction>
            <PackageSearch />
          </CardAction>
        </CardHeader>
        <CardFooter className="h-full flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total de produtos já cadastrados
          </div>
          <div className="text-muted-foreground">
            Contando com os produtos inativados.
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card h-full">
        <CardHeader>
          <CardDescription>Metas atingidas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {reachedTargets}
          </CardTitle>
          <CardAction>
            <Target />
          </CardAction>
        </CardHeader>
        <CardFooter className="h-full flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Alertas enviados para seu e-mail
          </div>
          <div className="text-muted-foreground">
            Acesse as configurações para desativar notificações.
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card h-full">
        <CardHeader>
          <CardDescription>Economia potencial</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(potentialSavings)}
          </CardTitle>
          <CardAction>
            <PiggyBank />
          </CardAction>
        </CardHeader>
        <CardFooter className="h-full flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Se comprar todos os itens em baixa hoje
          </div>
          <div className="text-muted-foreground">
            Importante verificar os alertas de preço para não perder oportunidades.
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card h-full">
        <CardHeader>
          <CardDescription>Maior variação de preço</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {biggestDrop ? `-${biggestDrop.drop}%` : "0%"}
          </CardTitle>
          <CardAction>
            <ChartSpline />
          </CardAction>
        </CardHeader>
        <CardFooter className="h-full flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {biggestDrop ? biggestDrop.name : "Nenhuma variação"}
          </div>
          <div className="text-muted-foreground">
            {biggestDrop
              ? `De R$ ${biggestDrop.oldPrice.toFixed(2)} por R$ ${biggestDrop.currentPrice.toFixed(2)}`
              : "Aguardando"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
