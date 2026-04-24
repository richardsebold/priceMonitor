import { ProductHistory } from "../../generated/prisma/client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface AlertsProps {
  alerts: ProductHistory[]
}

export default function AlertCards({ alerts }: AlertsProps) {
  return (
    <div>
      {alerts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card mb-8">
          
          <Card className="@container/card h-full">
            <CardHeader>
              <CardDescription>Total de Alertas</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {alerts.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="@container/card h-full">
            <CardHeader>
              <CardDescription>Menor Preço</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-[#5a9600]">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Math.min(...alerts.map((a) => a.price)))}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="@container/card h-full col-span-2 sm:col-span-1">
            <CardHeader>
              <CardDescription>Último Alerta</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {new Date(
                  Math.max(...alerts.map((a) => new Date(a.scrapedAt).getTime()))
                ).toLocaleDateString("pt-BR")}
              </CardTitle>
            </CardHeader>
          </Card>

        </div>
      )}
    </div>
  );
}