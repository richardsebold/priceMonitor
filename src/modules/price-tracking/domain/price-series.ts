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
