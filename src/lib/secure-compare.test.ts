import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { secretsMatch, bearerTokenMatches, rawSecretMatches } from "./secure-compare";

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

  it("still uses crypto.timingSafeEqual under the hood, so a refactor cannot silently swap in a short-circuiting comparison", () => {
    const source = readFileSync(join(__dirname, "secure-compare.ts"), "utf8");
    expect(source).toMatch(/timingSafeEqual\(/);
  });
});

describe("bearerTokenMatches", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => consoleErrorSpy.mockClear());
  afterEach(() => consoleErrorSpy.mockReset());

  it("matches a correctly formatted bearer header against the configured secret", () => {
    expect(bearerTokenMatches("Bearer my-secret", "my-secret", "TEST_SECRET")).toBe(true);
    expect(bearerTokenMatches("Bearer wrong", "my-secret", "TEST_SECRET")).toBe(false);
  });

  it("logs distinctly and rejects when the configured secret is unset or empty, instead of matching a literal 'undefined'", () => {
    expect(bearerTokenMatches("Bearer undefined", undefined, "TEST_SECRET")).toBe(false);
    expect(bearerTokenMatches("Bearer ", "", "TEST_SECRET")).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("TEST_SECRET não está configurado"));
  });
});

describe("rawSecretMatches", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => consoleErrorSpy.mockClear());
  afterEach(() => consoleErrorSpy.mockReset());

  it("matches a raw received secret against the configured secret", () => {
    expect(rawSecretMatches("my-secret", "my-secret", "TEST_SECRET")).toBe(true);
    expect(rawSecretMatches("wrong", "my-secret", "TEST_SECRET")).toBe(false);
  });

  it("logs distinctly and rejects when the configured secret is unset or empty", () => {
    expect(rawSecretMatches("anything", undefined, "TEST_SECRET")).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("TEST_SECRET não está configurado"));
  });
});
