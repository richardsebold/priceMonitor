import { DashboardClient } from "@/components/dashboard-client";
import Sidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";

export default function ProdutosRastreados() {
 return (
   <div className="min-h-screen pb-10 sm:ml-14">

      <Sidebar  />


      <div className="mx-auto flex justify-between items-center shadow px-8 py-4 mb-8">
        <div>
          <Input placeholder="Buscar produtos..." className="w-80 ml-40" />
        </div>

        
      </div>

      <DashboardClient />
    </div>
 );
}