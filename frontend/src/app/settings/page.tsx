
import Sidebar from "@/components/sidebar";
import { SignupReform } from "@/components/signup-reform";

export default function Settings() {
 return (
   <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">

    <Sidebar  />

      <div className="flex w-full max-w-sm flex-col gap-6">
        
        <SignupReform />
        
      </div>
    </div>
 );
}


      