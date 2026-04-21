import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard-client"; 
import Sidebar from "@/components/sidebar";
import { getUser } from "@/actions/get-user";
import Hero from "@/components/hero";
import ClientAlerts from "@/components/alert-items";
import { getLatestAlerts } from "@/actions/get-latest-alerts";
import { HeroSkeleton } from "@/components/hero-skeleton";
import { Suspense } from "react";
import { CpfWarning } from "@/components/cpf-warning";

// import { TelegramButton } from "../../components/telegram-button"; 

const PLAN_LIMITS: Record<string, number> = {
  "plano_noob_mensal": 3,   // 1 projeto
  "plano_pro_mensal": 10, // Ilimitado (um número bem alto)
  "plano_hacker_mensal": 30, // Ilimitado
};



export default async function Dashboard() {
  const user = await getUser();
  const alerts = await getLatestAlerts()
  const currentPlan = user?.planId || "plano_free";
  const userLimit = PLAN_LIMITS[currentPlan] || 0;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    
    <div className="min-h-screen pb-10 sm:ml-14">

      <Sidebar  />

      <CpfWarning cpf={user?.cpf} />

      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      
      <DashboardClient planLimit={userLimit} />

      <ClientAlerts alerts={alerts} />
    </div>
  );
}