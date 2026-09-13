import { describe, it, expect } from "vitest";
import { findBiggestDrop, sumPotentialSavings } from "./metrics";

describe("sumPotentialSavings", () => {
  it("sums how far each price is below its target", () => {
    expect(
      sumPotentialSavings([
        { price: 80, priceTarget: 100 },
        { price: 40, priceTarget: 50 },
        { price: 150, priceTarget: 120 },
      ]),
    ).toBe(30);
  });

  it("returns 0 for an empty list", () => {
    expect(sumPotentialSavings([])).toBe(0);
  });
});

describe("findBiggestDrop", () => {
  it("picks the product with the largest drop from its historical high", () => {
    const result = findBiggestDrop([
      { name: "A", price: 90, history: [{ price: 100 }] },
      { name: "B", price: 50, history: [{ price: 100 }, { price: 70 }] },
    ]);

    expect(result).toEqual({ name: "B", drop: "50.0", oldPrice: 100, currentPrice: 50 });
  });

  it("ignores products without history or whose price never dropped", () => {
    expect(
      findBiggestDrop([
        { name: "A", price: 90, history: [] },
        { name: "B", price: 100, history: [{ price: 80 }] },
      ]),
    ).toBeNull();
  });
});
