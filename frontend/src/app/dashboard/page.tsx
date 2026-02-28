import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard-client"; 

// import { TelegramButton } from "../../components/telegram-button"; 

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }



  return (
    <div className="min-h-screen bg-[#040E07] pb-10 sm:ml-14">
      <div className="mx-auto flex justify-between items-center bg-[#040E07] shadow px-8 py-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="text-sm text-white">
            {session.user.name} • {session.user.email}
          </div>
          
          
          
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

      <DashboardClient />
    </div>
  );
}