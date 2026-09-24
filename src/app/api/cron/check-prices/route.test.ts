import { describe, it, expect, vi, beforeEach } from "vitest";

const runPriceCheckJobMock = vi.fn();

vi.mock("@/modules/price-tracking/application/run-price-check-job", () => ({
  runPriceCheckJob: (...args: unknown[]) => runPriceCheckJobMock(...args),
}));

vi.mock("@/modules/alerting/application/handle-price-event", () => ({
  handlePriceEvent: vi.fn(),
}));

const afterMock = vi.fn();

vi.mock("next/server", () => ({
  after: (callback: () => unknown) => afterMock(callback),
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
    expect(afterMock).not.toHaveBeenCalled();
  });

  it("responds 200 immediately and schedules the job with after", async () => {
    runPriceCheckJobMock.mockResolvedValue(undefined);
    const request = new Request("http://localhost/api/cron/check-prices", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Verificação iniciada");
    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(runPriceCheckJobMock).not.toHaveBeenCalled();

    await afterMock.mock.calls[0][0]();

    expect(runPriceCheckJobMock).toHaveBeenCalledTimes(1);
  });

  it("logs a job failure that happens after the response", async () => {
    runPriceCheckJobMock.mockRejectedValue(new Error("banco fora do ar"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const request = new Request("http://localhost/api/cron/check-prices", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(request);
    await expect(afterMock.mock.calls[0][0]()).resolves.toBeUndefined();

    expect(response.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith("Erro no cron job:", expect.any(Error));
    errorSpy.mockRestore();
  });

  it("never authenticates when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    const request = new Request("http://localhost/api/cron/check-prices", {
      headers: { authorization: "Bearer undefined" },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(runPriceCheckJobMock).not.toHaveBeenCalled();
    expect(afterMock).not.toHaveBeenCalled();
  });
});
