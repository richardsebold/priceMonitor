import { headers } from "next/headers";
import { ButtonSignOut } from "@/components/button-signout";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard-client"; 
import Image from "next/image";


export default async function Dashboard() {
  



  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const userImage = session.user.image;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto flex justify-between items-center bg-white shadow px-8 py-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-500">
            {session.user.name} • {session.user.email}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userImage ? (
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
        </div>
      </div>

      <DashboardClient />
      
    </div>
  );
}