import { describe, it, expect } from "vitest";
import { detectPriceEvent, isTargetReached } from "./price-events";

describe("detectPriceEvent", () => {
  it("detects the target being reached for the first time", () => {
    expect(
      detectPriceEvent({ previousPrice: 120, currentPrice: 100, priceTarget: 100, targetReached: false }),
    ).toBe("TARGET_REACHED");
  });

  it("does not repeat TARGET_REACHED while the target stays reached", () => {
    expect(
      detectPriceEvent({ previousPrice: 99, currentPrice: 98, priceTarget: 100, targetReached: true }),
    ).toBeNull();
  });

  it("detects a drop of 10% or more", () => {
    expect(
      detectPriceEvent({ previousPrice: 200, currentPrice: 180, priceTarget: 100, targetReached: false }),
    ).toBe("PRICE_DROP");
  });

  it("ignores drops smaller than 10%", () => {
    expect(
      detectPriceEvent({ previousPrice: 200, currentPrice: 181, priceTarget: 100, targetReached: false }),
    ).toBeNull();
  });

  it("prefers TARGET_REACHED when both conditions hold", () => {
    expect(
      detectPriceEvent({ previousPrice: 200, currentPrice: 90, priceTarget: 100, targetReached: false }),
    ).toBe("TARGET_REACHED");
  });

  it("reports a big drop even when the target was already reached", () => {
    expect(
      detectPriceEvent({ previousPrice: 100, currentPrice: 80, priceTarget: 100, targetReached: true }),
    ).toBe("PRICE_DROP");
  });
});

describe("isTargetReached", () => {
  it("is true at or below the target and false above it", () => {
    expect(isTargetReached(100, 100)).toBe(true);
    expect(isTargetReached(99.9, 100)).toBe(true);
    expect(isTargetReached(100.1, 100)).toBe(false);
  });
});
