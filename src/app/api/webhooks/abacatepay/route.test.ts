import { describe, it, expect, vi, beforeEach } from "vitest";

const handleAbacatePayWebhookMock = vi.fn();

vi.mock("@/modules/billing/application/handle-webhook-event", () => ({
  handleAbacatePayWebhook: (...args: unknown[]) => handleAbacatePayWebhookMock(...args),
}));

import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ABACATEPAY_WEBHOOK_SECRET = "test-webhook-secret";
});

describe("POST /api/webhooks/abacatepay", () => {
  it("returns 401 and never calls the handler when the secret is wrong", async () => {
    const request = new Request(
      "http://localhost/api/webhooks/abacatepay?webhookSecret=wrong-secret",
      { method: "POST", body: JSON.stringify({ event: "billing.paid" }) },
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(handleAbacatePayWebhookMock).not.toHaveBeenCalled();
  });

  it("calls the handler and returns 200 when the secret is correct", async () => {
    handleAbacatePayWebhookMock.mockResolvedValue(undefined);
    const body = { event: "billing.paid" };
    const request = new Request(
      "http://localhost/api/webhooks/abacatepay?webhookSecret=test-webhook-secret",
      { method: "POST", body: JSON.stringify(body) },
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(handleAbacatePayWebhookMock).toHaveBeenCalledTimes(1);
    expect(handleAbacatePayWebhookMock).toHaveBeenCalledWith(body);
  });

  it("never authenticates when ABACATEPAY_WEBHOOK_SECRET is unset", async () => {
    delete process.env.ABACATEPAY_WEBHOOK_SECRET;
    const request = new Request(
      "http://localhost/api/webhooks/abacatepay?webhookSecret=undefined",
      { method: "POST", body: JSON.stringify({ event: "billing.paid" }) },
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(handleAbacatePayWebhookMock).not.toHaveBeenCalled();
  });
});
