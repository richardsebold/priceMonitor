import { describe, it, expect, vi, beforeEach } from "vitest";

const updateManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      updateMany: (...args: unknown[]) => updateManyMock(...args),
    },
  },
}));

import {
  backfillLegacyVerifiedUsers,
  LEGACY_VERIFIED_CUTOVER,
} from "./backfill-legacy-verified-users";

describe("backfillLegacyVerifiedUsers", () => {
  beforeEach(() => {
    updateManyMock.mockReset();
  });

  it("backfill only reaches unverified users created before the cutover", async () => {
    updateManyMock.mockResolvedValue({ count: 3 });

    await backfillLegacyVerifiedUsers();

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { emailVerified: false, createdAt: { lt: LEGACY_VERIFIED_CUTOVER } },
      data: { emailVerified: true },
    });
  });
});
