"use client"


import { useRouter } from "next/navigation";
import { authClient } from '@/lib/auth-client'


export function ButtonSignOut() {
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
      Sair da conta
    </button>
  );
}