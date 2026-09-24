import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PriceEvent } from "@/modules/price-tracking/domain/price-events";

const getRecipientMock = vi.fn();
const createAlertMock = vi.fn();
const sendPriceAlertMock = vi.fn();
const sendPriceDropAlertMock = vi.fn();

vi.mock("../infra/notification-repository", () => ({
  getRecipient: (...args: unknown[]) => getRecipientMock(...args),
  createAlert: (...args: unknown[]) => createAlertMock(...args),
}));

vi.mock("../channels/email", () => ({
  sendPriceAlert: (...args: unknown[]) => sendPriceAlertMock(...args),
  sendPriceDropAlert: (...args: unknown[]) => sendPriceDropAlertMock(...args),
}));

import { handlePriceEvent } from "./handle-price-event";

const product = {
  id: "prod-1",
  url: "https://loja.com/p",
  name: "Fone",
  price: 90,
  priceTarget: 100,
  targetReached: true,
  currency: "BRL",
  image: null,
  method: "json-ld",
  scrapedAt: new Date(),
  store: "loja",
  lastPriceReadAt: null,
  addedFrom: null,
  userId: "user-1",
};

const event = (type: PriceEvent["type"]): PriceEvent => ({
  type,
  userId: "user-1",
  product,
  previousPrice: 120,
});

beforeEach(() => {
  vi.clearAllMocks();
  getRecipientMock.mockResolvedValue({ email: "a@b.com", name: "Ana", priceAlertsEnabled: true });
});

describe("handlePriceEvent", () => {
  it("sends the target email and records the alert", async () => {
    await handlePriceEvent(event("TARGET_REACHED"));

    expect(sendPriceAlertMock).toHaveBeenCalledWith(product, "a@b.com", "Ana");
    expect(createAlertMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "TARGET_REACHED", productId: "prod-1", userId: "user-1", price: 90 }),
    );
  });

  it("sends the drop email with the previous price", async () => {
    await handlePriceEvent(event("PRICE_DROP"));

    expect(sendPriceDropAlertMock).toHaveBeenCalledWith(product, "a@b.com", "Ana", 120);
    expect(createAlertMock).toHaveBeenCalledWith(expect.objectContaining({ type: "PRICE_DROP" }));
  });

  it("does nothing when the user disabled price alerts", async () => {
    getRecipientMock.mockResolvedValue({ email: "a@b.com", name: "Ana", priceAlertsEnabled: false });

    await handlePriceEvent(event("TARGET_REACHED"));

    expect(sendPriceAlertMock).not.toHaveBeenCalled();
    expect(createAlertMock).not.toHaveBeenCalled();
  });
});
