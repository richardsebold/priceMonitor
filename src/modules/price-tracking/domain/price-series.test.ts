import { describe, it, expect } from "vitest";
import { buildPriceSeries } from "./price-series";

const range = { from: 100, to: 200 };

describe("buildPriceSeries", () => {
  it("returns nothing when there is no history", () => {
    expect(buildPriceSeries([], range)).toEqual([]);
  });

  it("extends a single record up to the end of the range", () => {
    expect(buildPriceSeries([{ time: 150, price: 10 }], range)).toEqual([
      { time: 150, price: 10, synthetic: false },
      { time: 200, price: 10, synthetic: true },
    ]);
  });

  it("carries the price in effect into the start of the range", () => {
    expect(
      buildPriceSeries(
        [
          { time: 10, price: 12 },
          { time: 50, price: 11 },
          { time: 150, price: 9 },
        ],
        range,
      ),
    ).toEqual([
      { time: 100, price: 11, synthetic: true },
      { time: 150, price: 9, synthetic: false },
      { time: 200, price: 9, synthetic: true },
    ]);
  });

  it("still draws a line when the last change is older than the range", () => {
    expect(buildPriceSeries([{ time: 10, price: 12 }], range)).toEqual([
      { time: 100, price: 12, synthetic: true },
      { time: 200, price: 12, synthetic: true },
    ]);
  });

  it("does not duplicate a record that falls exactly on the end", () => {
    expect(buildPriceSeries([{ time: 200, price: 5 }], range)).toEqual([
      { time: 200, price: 5, synthetic: false },
    ]);
  });
});
