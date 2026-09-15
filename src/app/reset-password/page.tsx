"use client"

import { Suspense } from "react"
import { BadgeDollarSign } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { ResetPasswordForm } from "@/components/reset-password-form"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return <ResetPasswordForm token={token} />
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md p-0.5">
            <BadgeDollarSign />
          </div>
          Price Tracker
        </Link>
        <Suspense fallback={null}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  )
}
