import { describe, it, expect, vi, beforeEach } from "vitest";

const runPriceCheckJobMock = vi.fn();

vi.mock("@/modules/price-tracking/application/run-price-check-job", () => ({
  runPriceCheckJob: (...args: unknown[]) => runPriceCheckJobMock(...args),
}));

vi.mock("@/modules/alerting/application/handle-price-event", () => ({
  handlePriceEvent: vi.fn(),
}));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-secret";
});

describe("GET /api/cron/check-prices", () => {
  it("returns 401 and never runs the job when the bearer token is wrong", async () => {
    const request = new Request("http://localhost/api/cron/check-prices", {
      headers: { authorization: "Bearer wrong-secret" },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(runPriceCheckJobMock).not.toHaveBeenCalled();
  });

  it("runs the job and returns 200 when the bearer token is correct", async () => {
    runPriceCheckJobMock.mockResolvedValue(undefined);
    const request = new Request("http://localhost/api/cron/check-prices", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(runPriceCheckJobMock).toHaveBeenCalledTimes(1);
  });

  it("never authenticates when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    const request = new Request("http://localhost/api/cron/check-prices", {
      headers: { authorization: "Bearer undefined" },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(runPriceCheckJobMock).not.toHaveBeenCalled();
  });
});
