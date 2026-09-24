import { describe, it, expect } from "vitest";
import { formatDealBadge, rankDeals, referencePrice, toDeal } from "./deals";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = new Date("2026-09-23T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

const product = (price: number, lastPriceReadAt: Date | null = ago(HOUR)) => ({
  id: "p1",
  url: "https://www.kabum.com.br/produto/1/a",
  name: "Produto",
  image: "https://img/1.jpg",
  store: "kabum.com.br",
  price,
  lastPriceReadAt,
});

describe("referencePrice", () => {
  it("returns the highest price recorded inside the 30-day window", () => {
    const history = [
      { price: 90, createdAt: ago(20 * DAY) },
      { price: 120, createdAt: ago(10 * DAY) },
      { price: 95, createdAt: ago(1 * DAY) },
    ];
    expect(referencePrice(history, now)).toBe(120);
  });

  it("counts the last record before the window as in effect at its start", () => {
    const history = [
      { price: 300, createdAt: ago(60 * DAY) },
      { price: 150, createdAt: ago(40 * DAY) },
      { price: 100, createdAt: ago(5 * DAY) },
    ];
    expect(referencePrice(history, now)).toBe(150);
  });

  it("ignores records older than the last one before the window", () => {
    const history = [
      { price: 999, createdAt: ago(90 * DAY) },
      { price: 100, createdAt: ago(31 * DAY) },
      { price: 90, createdAt: ago(2 * DAY) },
    ];
    expect(referencePrice(history, now)).toBe(100);
  });

  it("returns null for an empty history", () => {
    expect(referencePrice([], now)).toBeNull();
  });
});

const historyAt = (reference: number) => [{ price: reference, createdAt: ago(10 * DAY) }];

describe("toDeal", () => {
  it("includes a discount at the 5% floor", () => {
    const deal = toDeal(product(95), historyAt(100), now);
    expect(deal).not.toBeNull();
    expect(deal!.discount).toBeCloseTo(0.05, 10);
    expect(deal!.referencePrice).toBe(100);
  });

  it("excludes below the 5% floor, at the reference and above it", () => {
    expect(toDeal(product(95.01), historyAt(100), now)).toBeNull();
    expect(toDeal(product(100), historyAt(100), now)).toBeNull();
    expect(toDeal(product(110), historyAt(100), now)).toBeNull();
  });

  it("applies the 40% ceiling: 40% is included, 40.01% is not", () => {
    expect(toDeal(product(60), historyAt(100), now)).not.toBeNull();
    expect(toDeal(product(59.99), historyAt(100), now)).toBeNull();
  });

  it("drops a stale reading: null or older than 24 h is out, 23 h is in", () => {
    expect(toDeal(product(80, null), historyAt(100), now)).toBeNull();
    expect(toDeal(product(80, ago(DAY + 1)), historyAt(100), now)).toBeNull();
    expect(toDeal(product(80, ago(23 * HOUR)), historyAt(100), now)).not.toBeNull();
  });
});

describe("rankDeals", () => {
  it("orders by popularity descending, then discount descending", () => {
    const deals = [
      { id: "a", popularity: 0, discount: 0.3 },
      { id: "b", popularity: 2, discount: 0.06 },
      { id: "c", popularity: 2, discount: 0.2 },
      { id: "d", popularity: 1, discount: 0.39 },
    ];
    expect(rankDeals(deals).map((d) => d.id)).toEqual(["c", "b", "d", "a"]);
  });
});

describe("formatDealBadge", () => {
  it("rounds the discount to a whole percentage", () => {
    expect(formatDealBadge(0.123)).toBe("-12% vs. últimos 30 dias");
    expect(formatDealBadge(0.125)).toBe("-13% vs. últimos 30 dias");
  });
});
