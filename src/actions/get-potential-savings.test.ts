import { describe, it, expect, vi, beforeEach } from "vitest";

const findManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productHistory: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

import { getPotentialSavings } from "./get-potential-savings";

describe("getPotentialSavings", () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("sums the difference between target and current price for target-reached products", async () => {
    findManyMock.mockResolvedValue([
      { price: 80, priceTarget: 100 },
      { price: 40, priceTarget: 50 },
    ]);

    const result = await getPotentialSavings("user-1");

    expect(result).toBe(30);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { targetReached: true, userId: "user-1" },
    });
  });

  it("ignores products whose price is not below the target", () => {
    findManyMock.mockResolvedValue([{ price: 150, priceTarget: 120 }]);

    return expect(getPotentialSavings("user-1")).resolves.toBe(0);
  });

  it("returns 0 when there are no target-reached products", async () => {
    findManyMock.mockResolvedValue([]);

    const result = await getPotentialSavings("user-1");

    expect(result).toBe(0);
  });
});
