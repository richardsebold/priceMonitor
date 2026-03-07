import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard-client"; 
import Sidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import Plans from "@/components/planos";
import { getUser } from "@/actions/get-user";

// import { TelegramButton } from "../../components/telegram-button"; 

const PLAN_LIMITS: Record<string, number> = {
  "plano_free": 1,          // 0 projetos
  "plano_noob_mensal": 7,   // 1 projeto
  "plano_pro_mensal": 15, // Ilimitado (um número bem alto)
  "plano_hacker_mensal": 30, // Ilimitado
};



export default async function Dashboard() {
  const user = await getUser();
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


      { user?.cpf === null || user?.cpf === "" ? (
        <div className="mx-auto flex justify-between items-center shadow px-8 py-4 mb-8 bg-red-500 text-white uppercase font-bold">
          <h1> Para ter acesso completo a plataforma finalize seu cadastro. </h1>
        </div>
      ) : (
        ""
      )}

      <Plans currentPlanId={user?.planId || null} />
        
      


      <div className="mx-auto flex justify-between items-center px-8 py-4 mb-8">
        <div>
          <Input placeholder="Buscar produtos..." className="w-80 ml-40" />
        </div>

        <div className="flex items-center gap-4">


          {/* <TelegramButton userId={session.user.id} /> */}


          {/* {userImage ? (
            <Image
              className="w-10 h-10 rounded-full border border-gray-200"
              src={userImage}
              alt={`Foto de ${session.user.name}`}
              width={40}
              height={40}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              {session.user.name?.charAt(0)}
            </div>
          )}
          <ButtonSignOut />
           */}
        </div>
      </div>

      <DashboardClient planLimit={userLimit} />
    </div>
  );
}