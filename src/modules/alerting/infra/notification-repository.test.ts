import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import path from "path";

const findManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

import { findWeeklySummaryRecipients } from "./notification-repository";

describe("weeklySummaryEnabled schema default", () => {
  it("declares weeklySummaryEnabled with a default of true so existing users get it without a backfill script", () => {
    const schema = readFileSync(path.resolve(process.cwd(), "prisma/schema.prisma"), "utf-8");

    expect(schema).toMatch(/weeklySummaryEnabled\s+Boolean\s+@default\(true\)/);
  });
});

describe("findWeeklySummaryRecipients", () => {
  it("only selects users with weeklySummaryEnabled true", async () => {
    findManyMock.mockResolvedValue([]);

    await findWeeklySummaryRecipients();

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { weeklySummaryEnabled: true } }),
    );
  });
});
