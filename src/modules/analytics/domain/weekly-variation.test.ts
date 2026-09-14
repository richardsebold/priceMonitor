import { describe, it, expect } from "vitest";
import { weeklyPriceChange, pickBiggestWeeklyDrop } from "./weekly-variation";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = 0;

describe("weeklyPriceChange", () => {
  it("uses the price in effect 7 days ago as the reference, not a later change inside the window", () => {
    const result = weeklyPriceChange(
      {
        name: "Produto",
        price: 80,
        history: [
          { time: -10 * DAY_MS, price: 100 },
          { time: -3 * DAY_MS, price: 90 },
        ],
      },
      now,
    );

    expect(result).toEqual({ name: "Produto", priceNow: 80, priceWeekAgo: 100, changePct: 20 });
  });

  it("falls back to the earliest known price when the product is younger than 7 days", () => {
    const result = weeklyPriceChange(
      {
        name: "Produto novo",
        price: 100,
        history: [{ time: -3 * DAY_MS, price: 100 }],
      },
      now,
    );

    expect(result).toEqual({
      name: "Produto novo",
      priceNow: 100,
      priceWeekAgo: 100,
      changePct: 0,
    });
  });
});

describe("pickBiggestWeeklyDrop", () => {
  it("picks the product with the largest percentage drop", () => {
    const changes = [
      { name: "A", priceNow: 95, priceWeekAgo: 100, changePct: 5 },
      { name: "B", priceNow: 108, priceWeekAgo: 100, changePct: -8 },
      { name: "C", priceNow: 80, priceWeekAgo: 100, changePct: 20 },
    ];

    expect(pickBiggestWeeklyDrop(changes)).toEqual(changes[2]);
  });

  it("returns null when no product dropped this week", () => {
    const changes = [
      { name: "A", priceNow: 100, priceWeekAgo: 100, changePct: 0 },
      { name: "B", priceNow: 110, priceWeekAgo: 100, changePct: -10 },
    ];

    expect(pickBiggestWeeklyDrop(changes)).toBeNull();
  });
});
