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
  summarizePriceSeries,
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
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRICE_COLOR = "#6CA651";

const chartConfig = {
  price: {
    label: "Preço",
    color: PRICE_COLOR,
  },
} satisfies ChartConfig;

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_DAYS = { "90d": 90, "30d": 30, "7d": 7 } as const;
type TimeRange = keyof typeof RANGE_DAYS;

// Acima disso as bolinhas de cada registro viram ruído visual.
const MAX_DOTS = 12;

type ChartPoint = {
  time: number;
  min: number;
  max: number;
  /** Registro real de PriceHistory (só no modo por registro). */
  real: boolean;
};

function formatBRL(value: number, fractionDigits = 2) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

// Escala do eixo Y com folga (um preço estável fica no meio do gráfico, e não
// colado na borda) e com no máximo 5 intervalos de passo "redondo" (1, 2, 2,5 ou 5 × 10^n).
// Exportada para teste. Sem valores (histórico ainda carregando e sem meta), o
// Math.min/Math.max dão ±Infinity e a busca de magnitude abaixo nunca termina.
export function priceScale(values: number[]) {
  if (values.length === 0) return { domain: [0, 1] as [number, number], ticks: [0, 1] };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.05 || max * 0.05 || 1;
  const low = Math.max(0, min - pad);
  const high = max + pad;

  for (let magnitude = 10 ** Math.floor(Math.log10((high - low) / 5)); ; magnitude *= 10) {
    for (const m of [1, 2, 2.5, 5]) {
      const step = m * magnitude;
      const lo = Math.floor(low / step) * step;
      const hi = Math.ceil(high / step) * step;
      const intervals = Math.round((hi - lo) / step);
      if (intervals <= 5) {
        const ticks = Array.from({ length: intervals + 1 }, (_, k) => lo + k * step);
        return { domain: [lo, hi] as [number, number], ticks };
      }
    }
  }
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

// Início de cada dia (meia-noite local) entre `start` e `end`; o primeiro é o próprio `start`.
function dayBoundaries(start: number, end: number): number[] {
  const boundaries = [start];
  const day = new Date(start);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() + 1);
  while (day.getTime() <= end) {
    boundaries.push(day.getTime());
    day.setDate(day.getDate() + 1);
  }
  return boundaries;
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

  // Em 30 e 90 dias, com verificações a cada poucas horas, o preço registro a
  // registro vira um serrilhado. Nesses períodos a linha mostra o menor preço
  // de cada dia; o maior aparece no tooltip.
  const daily = RANGE_DAYS[timeRange] >= 30;
  const points: ChartPoint[] = daily
    ? summarizePriceSeries(series, dayBoundaries(start, now)).map((b) => ({
        ...b,
        real: false,
      }))
    : series.map((p) => ({
        time: p.time,
        min: p.price,
        max: p.price,
        real: !p.synthetic,
      }));

  const showDots = !daily && series.filter((p) => !p.synthetic).length <= MAX_DOTS;
  const isFlat = series.length > 0 && series.every((p) => p.price === series[0].price);
  const lastChange = history.filter((record) => record.time <= now).at(-1);
  const yScale = priceScale([
    ...points.map((p) => p.min),
    ...(priceTarget ? [priceTarget] : []),
  ]);

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

  const formatTooltipTime = (time: number) => {
    if (time === now) return daily ? "Hoje" : "Agora";
    const date = new Date(time);
    return daily
      ? date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
      : date.toLocaleString("pt-BR", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });
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
        ) : points.length === 0 ? (
          <div className="flex h-62.5 items-center justify-center text-slate-500">
            Nenhum histórico disponível para este produto.
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-62.5 w-full"
            >
              <AreaChart data={points} margin={{ top: 8, right: 24, left: 8 }}>
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
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={yScale.domain}
                  ticks={yScale.ticks}
                  tickFormatter={(value: number) => formatBRL(value, 0)}
                />
                <ChartTooltip
                  cursor={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.3 }}
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as ChartPoint | undefined;
                    if (!active || !point) return null;
                    return (
                      <div className="grid min-w-32 gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                        <div className="font-medium">
                          {formatTooltipTime(point.time)}
                        </div>
                        {point.max > point.min ? (
                          <>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Menor</span>
                              <span className="font-semibold tabular-nums">
                                {formatBRL(point.min)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Maior</span>
                              <span className="font-semibold tabular-nums">
                                {formatBRL(point.max)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="font-semibold tabular-nums">
                            {formatBRL(point.min)}
                          </span>
                        )}
                      </div>
                    );
                  }}
                />
                <Area
                  dataKey="min"
                  type="monotone"
                  fill="url(#fillPrice)"
                  stroke="var(--color-price)"
                  strokeWidth={2}
                  dot={
                    showDots
                      ? ({ cx, cy, index, payload }) =>
                          payload.real ? (
                            <circle
                              key={index}
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="var(--color-price)"
                              stroke="var(--background)"
                              strokeWidth={2}
                            />
                          ) : (
                            <g key={index} />
                          )
                      : false
                  }
                  activeDot={{ r: 5, stroke: "var(--background)", strokeWidth: 2 }}
                />
                {priceTarget ? (
                  <ReferenceLine
                    y={priceTarget}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                  />
                ) : null}
              </AreaChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-0.5 w-3 rounded-full"
                  style={{ backgroundColor: PRICE_COLOR }}
                />
                {daily ? "Menor preço do dia" : "Preço"}
              </span>
              {priceTarget ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 border-t border-dashed border-muted-foreground" />
                  Meta {formatBRL(priceTarget)}
                </span>
              ) : null}
            </div>
            {isFlat && lastChange ? (
              <p className="mt-1 text-center text-xs text-muted-foreground">
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
