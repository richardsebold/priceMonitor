import { buildPriceSeries, type PriceRecord } from "@/modules/price-tracking/domain/price-series";

export type WeeklyProductChange = {
  name: string | null;
  priceNow: number;
  priceWeekAgo: number;
  changePct: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * O preço "de 7 dias atrás" é o preço em vigor no corte, não a primeira
 * mudança dentro da janela: se o preço só mudou depois do corte, o valor
 * vigente no corte ainda era o anterior. `buildPriceSeries` já resolve isso
 * para o changelog esparso do PriceHistory.
 */
export function weeklyPriceChange(
  product: { name: string | null; price: number; history: PriceRecord[] },
  now: number,
): WeeklyProductChange {
  const series = buildPriceSeries(product.history, { from: now - WEEK_MS, to: now });
  const priceWeekAgo = series[0]?.price ?? product.price;
  const changePct = ((priceWeekAgo - product.price) / priceWeekAgo) * 100;

  return { name: product.name, priceNow: product.price, priceWeekAgo, changePct };
}

export function pickBiggestWeeklyDrop(
  changes: WeeklyProductChange[],
): WeeklyProductChange | null {
  let biggest: WeeklyProductChange | null = null;

  for (const change of changes) {
    if (change.changePct > 0 && (!biggest || change.changePct > biggest.changePct)) {
      biggest = change;
    }
  }

  return biggest;
}
