"use client"


import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from '@/lib/auth-client'


export function ButtonSignOut({ children = "Sair da conta" }: { children?: ReactNode }) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/");
        }
      }
    });
  }

  return (
    <button onClick={signOut} className="cursor-pointer">
      {children}
    </button>
  );
}
