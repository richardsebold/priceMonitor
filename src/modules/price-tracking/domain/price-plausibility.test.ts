import { describe, it, expect } from "vitest";
import { isImplausibleDrop, isImplausibleRise, isImplausiblePriceChange } from "./price-plausibility";

describe("isImplausibleDrop", () => {
  it("treats a 15% drop as plausible", () => {
    expect(isImplausibleDrop(1000, 850)).toBe(false);
  });

  it("treats a drop below the ratio as implausible", () => {
    expect(isImplausibleDrop(2699.9, 80.6)).toBe(true);
  });

  it("never treats a price increase as implausible", () => {
    expect(isImplausibleDrop(1000, 1500)).toBe(false);
  });

  it("treats exactly the ratio boundary as plausible", () => {
    expect(isImplausibleDrop(1000, 150)).toBe(false);
  });
});

describe("isImplausibleRise", () => {
  it("treats a moderate rise as plausible", () => {
    expect(isImplausibleRise(1000, 1500)).toBe(false);
  });

  it("treats a rise beyond the symmetric ratio as implausible", () => {
    expect(isImplausibleRise(1000, 8000)).toBe(true);
  });

  it("never treats a price decrease as implausible", () => {
    expect(isImplausibleRise(1000, 850)).toBe(false);
  });

  it("treats exactly the ratio boundary as plausible", () => {
    expect(isImplausibleRise(1000, 1000 / 0.15)).toBe(false);
  });
});

describe("isImplausiblePriceChange", () => {
  it("is true for an implausible drop", () => {
    expect(isImplausiblePriceChange(2699.9, 80.6)).toBe(true);
  });

  it("is true for an implausible rise", () => {
    expect(isImplausiblePriceChange(1000, 8000)).toBe(true);
  });

  it("is false for an ordinary price change in either direction", () => {
    expect(isImplausiblePriceChange(1000, 850)).toBe(false);
    expect(isImplausiblePriceChange(1000, 1500)).toBe(false);
  });
});
