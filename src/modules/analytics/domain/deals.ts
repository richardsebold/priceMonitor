export const DEAL_WINDOW_DAYS = 30;
export const DEAL_MIN_DISCOUNT = 0.05;
// Até a cobertura de scraping entrar, um desconto acima disso é mais provável
// que seja erro de leitura (esgotado com preço cheio, R$ 1,00) do que promoção.
export const DEAL_MAX_DISCOUNT = 0.4;
export const DEAL_STALE_AFTER_HOURS = 24;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
// Folga para as bordas de 5% e 40% não caírem por erro de ponto flutuante.
const EPSILON = 1e-9;

type PricePoint = { price: number; createdAt: Date };

type DealCandidate = {
  id: string;
  url: string;
  name: string | null;
  image: string | null;
  store: string | null;
  price: number;
  lastPriceReadAt: Date | null;
};

export type Deal = Omit<DealCandidate, "lastPriceReadAt"> & {
  referencePrice: number;
  discount: number;
};

// O PriceHistory só grava mudanças, então o preço em vigor no início da janela
// é o do último registro anterior a ela.
export function referencePrice(history: PricePoint[], now: Date): number | null {
  const windowStart = now.getTime() - DEAL_WINDOW_DAYS * DAY_MS;
  const inWindow = history.filter((point) => point.createdAt.getTime() >= windowStart);
  const before = history
    .filter((point) => point.createdAt.getTime() < windowStart)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const prices = [...inWindow, ...(before ? [before] : [])].map((point) => point.price);
  return prices.length > 0 ? Math.max(...prices) : null;
}

export function toDeal(product: DealCandidate, history: PricePoint[], now: Date): Deal | null {
  if (!product.lastPriceReadAt) return null;
  if (now.getTime() - product.lastPriceReadAt.getTime() > DEAL_STALE_AFTER_HOURS * HOUR_MS) {
    return null;
  }

  const reference = referencePrice(history, now);
  if (!reference || reference <= 0) return null;

  const discount = 1 - product.price / reference;
  if (discount < DEAL_MIN_DISCOUNT - EPSILON) return null;
  if (discount > DEAL_MAX_DISCOUNT + EPSILON) return null;

  const { id, url, name, image, store, price } = product;
  return { id, url, name, image, store, price, referencePrice: reference, discount };
}

export function rankDeals<T extends { popularity: number; discount: number }>(deals: T[]): T[] {
  return [...deals].sort((a, b) => b.popularity - a.popularity || b.discount - a.discount);
}

export function formatDealBadge(discount: number): string {
  return `-${Math.round(discount * 100)}% vs. últimos 30 dias`;
}
