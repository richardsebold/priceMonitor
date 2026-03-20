import { ProductHistory } from "../../generated/prisma/client";
import { Card, CardContent } from "./ui/card";

interface AlertsProps {
  alerts: ProductHistory[]
}

export default function AlertCards({ alerts }: AlertsProps) {
 return (
   <div>
        {alerts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de Alertas</p>
              <p className="text-2xl font-bold mt-1">{alerts.length}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Menor Preço</p>
              <p className="text-2xl font-bold mt-1 text-green-500">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Math.min(...alerts.map((a) => a.price)))}
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm col-span-2 sm:col-span-1">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Último Alerta</p>
              <p className="text-2xl font-bold mt-1">
                {new Date(
                  Math.max(...alerts.map((a) => new Date(a.scrapedAt).getTime()))
                ).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
   </div>
 );
}