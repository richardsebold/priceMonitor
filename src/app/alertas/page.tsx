import { getLatestAlerts } from "@/actions/get-latest-alerts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BellRing, ExternalLink, TrendingDown } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/sidebar"

export default async function Alerts() {
  const alerts = await getLatestAlerts()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">

      <Sidebar />

      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Alertas</h1>
        <p className="text-muted-foreground mt-2">
          Confira os últimos avisos de queda de preço enviados para o seu e-mail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="size-5" />
            Alertas Recentes
          </CardTitle>
          <CardDescription>Produtos que atingiram ou ficaram abaixo da sua meta.</CardDescription>
        </CardHeader>
        
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellRing className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhum alerta disparado ainda</p>
              <p className="text-sm text-muted-foreground">Assim que um produto atingir a meta, ele aparecerá aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-muted/20">
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1" >
                      {alert.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>Meta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alert.priceTarget)}</span>
                      <span>•</span>
                      <span>Atualizado em: {new Date(alert.scrapedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-green-500 text-green-500 flex gap-1.5 py-1 px-3">
                      <TrendingDown className="size-4" />
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(alert.price)}
                    </Badge>
                    
                    <Link 
                      href={alert.url} 
                      target="_blank" 
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      <ExternalLink className="size-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}