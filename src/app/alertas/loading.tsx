import Sidebar from "@/components/sidebar";
import { AlertCardsSkeleton } from "@/components/alert-cards-skeleton";
import { ClientAlertsSkeleton } from "@/components/client-alerts-skeleton";

export default function LoadingAlertas() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <Sidebar />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Alertas</h1>
        <p className="text-muted-foreground mt-2">
          Confira os últimos avisos de queda de preço enviados para o seu e-mail.
        </p>
      </div>

      <AlertCardsSkeleton />

      <ClientAlertsSkeleton />
    </div>
  );
}