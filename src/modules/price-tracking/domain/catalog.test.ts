import { describe, it, expect } from "vitest";
import { CATALOG_SEED_URLS } from "./catalog";
import { normalizeProductUrl } from "./product-url";

const EXPECTED_PRODUCT_IDS = [
  "662346",
  "921087",
  "925347",
  "1037468",
  "649861",
  "1048035",
  "911480",
  "935217",
  "1036371",
  "938426",
  "1006099",
  "957829",
];

describe("CATALOG_SEED_URLS", () => {
  it("seed list has the 12 KaBuM products from the discovery, without duplicates", () => {
    expect(CATALOG_SEED_URLS).toHaveLength(12);
    const ids = CATALOG_SEED_URLS.map((url) => {
      expect(url.startsWith("https://www.kabum.com.br/produto/")).toBe(true);
      return new URL(url).pathname.split("/")[2];
    });
    expect([...ids].sort()).toEqual([...EXPECTED_PRODUCT_IDS].sort());
    expect(new Set(CATALOG_SEED_URLS.map(normalizeProductUrl)).size).toBe(12);
  });
});
