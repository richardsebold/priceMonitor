export type PriceRecord = { time: number; price: number };

export type PricePoint = PriceRecord & {
  /** Ponto derivado (início da janela ou "agora"), não um registro de PriceHistory. */
  synthetic: boolean;
};

/**
 * O PriceHistory só ganha um registro quando o preço muda, então o preço vigente
 * em qualquer instante é o do último registro anterior a ele. Esta função monta
 * a série da janela [from, to]: carrega o preço vigente para o início da janela
 * e o estende até `to`, para que um preço estável apareça como uma linha.
 *
 * `records` deve estar em ordem cronológica.
 */
export function buildPriceSeries(
  records: PriceRecord[],
  { from, to }: { from: number; to: number },
): PricePoint[] {
  const points: PricePoint[] = [];

  const before = records.filter((r) => r.time < from).at(-1);
  if (before) points.push({ time: from, price: before.price, synthetic: true });

  for (const r of records) {
    if (r.time >= from && r.time <= to) points.push({ ...r, synthetic: false });
  }

  const last = points.at(-1);
  if (last && last.time < to) {
    points.push({ time: to, price: last.price, synthetic: true });
  }

  return points;
}

export type PriceBucket = { time: number; min: number; max: number };

/**
 * Resume a série (saída de `buildPriceSeries`) em períodos, como dias: cada
 * período guarda o menor e o maior preço que vigoraram nele, contando o preço
 * herdado do período anterior. `boundaries` são os inícios dos períodos, em
 * ordem; o último vai até o fim da série, que é repetido como ponto final.
 */
export function summarizePriceSeries(
  series: PricePoint[],
  boundaries: number[],
): PriceBucket[] {
  const buckets: PriceBucket[] = [];
  let i = 0;
  let current: number | undefined;

  boundaries.forEach((start, b) => {
    const end = boundaries[b + 1] ?? Infinity;
    while (i < series.length && series[i].time <= start) {
      current = series[i++].price;
    }
    const prices = current === undefined ? [] : [current];
    while (i < series.length && series[i].time < end) {
      current = series[i++].price;
      prices.push(current);
    }
    if (prices.length > 0) {
      buckets.push({ time: start, min: Math.min(...prices), max: Math.max(...prices) });
    }
  });

  const last = buckets.at(-1);
  const end = series.at(-1)?.time;
  if (last && end !== undefined && last.time < end) {
    buckets.push({ ...last, time: end });
  }

  return buckets;
}
