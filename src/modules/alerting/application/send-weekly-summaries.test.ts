import { describe, it, expect, vi, beforeEach } from "vitest";

const findWeeklySummaryRecipientsMock = vi.fn();
const sendWeeklySummaryMock = vi.fn();

vi.mock("../infra/notification-repository", () => ({
  findWeeklySummaryRecipients: () => findWeeklySummaryRecipientsMock(),
}));

vi.mock("../channels/email", () => ({
  sendWeeklySummary: (...args: unknown[]) => sendWeeklySummaryMock(...args),
}));

import { sendWeeklySummaries } from "./send-weekly-summaries";

const now = new Date("2026-01-08T00:00:00.000Z");

function user(overrides: Partial<{ id: string; email: string; name: string; products: unknown[] }>) {
  return {
    id: "user-1",
    email: "user@test.com",
    name: "Ana",
    products: [],
    ...overrides,
  };
}

const productWithDrop = {
  name: "Fone",
  price: 80,
  priceTarget: 100,
  history: [
    { price: 100, createdAt: new Date("2025-12-29T00:00:00.000Z") },
    { price: 90, createdAt: new Date("2026-01-05T00:00:00.000Z") },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  sendWeeklySummaryMock.mockResolvedValue(undefined);
});

describe("sendWeeklySummaries", () => {
  it("sends a weekly summary email to each opted-in user with tracked products", async () => {
    findWeeklySummaryRecipientsMock.mockResolvedValue([
      user({ id: "u1", email: "u1@test.com", name: "Ana", products: [productWithDrop] }),
      user({ id: "u2", email: "u2@test.com", name: "Bia", products: [productWithDrop] }),
    ]);

    await sendWeeklySummaries(now);

    expect(sendWeeklySummaryMock).toHaveBeenCalledTimes(2);
    expect(sendWeeklySummaryMock).toHaveBeenCalledWith("u1@test.com", "Ana", expect.any(Object));
    expect(sendWeeklySummaryMock).toHaveBeenCalledWith("u2@test.com", "Bia", expect.any(Object));
  });

  it("skips a user with no tracked products", async () => {
    findWeeklySummaryRecipientsMock.mockResolvedValue([user({ products: [] })]);

    await sendWeeklySummaries(now);

    expect(sendWeeklySummaryMock).not.toHaveBeenCalled();
  });

  it("logs and continues to the next user when one send fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    findWeeklySummaryRecipientsMock.mockResolvedValue([
      user({ id: "u1", email: "u1@test.com", products: [productWithDrop] }),
      user({ id: "u2", email: "u2@test.com", products: [productWithDrop] }),
    ]);
    sendWeeklySummaryMock.mockRejectedValueOnce(new Error("Resend indisponível"));
    sendWeeklySummaryMock.mockResolvedValueOnce(undefined);

    await sendWeeklySummaries(now);

    expect(sendWeeklySummaryMock).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("u1@test.com"),
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("logs how many summaries were sent and how many failed", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    findWeeklySummaryRecipientsMock.mockResolvedValue([
      user({ id: "u1", email: "u1@test.com", products: [productWithDrop] }),
      user({ id: "u2", email: "u2@test.com", products: [productWithDrop] }),
    ]);
    sendWeeklySummaryMock.mockRejectedValueOnce(new Error("Resend indisponível"));
    sendWeeklySummaryMock.mockResolvedValueOnce(undefined);

    await sendWeeklySummaries(now);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("1 enviados, 1 falharam"),
    );

    vi.restoreAllMocks();
  });

  it("uses sumPotentialSavings unchanged to total the potential savings", async () => {
    findWeeklySummaryRecipientsMock.mockResolvedValue([
      user({
        products: [
          { name: "A", price: 80, priceTarget: 100, history: [] },
          { name: "B", price: 40, priceTarget: 50, history: [] },
        ],
      }),
    ]);

    await sendWeeklySummaries(now);

    expect(sendWeeklySummaryMock).toHaveBeenCalledWith(
      "user@test.com",
      "Ana",
      expect.objectContaining({ potentialSavings: 30 }),
    );
  });

  it("still sends the list and potential savings when no product dropped this week, omitting only the biggest-drop highlight", async () => {
    findWeeklySummaryRecipientsMock.mockResolvedValue([
      user({
        products: [
          {
            name: "Estável",
            price: 100,
            priceTarget: 90,
            history: [{ price: 100, createdAt: new Date("2025-12-20T00:00:00.000Z") }],
          },
        ],
      }),
    ]);

    await sendWeeklySummaries(now);

    expect(sendWeeklySummaryMock).toHaveBeenCalledWith(
      "user@test.com",
      "Ana",
      expect.objectContaining({
        biggestDrop: null,
        changes: [expect.objectContaining({ name: "Estável", priceNow: 100, priceWeekAgo: 100 })],
        potentialSavings: 0,
      }),
    );
  });
});
