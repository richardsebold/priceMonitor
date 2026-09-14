import { describe, it, expect, vi, beforeEach } from "vitest";

const getSessionUserIdMock = vi.fn();
const setWeeklySummaryEnabledMock = vi.fn();

vi.mock("@/modules/identity/session", () => ({
  getSessionUserId: () => getSessionUserIdMock(),
}));

vi.mock("../infra/notification-repository", () => ({
  setPriceAlertsEnabled: vi.fn(),
  setWeeklySummaryEnabled: (...args: unknown[]) => setWeeklySummaryEnabledMock(...args),
}));

import { setWeeklySummaryEnabled } from "./update-notification-prefs";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("setWeeklySummaryEnabled", () => {
  it("throws when there is no active session", async () => {
    getSessionUserIdMock.mockResolvedValue(null);

    await expect(setWeeklySummaryEnabled(true)).rejects.toThrow("Usuário não autenticado");
    expect(setWeeklySummaryEnabledMock).not.toHaveBeenCalled();
  });

  it("persists the preference for the session user", async () => {
    getSessionUserIdMock.mockResolvedValue("user-1");

    const result = await setWeeklySummaryEnabled(false);

    expect(setWeeklySummaryEnabledMock).toHaveBeenCalledWith("user-1", false);
    expect(result).toEqual({ weeklySummaryEnabled: false });
  });
});
