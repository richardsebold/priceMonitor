// Shared bound for how far a single reading may move from the last known price
// before it needs confirmation. Used symmetrically: a drop below
// previous * PRICE_PLAUSIBILITY_RATIO, or a rise above previous / PRICE_PLAUSIBILITY_RATIO,
// is flagged. Changing this value retunes both directions at once.
export const PRICE_PLAUSIBILITY_RATIO = 0.15;

export function isImplausibleDrop(previousPrice: number, currentPrice: number): boolean {
  return currentPrice < previousPrice * PRICE_PLAUSIBILITY_RATIO;
}

export function isImplausibleRise(previousPrice: number, currentPrice: number): boolean {
  return currentPrice > previousPrice / PRICE_PLAUSIBILITY_RATIO;
}

export function isImplausiblePriceChange(previousPrice: number, currentPrice: number): boolean {
  return isImplausibleDrop(previousPrice, currentPrice) || isImplausibleRise(previousPrice, currentPrice);
}
