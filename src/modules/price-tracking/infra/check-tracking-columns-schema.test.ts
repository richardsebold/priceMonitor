import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const root = process.cwd();

function productHistoryModel(schema: string) {
  const match = schema.match(/model ProductHistory \{([\s\S]*?)\n\}/);
  if (!match) throw new Error("model ProductHistory not found");
  return match[1];
}

describe("check tracking columns", () => {
  it("declares lastCheckedAt as optional and consecutiveFailures defaulting to 0 on ProductHistory", () => {
    const model = productHistoryModel(readFileSync(path.join(root, "prisma/schema.prisma"), "utf-8"));

    expect(model).toMatch(/\blastCheckedAt\s+DateTime\?\s*(\n|$)/);
    expect(model).toMatch(/\bconsecutiveFailures\s+Int\s+@default\(0\)\s*(\n|$)/);
  });

  it("has a migration adding lastCheckedAt as nullable and consecutiveFailures with a 0 default", () => {
    const dir = path.join(root, "prisma/migrations");
    const sql = readdirSync(dir)
      .filter((name) => name.endsWith("_add_product_check_tracking"))
      .map((name) => readFileSync(path.join(dir, name, "migration.sql"), "utf-8"));

    expect(sql).toHaveLength(1);
    expect(sql[0]).toMatch(/ADD COLUMN\s+"lastCheckedAt" TIMESTAMP\(3\)\s*[,;]/);
    expect(sql[0]).toMatch(/ADD COLUMN\s+"consecutiveFailures" INTEGER NOT NULL DEFAULT 0\s*[,;]/);
  });
});
