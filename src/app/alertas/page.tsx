import { getLatestAlerts } from "@/actions/get-latest-alerts"
import Sidebar from "@/components/sidebar"
import AlertCards from "@/components/alert-cards"
import ClientAlerts from "@/components/alert-items"

export default async function AlertasPage() {
  const alerts = await getLatestAlerts();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
        <Sidebar />
        
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Histórico de Alertas</h1>
            <p className="text-muted-foreground mt-2">
                Confira os últimos avisos de queda de preço enviados para o seu e-mail.
            </p>
        </div>

        <AlertCards alerts={alerts} />
        <ClientAlerts alerts={alerts} />
    </div>
  )
}