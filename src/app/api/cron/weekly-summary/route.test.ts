import { describe, it, expect, vi, beforeEach } from "vitest";

const sendWeeklySummariesMock = vi.fn();

vi.mock("@/modules/alerting/application/send-weekly-summaries", () => ({
  sendWeeklySummaries: (...args: unknown[]) => sendWeeklySummariesMock(...args),
}));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-secret";
});

describe("GET /api/cron/weekly-summary", () => {
  it("returns 401 and never runs the job when the bearer token is wrong", async () => {
    const request = new Request("http://localhost/api/cron/weekly-summary", {
      headers: { authorization: "Bearer wrong-secret" },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(sendWeeklySummariesMock).not.toHaveBeenCalled();
  });

  it("runs the job and returns 200 when the bearer token is correct", async () => {
    sendWeeklySummariesMock.mockResolvedValue(undefined);
    const request = new Request("http://localhost/api/cron/weekly-summary", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(sendWeeklySummariesMock).toHaveBeenCalledTimes(1);
  });
});
