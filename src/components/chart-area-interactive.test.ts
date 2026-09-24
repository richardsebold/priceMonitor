import { describe, it, expect, vi } from "vitest";

vi.mock("@/modules/price-tracking/actions/get-product-history", () => ({
  getProductHistory: vi.fn(),
}));

import { priceScale } from "./chart-area-interactive";

describe("priceScale", () => {
  it("returns a finite scale when there are no values", () => {
    const scale = priceScale([]);

    expect(scale.domain).toEqual([0, 1]);
    expect(scale.ticks.every(Number.isFinite)).toBe(true);
  });

  it("keeps a single price inside the domain", () => {
    const scale = priceScale([975.57]);

    expect(scale.domain[0]).toBeLessThan(975.57);
    expect(scale.domain[1]).toBeGreaterThan(975.57);
  });
});
