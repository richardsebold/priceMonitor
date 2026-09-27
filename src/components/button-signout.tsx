"use client"


import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from '@/lib/auth-client'


export function ButtonSignOut({
  children = "Sair da conta",
  className = "cursor-pointer",
}: {
  children?: ReactNode;
  className?: string;
}) {
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
    <button onClick={signOut} className={className}>
      {children}
    </button>
  );
}
