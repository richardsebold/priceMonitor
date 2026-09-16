import { describe, it, expect } from "vitest";
import { secretsMatch } from "./secure-compare";

describe("secretsMatch", () => {
  it("returns true for equal secrets and false for different secrets of different lengths, without throwing", () => {
    expect(secretsMatch("same-secret", "same-secret")).toBe(true);
    expect(() => secretsMatch("short", "a-much-longer-value")).not.toThrow();
    expect(secretsMatch("short", "a-much-longer-value")).toBe(false);
    expect(secretsMatch("value-a", "value-b")).toBe(false);
  });

  it("returns false when either side is undefined, null or empty", () => {
    expect(secretsMatch(undefined, "secret")).toBe(false);
    expect(secretsMatch("secret", undefined)).toBe(false);
    expect(secretsMatch(null, "secret")).toBe(false);
    expect(secretsMatch("", "secret")).toBe(false);
    expect(secretsMatch(undefined, undefined)).toBe(false);
  });
});
