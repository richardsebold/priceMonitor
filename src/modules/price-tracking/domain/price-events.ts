import type { ProductHistory } from "../../../../generated/prisma/client";

export type PriceEventType = "TARGET_REACHED" | "PRICE_DROP";

export type PriceEvent = {
  type: PriceEventType;
  userId: string;
  product: ProductHistory;
  previousPrice: number;
};

const SIGNIFICANT_DROP_RATIO = 0.9;

export function isTargetReached(currentPrice: number, priceTarget: number): boolean {
  return currentPrice <= priceTarget;
}

export function detectPriceEvent(check: {
  previousPrice: number;
  currentPrice: number;
  priceTarget: number;
  targetReached: boolean;
}): PriceEventType | null {
  if (isTargetReached(check.currentPrice, check.priceTarget) && !check.targetReached) {
    return "TARGET_REACHED";
  }
  if (check.currentPrice <= check.previousPrice * SIGNIFICANT_DROP_RATIO) {
    return "PRICE_DROP";
  }
  return null;
}
