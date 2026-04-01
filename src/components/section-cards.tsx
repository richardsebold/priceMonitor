"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProducts } from "@/actions/get-products-from-db"
import { useEffect, useState } from "react"
import { ProductHistory } from "../../generated/prisma/client"
import { getReachedTargetsCount } from "@/actions/get-reached-count"
import { getPotentialSavings } from "@/actions/get-potential-savings"
import { getBiggestDrop } from "@/actions/get-biggest-drop"
import { getUser } from "@/actions/get-user"

type DropData = {
  name: string;
  drop: string;
  oldPrice: number;
  currentPrice: number;
} | null;

export function SectionCards() {
  const [products, setProducts] = useState<ProductHistory[]>([])
  const [reachedTargets, setReachedTargets] = useState<number>(0)
  const [savings, setSavings] = useState<number>(0)
  const [biggestDrop, setBiggestDrop] = useState<DropData>(null)

  useEffect(() => {
    async function fetchData() {
      const user = await getUser();

      if (!user) return;

      try {
        const [productsData, targetsData, savingsData, dropData] = await Promise.all([
          getProducts(),
          getReachedTargetsCount(user.id),
          getPotentialSavings(),
          getBiggestDrop()
        ])
        
        if (productsData) setProducts(productsData)
        if (targetsData !== undefined) setReachedTargets(targetsData)
        if (savingsData !== undefined) setSavings(savingsData)
        if (dropData) setBiggestDrop(dropData)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="grid md:grid-cols-4 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card mb-12">
      <Card className="@container/card h-full">
        <CardHeader>
          <CardDescription>Produtos Monitorados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {products.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
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
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="h-full flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Alertas enviados para seu e-maila
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
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(savings)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
       <CardFooter className="h-full flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Se comprar todos os itens em baixa hoje
          </div>
          <div className="text-muted-foreground ">
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
            <Badge variant="outline" className={biggestDrop ? "border-green-500 text-green-500" : ""}>
              <IconTrendingDown className="size-4 mr-1" />
              Destaque
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="h-full flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {biggestDrop ? biggestDrop.name : "Nenhuma variação"}
          </div>
          <div className="text-muted-foreground">
            {biggestDrop ? `De R$ ${biggestDrop.oldPrice.toFixed(2)} por R$ ${biggestDrop.currentPrice.toFixed(2)}` : "Aguardando"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
