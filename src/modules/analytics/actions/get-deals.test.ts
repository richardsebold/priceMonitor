import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productHistory: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

const getSessionUserIdMock = vi.fn();
vi.mock("@/modules/identity/session", () => ({
  getSessionUserId: () => getSessionUserIdMock(),
}));

import { getDeals } from "./get-deals";

const DAY = 24 * 60 * 60 * 1000;

function catalogProduct(id: string, url: string, price: number, reference = 100) {
  return {
    id,
    url,
    name: `Produto ${id}`,
    image: null,
    store: "kabum.com.br",
    price,
    lastPriceReadAt: new Date(Date.now() - 60 * 1000),
    history: [
      { price: reference, createdAt: new Date(Date.now() - 10 * DAY) },
      { price, createdAt: new Date(Date.now() - 60 * 1000) },
    ],
  };
}

type Where = { userId?: string | { not: string } };

function mockDb(catalog: unknown[], tracked: { url: string; userId: string }[]) {
  findManyMock.mockImplementation(({ where }: { where: Where }) => {
    if (where.userId === "system-catalog") return Promise.resolve(catalog);
    return Promise.resolve(tracked);
  });
}

describe("getDeals", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    getSessionUserIdMock.mockReset().mockResolvedValue("user-1");
  });

  it("no session returns an empty list without reading the database", async () => {
    getSessionUserIdMock.mockResolvedValue(null);

    await expect(getDeals()).resolves.toEqual([]);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("only catalog products are candidates", async () => {
    mockDb([], []);

    await getDeals();

    const catalogQueries = findManyMock.mock.calls.filter(
      ([arg]) => arg.where.userId === "system-catalog",
    );
    expect(catalogQueries).toHaveLength(1);
    expect(catalogQueries[0][0].where).toEqual({ userId: "system-catalog" });
  });

  it("popularity counts distinct non-catalog users by normalized url", async () => {
    mockDb(
      [
        catalogProduct("a", "https://www.kabum.com.br/produto/1/a", 90),
        catalogProduct("b", "https://www.kabum.com.br/produto/2/b", 80),
      ],
      [
        { url: "https://www.kabum.com.br/produto/1/a", userId: "u2" },
        { url: "https://www.kabum.com.br/produto/1/a?utm_source=x", userId: "u3" },
        { url: "https://kabum.com.br/produto/1/outro-slug", userId: "u3" },
        { url: "https://www.kabum.com.br/produto/1/a", userId: "system-catalog" },
      ],
    );

    const deals = await getDeals();

    expect(deals.map((d) => [d.id, d.popularity])).toEqual([
      ["a", 2],
      ["b", 0],
    ]);
    const trackedQuery = findManyMock.mock.calls.find(
      ([arg]) => arg.where.userId !== "system-catalog",
    );
    expect(trackedQuery![0].where).toEqual({ userId: { not: "system-catalog" } });
  });

  it("returns at most 12 deals", async () => {
    const catalog = Array.from({ length: 13 }, (_, i) =>
      catalogProduct(`p${i}`, `https://www.kabum.com.br/produto/${i + 1}/x`, 90),
    );
    mockDb(catalog, []);

    await expect(getDeals()).resolves.toHaveLength(12);
  });

  it("marks alreadyTracked for urls the session user monitors", async () => {
    mockDb(
      [
        catalogProduct("a", "https://www.kabum.com.br/produto/1/a", 90),
        catalogProduct("b", "https://www.kabum.com.br/produto/2/b", 80),
      ],
      [
        { url: "https://www.kabum.com.br/produto/1/a?awc=9", userId: "user-1" },
        { url: "https://www.kabum.com.br/produto/2/b", userId: "u9" },
      ],
    );

    const deals = await getDeals();

    const byId = Object.fromEntries(deals.map((d) => [d.id, d.alreadyTracked]));
    expect(byId).toEqual({ a: true, b: false });
  });
});
