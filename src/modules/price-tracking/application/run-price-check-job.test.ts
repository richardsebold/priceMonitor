import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();
const updateMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productHistory: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
    priceHistory: {
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

const scrapeProductMock = vi.fn();

vi.mock("../scraping/scrape-product", () => ({
  scrapeProduct: (...args: unknown[]) => scrapeProductMock(...args),
}));

import { runPriceCheckJob } from "./run-price-check-job";

const scraped = (price: number) => ({
  price,
  name: "Produto Teste",
  currency: "BRL",
  image: "",
  store: "amazon.com.br",
  method: "regex" as const,
});

const baseProduct = {
  id: "prod-1",
  name: "Produto Teste",
  url: "https://www.amazon.com.br/produto",
  price: 2699.9,
  priceTarget: 2000,
  targetReached: false,
  userId: "user-1",
  user: { email: "user@test.com" },
};

describe("runPriceCheckJob", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    updateMock.mockReset();
    createMock.mockReset();
    scrapeProductMock.mockReset();
  });

  it("discards an unconfirmed implausible reading without writing history or firing an event", async () => {
    findManyMock.mockResolvedValue([baseProduct]);
    scrapeProductMock
      .mockResolvedValueOnce(scraped(80.6))
      .mockResolvedValueOnce(scraped(999.9));

    const onPriceEvent = vi.fn();
    await runPriceCheckJob({ onPriceEvent });

    expect(createMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect(onPriceEvent).not.toHaveBeenCalled();
    expect(scrapeProductMock).toHaveBeenCalledTimes(2);
  });

  it("logs previous, first and second reads when discarding an unconfirmed implausible reading", async () => {
    findManyMock.mockResolvedValue([baseProduct]);
    scrapeProductMock
      .mockResolvedValueOnce(scraped(80.6))
      .mockResolvedValueOnce(scraped(999.9));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await runPriceCheckJob({ onPriceEvent: vi.fn() });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("anterior=2699.9, leitura1=80.6, leitura2=999.9"),
    );

    warnSpy.mockRestore();
  });

  it("accepts an implausible reading confirmed by a second read within tolerance", async () => {
    findManyMock.mockResolvedValue([baseProduct]);
    scrapeProductMock
      .mockResolvedValueOnce(scraped(80.6))
      .mockResolvedValueOnce(scraped(81));

    const onPriceEvent = vi.fn();
    await runPriceCheckJob({ onPriceEvent });

    expect(createMock).toHaveBeenCalledWith({ data: { price: 81, productId: "prod-1" } });
    expect(onPriceEvent).toHaveBeenCalledTimes(1);
    expect(onPriceEvent.mock.calls[0][0]).toMatchObject({
      type: "TARGET_REACHED",
      previousPrice: 2699.9,
    });
  });

  it("logs previous, first and second reads when accepting a confirmed implausible reading", async () => {
    findManyMock.mockResolvedValue([baseProduct]);
    scrapeProductMock
      .mockResolvedValueOnce(scraped(80.6))
      .mockResolvedValueOnce(scraped(81));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await runPriceCheckJob({ onPriceEvent: vi.fn() });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("anterior=2699.9, leitura1=80.6, leitura2=81"),
    );

    warnSpy.mockRestore();
  });

  it("does not perform a second scrape when the reading is not implausible", async () => {
    findManyMock.mockResolvedValue([baseProduct]);
    scrapeProductMock.mockResolvedValueOnce(scraped(2400));

    await runPriceCheckJob({ onPriceEvent: vi.fn() });

    expect(scrapeProductMock).toHaveBeenCalledTimes(1);
  });

  it("discards the reading when the confirmation scrape fails", async () => {
    findManyMock.mockResolvedValue([baseProduct]);
    scrapeProductMock
      .mockResolvedValueOnce(scraped(80.6))
      .mockRejectedValueOnce(new Error("network error"));

    const onPriceEvent = vi.fn();
    await runPriceCheckJob({ onPriceEvent });

    expect(createMock).not.toHaveBeenCalled();
    expect(onPriceEvent).not.toHaveBeenCalled();
  });
});
