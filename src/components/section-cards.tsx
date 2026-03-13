"use client" // Declarando explicitamente que é um componente cliente

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
import { GoalsChart } from "./goals-graph"
import { getProducts } from "@/actions/get-products-from-db"
import { useEffect, useState } from "react" // 👈 Importando os hooks
import { ProductHistory } from "../../generated/prisma/client"
import { PriceChart } from "./price-stonks-graph"
import { MediaVariantChart } from "./media-variant-graph"
import { ProductsChart } from "./products-graph"


export function SectionCards() {

  const [products, setProducts] = useState<ProductHistory[]>([])


  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();
        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }

    fetchProducts();
  }, [])

  return (
    <div className="grid md:grid-cols-4 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card mb-12">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Produtos Monitorados</CardDescription>
          {/* 3. Agora a renderização é segura. Mostrará 0 enquanto carrega, e depois atualiza. */}
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
        <CardFooter className="flex-col items-start gap-1.5 text-sm">

          <ProductsChart />

        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Metas atingidas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">

          <GoalsChart />

        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Economia potencial</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R$ 345,90
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
       <CardFooter className="flex-col items-start gap-1.5 text-sm">

          <PriceChart />

        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Variação média</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">

          <MediaVariantChart />

        </CardFooter>
      </Card>
    </div>
  )
}