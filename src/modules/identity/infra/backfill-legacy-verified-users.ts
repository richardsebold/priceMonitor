import { prisma } from "@/lib/prisma";

// Fixed at authoring time, not `new Date()`: this must run exactly once, and a
// later accidental re-run must not sweep up a genuinely unverified sign-up.
export const LEGACY_VERIFIED_CUTOVER = new Date("2026-09-15T00:00:00.000Z");

export async function backfillLegacyVerifiedUsers() {
  return prisma.user.updateMany({
    where: { emailVerified: false, createdAt: { lt: LEGACY_VERIFIED_CUTOVER } },
    data: { emailVerified: true },
  });
}
