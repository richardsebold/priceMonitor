import { describe, it, expect } from "vitest";
import { isImplausibleDrop } from "./price-plausibility";

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
