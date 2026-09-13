import { describe, it, expect } from "vitest";
import { canUseBrowserExtension, maxTrackedProducts } from "./plan-entitlements";

describe("maxTrackedProducts", () => {
  it("returns the product limit of each plan", () => {
    expect(maxTrackedProducts("plano_free")).toBe(1);
    expect(maxTrackedProducts("plano_noob_mensal")).toBe(7);
    expect(maxTrackedProducts("plano_pro_mensal")).toBe(15);
    expect(maxTrackedProducts("plano_hacker_mensal")).toBe(30);
  });

  it("treats users without a plan as free", () => {
    expect(maxTrackedProducts(null)).toBe(1);
    expect(maxTrackedProducts(undefined)).toBe(1);
    expect(maxTrackedProducts("")).toBe(1);
  });

  it("returns 0 for unknown plans", () => {
    expect(maxTrackedProducts("plano_inexistente")).toBe(0);
    expect(maxTrackedProducts("toString")).toBe(0);
  });
});

describe("canUseBrowserExtension", () => {
  it("allows only the Hacker plan", () => {
    expect(canUseBrowserExtension("plano_hacker_mensal")).toBe(true);
    expect(canUseBrowserExtension("plano_pro_mensal")).toBe(false);
    expect(canUseBrowserExtension(null)).toBe(false);
  });
});
