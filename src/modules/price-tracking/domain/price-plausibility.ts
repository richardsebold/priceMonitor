export const IMPLAUSIBLE_DROP_RATIO = 0.15;

export function isImplausibleDrop(previousPrice: number, currentPrice: number): boolean {
  return currentPrice < previousPrice * IMPLAUSIBLE_DROP_RATIO;
}
