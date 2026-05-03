import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard-client";
import Sidebar from "@/components/sidebar";
import Hero from "@/components/hero";
import ClientAlerts from "@/components/alert-items";
import { CpfWarning } from "@/components/cpf-warning";
import { getDashboardStats } from "@/actions/get-dashboard-stats";

const PLAN_LIMITS: Record<string, number> = {
  "plano_noob_mensal": 3,
  "plano_pro_mensal": 10,
  "plano_hacker_mensal": 30,
};

export default async function Dashboard() {
  const data = await getDashboardStats();

  if (!data) {
    redirect("/");
  }

  const { user, products, reachedTargets, potentialSavings, biggestDrop, alerts } = data;

  const userLimit = PLAN_LIMITS[user.planId ?? ""] ?? 0;

  return (
    <div className="min-h-screen pb-10 sm:ml-14">
      <Sidebar />
      <CpfWarning cpf={user.cpf} />
      <Hero name={user.name} />
      <DashboardClient
        planLimit={userLimit}
        initialProducts={products}
        initialStats={{ reachedTargets, potentialSavings, biggestDrop }}
      />
      <ClientAlerts alerts={alerts} />
    </div>
  );
}
