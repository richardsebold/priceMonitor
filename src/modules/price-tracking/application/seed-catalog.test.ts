import { describe, it, expect, vi, beforeEach } from "vitest";

const userUpsertMock = vi.fn();
const productFindManyMock = vi.fn();
const productCreateMock = vi.fn();
const priceCreateMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: (...args: unknown[]) => userUpsertMock(...args),
    },
    productHistory: {
      findMany: (...args: unknown[]) => productFindManyMock(...args),
      create: (...args: unknown[]) => productCreateMock(...args),
    },
    priceHistory: {
      create: (...args: unknown[]) => priceCreateMock(...args),
    },
  },
}));

import { seedCatalog } from "./seed-catalog";
import { CATALOG_USER_ID } from "../domain/catalog";

const scraped = (price: number) => ({
  price,
  name: "Produto",
  currency: "BRL",
  image: "https://img/x.jpg",
  store: "kabum.com.br",
  method: "json-ld",
});

describe("seedCatalog", () => {
  beforeEach(() => {
    userUpsertMock.mockReset().mockResolvedValue({ id: "system-catalog" });
    productFindManyMock.mockReset().mockResolvedValue([]);
    productCreateMock.mockReset().mockImplementation(({ data }) => Promise.resolve({ id: `p-${data.url}`, ...data }));
    priceCreateMock.mockReset().mockResolvedValue({});
  });

  it("upserts the catalog user", async () => {
    await seedCatalog({ urls: [], scrape: vi.fn() });

    expect(CATALOG_USER_ID).toBe("system-catalog");
    expect(userUpsertMock).toHaveBeenCalledTimes(1);
    const arg = userUpsertMock.mock.calls[0][0];
    expect(arg.where).toEqual({ id: "system-catalog" });
    expect(arg.create).toMatchObject({
      id: "system-catalog",
      email: "catalogo@system.monitorador.invalid",
      name: "Catálogo",
      priceAlertsEnabled: false,
      weeklySummaryEnabled: false,
    });
    expect(arg.update).toMatchObject({ priceAlertsEnabled: false, weeklySummaryEnabled: false });
  });

  it("creates missing catalog products", async () => {
    const scrape = vi.fn().mockResolvedValue(scraped(1999.9));

    await seedCatalog({ urls: ["https://www.kabum.com.br/produto/1/a"], scrape });

    expect(productCreateMock).toHaveBeenCalledTimes(1);
    const data = productCreateMock.mock.calls[0][0].data;
    expect(data).toMatchObject({
      url: "https://www.kabum.com.br/produto/1/a",
      userId: "system-catalog",
      priceTarget: 0,
      price: 1999.9,
    });
    expect(data.lastPriceReadAt).toBeInstanceOf(Date);
    expect(priceCreateMock).toHaveBeenCalledWith({
      data: { price: 1999.9, productId: "p-https://www.kabum.com.br/produto/1/a" },
    });
  });

  it("skips urls already seeded", async () => {
    productFindManyMock.mockResolvedValue([{ url: "https://www.kabum.com.br/produto/1/a" }]);
    const scrape = vi.fn().mockResolvedValue(scraped(10));

    await seedCatalog({
      urls: ["https://www.kabum.com.br/produto/1/a", "https://www.kabum.com.br/produto/2/b"],
      scrape,
    });

    expect(scrape).toHaveBeenCalledTimes(1);
    expect(scrape).toHaveBeenCalledWith("https://www.kabum.com.br/produto/2/b");
    expect(productCreateMock).toHaveBeenCalledTimes(1);
    expect(productCreateMock.mock.calls[0][0].data.url).toBe("https://www.kabum.com.br/produto/2/b");
    expect(priceCreateMock).toHaveBeenCalledTimes(1);
  });

  it("skips urls already seeded only when the catalog user has them", async () => {
    const rows = [
      { url: "https://www.kabum.com.br/produto/1/a", userId: "system-catalog" },
      { url: "https://www.kabum.com.br/produto/2/b", userId: "user-1" },
    ];
    productFindManyMock.mockImplementation(({ where }: { where: { userId?: string } }) =>
      Promise.resolve(
        rows
          .filter((row) => where.userId === undefined || row.userId === where.userId)
          .map(({ url }) => ({ url })),
      ),
    );
    const scrape = vi.fn().mockResolvedValue(scraped(10));

    await seedCatalog({
      urls: ["https://www.kabum.com.br/produto/1/a", "https://www.kabum.com.br/produto/2/b"],
      scrape,
    });

    expect(scrape).toHaveBeenCalledTimes(1);
    expect(scrape).toHaveBeenCalledWith("https://www.kabum.com.br/produto/2/b");
    expect(productCreateMock.mock.calls.map(([arg]) => arg.data.url)).toEqual([
      "https://www.kabum.com.br/produto/2/b",
    ]);
  });

  it("skips a failed scrape and continues", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const scrape = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(scraped(0))
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValueOnce(scraped(500));
    const urls = ["https://k/1", "https://k/2", "https://k/3", "https://k/4"];

    const result = await seedCatalog({ urls, scrape });

    expect(scrape).toHaveBeenCalledTimes(4);
    expect(productCreateMock).toHaveBeenCalledTimes(1);
    expect(productCreateMock.mock.calls[0][0].data.url).toBe("https://k/4");
    expect(priceCreateMock).toHaveBeenCalledTimes(1);
    expect(result.failed).toEqual(["https://k/1", "https://k/2", "https://k/3"]);
    const logged = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
    for (const url of ["https://k/1", "https://k/2", "https://k/3"]) {
      expect(logged).toContain(url);
    }
    errorSpy.mockRestore();
  });
});
