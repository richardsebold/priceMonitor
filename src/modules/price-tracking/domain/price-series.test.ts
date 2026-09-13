import { describe, it, expect } from "vitest";
import { buildPriceSeries, summarizePriceSeries } from "./price-series";

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

describe("summarizePriceSeries", () => {
  it("keeps the lowest and highest price of each period, extended to the end", () => {
    const series = buildPriceSeries(
      [
        { time: 100, price: 10 },
        { time: 110, price: 30 },
        { time: 120, price: 10 },
        { time: 160, price: 8 },
      ],
      range,
    );
    expect(summarizePriceSeries(series, [100, 150])).toEqual([
      { time: 100, min: 10, max: 30 },
      { time: 150, min: 8, max: 10 },
      { time: 200, min: 8, max: 10 },
    ]);
  });

  it("counts the price inherited from the previous period", () => {
    const series = buildPriceSeries([{ time: 100, price: 10 }], range);
    expect(summarizePriceSeries(series, [100, 130, 160])).toEqual([
      { time: 100, min: 10, max: 10 },
      { time: 130, min: 10, max: 10 },
      { time: 160, min: 10, max: 10 },
      { time: 200, min: 10, max: 10 },
    ]);
  });

  it("returns nothing for an empty series", () => {
    expect(summarizePriceSeries([], [100, 150])).toEqual([]);
  });
});
