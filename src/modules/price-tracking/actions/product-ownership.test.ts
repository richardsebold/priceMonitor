import { describe, it, expect, vi, beforeEach } from "vitest";

const getSessionUserIdMock = vi.fn();
const deleteManyMock = vi.fn();
const updateManyMock = vi.fn();
const priceHistoryFindManyMock = vi.fn();

vi.mock("@/modules/identity/session", () => ({
  getSessionUserId: () => getSessionUserIdMock(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productHistory: {
      deleteMany: (...args: unknown[]) => deleteManyMock(...args),
      updateMany: (...args: unknown[]) => updateManyMock(...args),
    },
    priceHistory: {
      findMany: (...args: unknown[]) => priceHistoryFindManyMock(...args),
    },
  },
}));

import { deleteProduct } from "./delete-product";
import { editProduct } from "./edit-product";
import { getProductHistory } from "./get-product-history";

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserIdMock.mockResolvedValue("user-1");
});

describe("deleteProduct", () => {
  it("only deletes products owned by the session user", async () => {
    deleteManyMock.mockResolvedValue({ count: 1 });

    const result = await deleteProduct("prod-1");

    expect(deleteManyMock).toHaveBeenCalledWith({ where: { id: "prod-1", userId: "user-1" } });
    expect(result).toBeTruthy();
  });

  it("returns undefined when the product belongs to someone else", async () => {
    deleteManyMock.mockResolvedValue({ count: 0 });

    expect(await deleteProduct("someone-elses")).toBeUndefined();
  });

  it("does nothing without a session", async () => {
    getSessionUserIdMock.mockResolvedValue(null);

    expect(await deleteProduct("prod-1")).toBeUndefined();
    expect(deleteManyMock).not.toHaveBeenCalled();
  });
});

describe("editProduct", () => {
  it("only edits products owned by the session user", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });

    await editProduct({ idProduct: "prod-1", newProduct: "https://loja.com/p" });

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: "prod-1", userId: "user-1" },
      data: { url: "https://loja.com/p" },
    });
  });

  it("does nothing without a session", async () => {
    getSessionUserIdMock.mockResolvedValue(null);

    expect(await editProduct({ idProduct: "prod-1", newProduct: "x" })).toBeUndefined();
    expect(updateManyMock).not.toHaveBeenCalled();
  });
});

describe("getProductHistory", () => {
  it("filters history by the session user's products", async () => {
    priceHistoryFindManyMock.mockResolvedValue([]);

    await getProductHistory("prod-1");

    expect(priceHistoryFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { productId: "prod-1", product: { userId: "user-1" } } }),
    );
  });

  it("returns an empty list without a session", async () => {
    getSessionUserIdMock.mockResolvedValue(null);

    expect(await getProductHistory("prod-1")).toEqual([]);
    expect(priceHistoryFindManyMock).not.toHaveBeenCalled();
  });
});
