"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { getProductHistory } from "@/modules/price-tracking/actions/get-product-history";
import {
  buildPriceSeries,
  type PricePoint,
  type PriceRecord,
} from "@/modules/price-tracking/domain/price-series";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  price: {
    label: "Preço",
    color: "#6CA651",
  },
} satisfies ChartConfig;

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_DAYS = { "90d": 90, "30d": 30, "7d": 7 } as const;
type TimeRange = keyof typeof RANGE_DAYS;

function formatBRL(value: number, fractionDigits = 2) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

// Escala do eixo Y com folga (um preço estável fica no meio do gráfico, e não
// colado na borda) e com ~4 intervalos de passo "redondo" (1, 2, 2,5 ou 5 × 10^n).
function priceScale(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || max * 0.05 || 1;
  const rawStep = (max - min + 2 * pad) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ??
    10 * magnitude;
  const lo = Math.max(0, Math.floor((min - pad) / step) * step);
  const hi = Math.ceil((max + pad) / step) * step;
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(t);
  return { domain: [lo, hi] as [number, number], ticks };
}

// Com menos de 2 dias só faz sentido marcar o início e o fim; acima disso,
// até 6 marcas espaçadas de pelo menos 1 dia, para não repetir a mesma data.
function timeTicks(start: number, end: number): number[] {
  const spanDays = (end - start) / DAY_MS;
  if (spanDays < 2) return [start, end];
  const count = Math.min(6, Math.floor(spanDays) + 1);
  return Array.from({ length: count }, (_, i) =>
    i === count - 1 ? end : start + ((end - start) * i) / (count - 1),
  );
}

interface ChartAreaInteractiveProps {
  productId?: string;
  priceTarget?: number | null;
}

export function ChartAreaInteractive({
  productId,
  priceTarget,
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d");
  const [history, setHistory] = React.useState<PriceRecord[]>([]);
  const [loadedAt, setLoadedAt] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      if (!productId) return;
      setLoading(true);
      const data = await getProductHistory(productId);
      setHistory(
        data.map((item) => ({ time: Date.parse(item.date), price: item.price })),
      );
      setLoadedAt(Date.now());
      setLoading(false);
    }

    fetchData();
  }, [productId]);

  const now = loadedAt;
  const series = buildPriceSeries(history, {
    from: now - RANGE_DAYS[timeRange] * DAY_MS,
    to: now,
  });
  const start = series[0]?.time ?? now;
  const isShortSpan = now - start < 2 * DAY_MS;
  const prices = series.map((point) => point.price);
  const isFlat = prices.length > 0 && prices.every((p) => p === prices[0]);
  const lastChange = history.filter((record) => record.time <= now).at(-1);
  const yScale = priceScale(priceTarget ? [...prices, priceTarget] : prices);

  const formatTime = (time: number) => {
    if (time === now) return isShortSpan ? "Agora" : "Hoje";
    const date = new Date(time);
    return isShortSpan
      ? date.toLocaleString("pt-BR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  };

  return (
    <Card className="pt-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Histórico de Preços</CardTitle>
          <CardDescription>
            Variação de preço do produto selecionado.
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger
            className="w-40 rounded-lg sm:ml-auto flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 dias
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 dias
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-62.5 items-center justify-center text-slate-500">
            Carregando histórico...
          </div>
        ) : series.length === 0 ? (
          <div className="flex h-62.5 items-center justify-center text-slate-500">
            Nenhum histórico disponível para este produto.
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-62.5 w-full"
            >
              <AreaChart data={series} margin={{ top: 8, right: 24, left: 8 }}>
                <defs>
                  <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-price)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-price)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="time"
                  type="number"
                  scale="time"
                  domain={[start, now]}
                  ticks={timeTicks(start, now)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatTime}
                />
                <YAxis
                  dataKey="price"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={yScale.domain}
                  ticks={yScale.ticks}
                  tickFormatter={(value: number) => formatBRL(value, 0)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const point = payload?.[0]?.payload as
                          | PricePoint
                          | undefined;
                        if (!point) return null;
                        if (point.time === now) return "Agora";
                        return new Date(point.time).toLocaleString("pt-BR", {
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }}
                      formatter={(value: unknown) => (
                        <span className="font-semibold">
                          {formatBRL(Number(value))}
                        </span>
                      )}
                      indicator="dot"
                    />
                  }
                />
                {/* O preço só muda quando uma verificação detecta outro valor:
                    ele fica constante entre os registros, por isso o degrau. */}
                <Area
                  dataKey="price"
                  type="stepAfter"
                  fill="url(#fillPrice)"
                  stroke="var(--color-price)"
                  strokeWidth={2}
                  dot={({ cx, cy, index, payload }) =>
                    payload.synthetic ? (
                      <g key={index} />
                    ) : (
                      <circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="var(--color-price)"
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                    )
                  }
                  activeDot={{ r: 5, stroke: "var(--background)", strokeWidth: 2 }}
                />
                {priceTarget ? (
                  <ReferenceLine
                    y={priceTarget}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                    label={{
                      value: `Meta ${formatBRL(priceTarget)}`,
                      position: "insideBottomRight",
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                    }}
                  />
                ) : null}
              </AreaChart>
            </ChartContainer>
            {isFlat && lastChange ? (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Preço estável em {formatBRL(lastChange.price)} desde{" "}
                {new Date(lastChange.time).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                })}
                . Novas variações aparecerão aqui.
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
