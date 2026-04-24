import { getUser } from "@/actions/get-user";
import { DashboardClient } from "@/components/dashboard-client";
import Sidebar from "@/components/sidebar";

const PLAN_LIMITS: Record<string, number> = {
  "plano_free": 1,
  "plano_noob_mensal": 7,
  "plano_pro_mensal": 15,
  "plano_hacker_mensal": 30,
};

export default async function ProdutosRastreados() {
  const user = await getUser();
  const currentPlan = user?.planId || "plano_free";
  const userLimit = PLAN_LIMITS[currentPlan] || 0;

  return (
    <div className="min-h-screen pb-10 sm:ml-14">
      <Sidebar />
      <DashboardClient 
        planLimit={userLimit} 
        hideSectionCards={true} 
        defaultExpandFirstItem={false} // <-- Manda o componente não expandir o gráfico!
      />
    </div>
  );
}