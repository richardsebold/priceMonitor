import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard-client";
import Sidebar from "@/components/sidebar";
import Hero from "@/components/hero";
import ClientAlerts from "@/components/alert-items";
import { getDashboardStats } from "@/modules/analytics/actions/get-dashboard-stats";
import { getDeals } from "@/modules/analytics/actions/get-deals";
import { maxTrackedProducts } from "@/modules/billing/domain/plan-entitlements";

export default async function Dashboard() {
  const [data, deals] = await Promise.all([getDashboardStats(), getDeals()]);

  if (!data) {
    redirect("/");
  }

  const { user, products, reachedTargets, potentialSavings, biggestDrop, alerts } = data;

  const userLimit = maxTrackedProducts(user.planId);

  return (
    <div className="min-h-screen pb-10 sm:ml-14">
      <Sidebar />
      <Hero name={user.name} />
      <DashboardClient
        planLimit={userLimit}
        initialProducts={products}
        initialStats={{ reachedTargets, potentialSavings, biggestDrop }}
        deals={deals}
      />
      <ClientAlerts alerts={alerts} />
    </div>
  );
}
