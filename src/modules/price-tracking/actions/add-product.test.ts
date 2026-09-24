import { describe, it, expect, vi, beforeEach } from "vitest";

const countMock = vi.fn();
const findUniqueMock = vi.fn();
const productCreateMock = vi.fn();
const priceCreateMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productHistory: {
      count: (...args: unknown[]) => countMock(...args),
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      create: (...args: unknown[]) => productCreateMock(...args),
    },
    priceHistory: {
      create: (...args: unknown[]) => priceCreateMock(...args),
    },
  },
}));

const getUserMock = vi.fn();
vi.mock("@/modules/identity/actions/get-user", () => ({
  getUser: () => getUserMock(),
}));

const scrapeProductMock = vi.fn();
vi.mock("../scraping/scrape-product", () => ({
  scrapeProduct: (...args: unknown[]) => scrapeProductMock(...args),
}));

import { NewProduct } from "./add-product";

const URL = "https://www.kabum.com.br/produto/1/a";

describe("NewProduct", () => {
  beforeEach(() => {
    getUserMock.mockReset().mockResolvedValue({ id: "user-1", planId: "plano_hacker_mensal" });
    countMock.mockReset().mockResolvedValue(0);
    findUniqueMock.mockReset().mockResolvedValue(null);
    productCreateMock.mockReset().mockImplementation(({ data }) => Promise.resolve({ id: "p1", ...data }));
    priceCreateMock.mockReset().mockResolvedValue({});
    scrapeProductMock.mockReset().mockResolvedValue({
      price: 100,
      name: "Produto",
      currency: "BRL",
      image: "",
      method: "json-ld",
      store: "kabum.com.br",
    });
  });

  it("sets lastPriceReadAt on creation", async () => {
    await NewProduct(URL, 90);

    const data = productCreateMock.mock.calls[0][0].data;
    expect(data.lastPriceReadAt).toBeInstanceOf(Date);
  });

  it("addedFrom is carousel when the carousel adds the product", async () => {
    await NewProduct(URL, 90, { addedFrom: "carousel" });

    expect(productCreateMock.mock.calls[0][0].data.addedFrom).toBe("carousel");
  });

  it("addedFrom is null when no origin is given", async () => {
    await NewProduct(URL, 90);

    expect(productCreateMock.mock.calls[0][0].data.addedFrom).toBeNull();
  });
});
