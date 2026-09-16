import { createHash, timingSafeEqual } from "crypto";

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function secretsMatch(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;
  return timingSafeEqual(digest(a), digest(b));
}
