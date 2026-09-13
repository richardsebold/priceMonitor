import { describe, it, expect } from "vitest";
import { isWithinRefundWindow, refundDeadline, REFUND_WINDOW_DAYS } from "./refund";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

describe("isWithinRefundWindow", () => {
  it("returns false when no start date is given", () => {
    expect(isWithinRefundWindow(null)).toBe(false);
    expect(isWithinRefundWindow(undefined)).toBe(false);
  });

  it("returns false for an invalid date", () => {
    expect(isWithinRefundWindow("not-a-date")).toBe(false);
  });

  it("returns true when the subscription started just now", () => {
    expect(isWithinRefundWindow(new Date())).toBe(true);
  });

  it("returns true when within the refund window", () => {
    expect(isWithinRefundWindow(daysAgo(REFUND_WINDOW_DAYS - 1))).toBe(true);
  });

  it("returns false when past the refund window", () => {
    expect(isWithinRefundWindow(daysAgo(REFUND_WINDOW_DAYS + 1))).toBe(false);
  });

  it("accepts a date string as well as a Date", () => {
    expect(isWithinRefundWindow(daysAgo(1).toISOString())).toBe(true);
  });
});

describe("refundDeadline", () => {
  it("returns null when no start date is given", () => {
    expect(refundDeadline(null)).toBeNull();
    expect(refundDeadline(undefined)).toBeNull();
  });

  it("returns null for an invalid date", () => {
    expect(refundDeadline("not-a-date")).toBeNull();
  });

  it("returns the start date plus the refund window", () => {
    const start = new Date("2024-01-01T00:00:00.000Z");
    const deadline = refundDeadline(start);

    expect(deadline).not.toBeNull();
    expect(deadline!.getTime()).toBe(start.getTime() + REFUND_WINDOW_DAYS * DAY_MS);
  });
});
