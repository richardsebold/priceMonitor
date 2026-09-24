import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { formatProbeReport } from "./probe-report";

describe("formatProbeReport", () => {
  it("formats one line per url and a per-store obtained count", () => {
    const lines = formatProbeReport([
      { url: "https://www.kabum.com.br/produto/1", method: "json-ld", price: 2199.99 },
      { url: "https://www.kabum.com.br/produto/2", method: "none", price: 0 },
      { url: "https://www.amazon.com.br/dp/B097K5J1SB", method: "regex", price: 479.99 },
    ]);

    expect(lines).toContain("kabum.com.br | json-ld | 2199.99 | https://www.kabum.com.br/produto/1");
    expect(lines).toContain("kabum.com.br | none | sem preço | https://www.kabum.com.br/produto/2");
    expect(lines).toContain("amazon.com.br | regex | 479.99 | https://www.amazon.com.br/dp/B097K5J1SB");
    expect(lines).toContain("kabum.com.br: obtidos 1/2");
    expect(lines).toContain("amazon.com.br: obtidos 1/1");
  });

  it("probe script does not import the database client", () => {
    const script = readFileSync(path.join(process.cwd(), "scripts/probe-scrapers.ts"), "utf-8");

    expect(script).not.toMatch(/@\/lib\/prisma|lib\/prisma|generated\/prisma/);
  });
});
