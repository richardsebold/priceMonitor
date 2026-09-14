import { describe, it, expect, vi, beforeEach } from "vitest";

const sendEmailMock = vi.fn();

vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => sendEmailMock(...args),
}));

import { sendWeeklySummary } from "./email";

beforeEach(() => {
  vi.clearAllMocks();
  sendEmailMock.mockResolvedValue({ error: null });
});

describe("sendWeeklySummary", () => {
  it("sends the weekly summary with the subject Seu Resumo Semanal de Preços", async () => {
    await sendWeeklySummary("user@test.com", "Ana", {
      changes: [],
      biggestDrop: null,
      potentialSavings: 0,
    });

    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: "Seu Resumo Semanal de Preços",
      }),
    );
  });
});
