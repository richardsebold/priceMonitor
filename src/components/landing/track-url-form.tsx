"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Link2, Loader2 } from "lucide-react"

export function TrackUrlForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) {
      router.push("/signup")
      return
    }
    setSubmitting(true)
    const target = `/signup?url=${encodeURIComponent(url.trim())}`
    router.push(target)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="group/form relative w-full max-w-2xl mx-auto"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/40 via-primary/10 to-primary/40 opacity-0 blur-md transition-opacity duration-500 group-focus-within/form:opacity-100" />

      <div className="relative flex items-stretch gap-1.5 rounded-2xl border border-border bg-card/80 p-1.5 shadow-2xl shadow-black/40 backdrop-blur transition-colors group-focus-within/form:border-primary/40">
        <div className="pointer-events-none flex items-center pl-3 text-muted-foreground">
          <Link2 className="size-4" />
        </div>

        <input
          type="url"
          inputMode="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="cole a URL do produto: amazon, mercado livre, magalu…"
          className="w-full flex-1 bg-transparent px-2 py-3 font-mono text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70"
        />

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:translate-y-px disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">monitorar</span>
              <span className="inline sm:hidden">ir</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Funciona em qualquer e-commerce.{" "}
        <span className="text-foreground/80">Sem cartão de crédito.</span>
      </p>
    </form>
  )
}
