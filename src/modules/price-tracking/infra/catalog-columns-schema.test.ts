import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const root = process.cwd();

function productHistoryModel(schema: string) {
  const match = schema.match(/model ProductHistory \{([\s\S]*?)\n\}/);
  if (!match) throw new Error("model ProductHistory not found");
  return match[1];
}

describe("catalog tracking columns", () => {
  it("declares lastPriceReadAt and addedFrom as optional fields on ProductHistory", () => {
    const model = productHistoryModel(readFileSync(path.join(root, "prisma/schema.prisma"), "utf-8"));

    expect(model).toMatch(/\blastPriceReadAt\s+DateTime\?\s*(\n|$)/);
    expect(model).toMatch(/\baddedFrom\s+String\?\s*(\n|$)/);
  });

  it("has a migration adding both catalog tracking columns as nullable", () => {
    const dir = path.join(root, "prisma/migrations");
    const sql = readdirSync(dir)
      .filter((name) => name.endsWith("_add_catalog_tracking_columns"))
      .map((name) => readFileSync(path.join(dir, name, "migration.sql"), "utf-8"));

    expect(sql).toHaveLength(1);
    expect(sql[0]).toMatch(/ADD COLUMN\s+"lastPriceReadAt" TIMESTAMP\(3\)\s*[,;]/);
    expect(sql[0]).toMatch(/ADD COLUMN\s+"addedFrom" TEXT\s*[,;]/);
    expect(sql[0]).not.toMatch(/NOT NULL/);
  });
});
