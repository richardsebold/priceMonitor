import { describe, it, expect } from "vitest";
import { normalizeProductUrl } from "./product-url";

describe("normalizeProductUrl", () => {
  it("lowercases the host and drops www", () => {
    expect(normalizeProductUrl("https://WWW.Loja.COM.br/Item/Abc")).toBe("loja.com.br/Item/Abc");
  });

  it("drops query and hash", () => {
    expect(normalizeProductUrl("https://loja.com.br/item/1?utm_source=x&ref=y#reviews")).toBe(
      "loja.com.br/item/1",
    );
  });

  it("drops the trailing slash", () => {
    expect(normalizeProductUrl("https://loja.com.br/item/1/")).toBe("loja.com.br/item/1");
  });

  it("reduces a KaBuM url to its product id", () => {
    expect(
      normalizeProductUrl(
        "https://www.kabum.com.br/produto/662346/smartphone-motorola-moto-g35-5g?awc=123",
      ),
    ).toBe("kabum.com.br/produto/662346");
    expect(normalizeProductUrl("https://www.kabum.com.br/produto/662346")).toBe(
      "kabum.com.br/produto/662346",
    );
  });

  it("reduces an Amazon url to its ASIN", () => {
    expect(
      normalizeProductUrl("https://www.amazon.com.br/Apple-iPhone-17/dp/B0FQG1A3Z1/ref=sr_1_1?keywords=iphone"),
    ).toBe("amazon.com.br/dp/B0FQG1A3Z1");
    expect(normalizeProductUrl("https://amazon.com.br/gp/product/B0FQG1A3Z1")).toBe(
      "amazon.com.br/dp/B0FQG1A3Z1",
    );
  });
});
