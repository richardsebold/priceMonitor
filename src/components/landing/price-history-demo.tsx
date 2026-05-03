"use client"

import Image from "next/image"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowDownRight, ArrowUpRight, BadgeCheck, Bell, ShoppingBag } from "lucide-react"

type DemoProductData = {
  name: string
  store: string
  image: string | null
  initialPrice: number
  currentPrice: number
  priceTarget: number
  targetReached: boolean
  monitoringDays: number
  history: { day: string; price: number }[]
}

const fallbackData: DemoProductData = {
  name: "iPhone 15 128GB · Preto",
  store: "amazon.com.br",
  image: null,
  initialPrice: 5499,
  currentPrice: 4125.99,
  priceTarget: 4200,
  targetReached: true,
  monitoringDays: 41,
  history: [
    { day: "22/03", price: 5499 },
    { day: "26/03", price: 5499 },
    { day: "30/03", price: 5399 },
    { day: "03/04", price: 5299 },
    { day: "07/04", price: 5299 },
    { day: "11/04", price: 4999 },
    { day: "15/04", price: 4899 },
    { day: "19/04", price: 4899 },
    { day: "23/04", price: 4599 },
    { day: "27/04", price: 4399 },
    { day: "01/05", price: 4125.99 },
  ],
}

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

interface PriceHistoryDemoProps {
  productData?: DemoProductData | null
}

export function PriceHistoryDemo({ productData }: PriceHistoryDemoProps) {
  const product = productData ?? fallbackData
  const {
    name,
    store,
    image,
    initialPrice,
    currentPrice,
    priceTarget,
    targetReached,
    monitoringDays,
    history,
  } = product

  const diff = initialPrice - currentPrice
  const dropPercent =
    initialPrice > 0 ? Math.round((diff / initialPrice) * 100) : 0
  const isDown = diff > 0
  const savings = Math.abs(diff)

  return (
    <div className="relative isolate w-full overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-1 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="absolute inset-0 -z-10 bg-grid-chart opacity-40" />
      <div className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="rounded-[calc(var(--radius)+12px)] bg-background/40 p-5 sm:p-6">
        {/* Product header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary/80">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  width={44}
                  height={44}
                  className="size-full object-contain p-1"
                  unoptimized
                />
              ) : (
                <ShoppingBag className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>
              <p className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
                {store} · monitorando há {monitoringDays} dias
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary sm:inline-flex">
            <span className="size-1.5 animate-blink-soft rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
            ao vivo
          </span>
        </div>

        {/* Price summary */}
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              preço atual
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums sm:text-4xl">
              {fmt(currentPrice)}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative inline-block">
                <span className="font-mono tabular-nums opacity-70">
                  {fmt(initialPrice)}
                </span>
                <span className="absolute inset-x-0 top-1/2 h-px -rotate-3 bg-muted-foreground/70" />
              </span>
              <span>·</span>
              <span className="text-foreground/70">há {monitoringDays} dias</span>
            </div>
          </div>
          <div className="text-right">
            <span
              className={[
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-sm font-semibold",
                isDown
                  ? "bg-primary/15 text-primary"
                  : "bg-red-500/15 text-red-400",
              ].join(" ")}
            >
              {isDown ? (
                <ArrowDownRight className="size-3.5" />
              ) : (
                <ArrowUpRight className="size-3.5" />
              )}
              {Math.abs(dropPercent)}%
            </span>
            <p className="mt-1.5 font-mono text-xs text-foreground/70">
              {isDown ? "economia" : "alta"} de {fmt(savings)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-5 h-44 w-full sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 8, right: 4, bottom: 0, left: -28 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.21 130)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="oklch(0.85 0.21 130)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "oklch(0.66 0.01 240)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor(history.length / 8))}
              />
              <YAxis
                tick={{ fill: "oklch(0.66 0.01 240)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`
                }
                width={50}
                domain={["auto", "auto"]}
              />
              <Tooltip
                cursor={{ stroke: "oklch(0.85 0.21 130)", strokeOpacity: 0.4, strokeWidth: 1 }}
                contentStyle={{
                  background: "oklch(0.16 0.005 240)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
                labelStyle={{ color: "oklch(0.66 0.01 240)" }}
                formatter={(value: number) => [fmt(value), "preço"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="oklch(0.85 0.21 130)"
                strokeWidth={2}
                fill="url(#priceGradient)"
                activeDot={{
                  r: 4,
                  fill: "oklch(0.85 0.21 130)",
                  stroke: "oklch(0.18 0.005 240)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer events */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/40 px-3 py-2.5 text-xs">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Bell className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {targetReached ? "Alerta enviado · Telegram" : "Monitorando meta"}
              </p>
              <p className="truncate text-muted-foreground">
                {targetReached
                  ? `preço caiu abaixo da sua meta de ${fmt(priceTarget)}`
                  : `meta definida em ${fmt(priceTarget)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/40 px-3 py-2.5 text-xs">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <BadgeCheck className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {targetReached ? "Hora de comprar" : "Aguardando o melhor momento"}
              </p>
              <p className="truncate text-muted-foreground">
                {isDown
                  ? `${Math.abs(dropPercent)}% abaixo do preço inicial`
                  : `${Math.abs(dropPercent)}% acima do preço inicial`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
