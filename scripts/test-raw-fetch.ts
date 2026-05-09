import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: `${process.env.DATABASE_URL}` });
const prisma = new PrismaClient({ adapter });

const FETCH_TIMEOUT_MS = 20000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type ScrapeMethod = "json-ld" | "meta-tags" | "regex" | "none";

interface ScrapeResult {
  url: string;
  store: string;
  ok: boolean;
  status: number | null;
  method: ScrapeMethod;
  name: string;
  price: number;
  currency: string;
  durationMs: number;
  bytes: number;
  error?: string;
}

const toStr = (v: unknown): string =>
  v !== null && v !== undefined ? String(v).trim() : "";

const toNumberPrice = (value: unknown): number => {
  if (!value) return 0;
  let text = String(value).replace(/[^\d.,]/g, "");
  if (text.includes(",") && text.lastIndexOf(",") > text.lastIndexOf(".")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else {
    text = text.replace(/,/g, "");
  }
  const num = Number(text);
  return Number.isFinite(num) ? num : 0;
};

const detectCurrency = (text: string): string => {
  if (!text) return "";
  if (text.includes("R$")) return "BRL";
  if (text.includes("€")) return "EUR";
  if (text.includes("£")) return "GBP";
  if (text.includes("¥")) return "JPY";
  if (text.includes("$")) return "USD";
  return "";
};

type JsonLdNode = Record<string, unknown> & { "@type"?: string | string[] };

const isProduct = (node: JsonLdNode | null | undefined): boolean => {
  const type = node?.["@type"];
  if (Array.isArray(type)) return type.includes("Product");
  return type === "Product";
};

interface OfferLike {
  price?: unknown;
  lowPrice?: unknown;
  highPrice?: unknown;
  priceCurrency?: unknown;
}

const extractOffer = (
  offers: OfferLike | OfferLike[] | undefined | null,
): { price: number; currency: string } => {
  if (!offers) return { price: 0, currency: "" };
  if (Array.isArray(offers)) return extractOffer(offers[0]);
  const rawPrice = offers.price ?? offers.lowPrice ?? offers.highPrice ?? "";
  return {
    price: toNumberPrice(rawPrice),
    currency: toStr(offers.priceCurrency),
  };
};

const deepFindProduct = (node: unknown): JsonLdNode | null => {
  if (!node || typeof node !== "object") return null;
  const obj = node as JsonLdNode;
  if (isProduct(obj)) return obj;
  for (const key in obj) {
    const found = deepFindProduct(obj[key]);
    if (found) return found;
  }
  return null;
};

function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function extractMeta(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    "i",
  );
  const m1 = html.match(re);
  if (m1) return m1[1];
  const m2 = html.match(alt);
  if (m2) return m2[1];
  return "";
}

function extractH1(html: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return "";
  return m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

interface ParseOutput {
  method: ScrapeMethod;
  name: string;
  price: number;
  currency: string;
}

function parseHtml(html: string): ParseOutput {
  const blocks = extractJsonLdBlocks(html);
  for (const raw of blocks) {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }
    const roots = Array.isArray(json) ? json : [json];
    for (const root of roots) {
      const product = deepFindProduct(root);
      if (!product) continue;
      const offer = extractOffer(
        product.offers as OfferLike | OfferLike[] | undefined,
      );
      return {
        method: "json-ld",
        name: toStr(product.name),
        price: offer.price,
        currency: offer.currency,
      };
    }
  }

  const ogTitle = extractMeta(html, "og:title");
  const ogPrice = extractMeta(html, "product:price:amount");
  if (ogTitle) {
    return {
      method: "meta-tags",
      name: decodeHtmlEntities(ogTitle),
      price: toNumberPrice(ogPrice),
      currency: detectCurrency(ogPrice),
    };
  }

  const h1 = extractH1(html);
  const visibleText = html.replace(/<[^>]+>/g, " ");
  const match = visibleText.match(
    /(?:R\$|\$|€|£|¥)\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/,
  );
  const priceText = toStr(match?.[0]);
  return {
    method: priceText ? "regex" : "none",
    name: decodeHtmlEntities(h1),
    price: toNumberPrice(priceText),
    currency: detectCurrency(priceText),
  };
}

async function fetchWithTimeout(url: string): Promise<{
  status: number;
  html: string;
  bytes: number;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    const html = await res.text();
    return { status: res.status, html, bytes: html.length };
  } finally {
    clearTimeout(timer);
  }
}

function getStore(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

async function testUrl(url: string): Promise<ScrapeResult> {
  const store = getStore(url);
  const start = Date.now();
  try {
    const { status, html, bytes } = await fetchWithTimeout(url);
    const parsed = parseHtml(html);
    const ok = parsed.price > 0;
    return {
      url,
      store,
      ok,
      status,
      method: parsed.method,
      name: parsed.name,
      price: parsed.price,
      currency: parsed.currency,
      durationMs: Date.now() - start,
      bytes,
    };
  } catch (err) {
    return {
      url,
      store,
      ok: false,
      status: null,
      method: "none",
      name: "",
      price: 0,
      currency: "",
      durationMs: Date.now() - start,
      bytes: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function pad(s: string, n: number): string {
  if (s.length >= n) return s.slice(0, n);
  return s + " ".repeat(n - s.length);
}

async function main() {
  const products = await prisma.productHistory.findMany({
    select: { id: true, url: true, name: true, price: true },
  });

  if (products.length === 0) {
    console.log("Nenhum produto cadastrado no banco.");
    return;
  }

  console.log(`Testando ${products.length} URLs com fetch cru...\n`);

  const results: ScrapeResult[] = [];
  for (const p of products) {
    process.stdout.write(`→ ${p.url.slice(0, 80)}... `);
    const r = await testUrl(p.url);
    results.push(r);
    const tag = r.ok ? "OK" : "FAIL";
    console.log(
      `[${tag}] ${pad(r.method, 10)} ${r.currency} ${r.price}  (${r.durationMs}ms, ${r.status ?? "ERR"})`,
    );
    if (r.error) console.log(`     erro: ${r.error}`);
  }

  console.log("\n========== RESUMO POR DOMÍNIO ==========");
  const byStore = new Map<string, ScrapeResult[]>();
  for (const r of results) {
    const list = byStore.get(r.store) ?? [];
    list.push(r);
    byStore.set(r.store, list);
  }

  console.log(
    pad("DOMÍNIO", 30) +
      pad("TOTAL", 8) +
      pad("OK", 6) +
      pad("TAXA", 8) +
      pad("MÉTODOS", 30),
  );
  for (const [store, list] of byStore) {
    const ok = list.filter((r) => r.ok).length;
    const rate = ((ok / list.length) * 100).toFixed(0) + "%";
    const methods = Array.from(new Set(list.map((r) => r.method))).join(",");
    console.log(
      pad(store, 30) +
        pad(String(list.length), 8) +
        pad(String(ok), 6) +
        pad(rate, 8) +
        pad(methods, 30),
    );
  }

  const total = results.length;
  const ok = results.filter((r) => r.ok).length;
  const byMethod = new Map<string, number>();
  for (const r of results)
    byMethod.set(r.method, (byMethod.get(r.method) ?? 0) + 1);

  console.log("\n========== TOTAL ==========");
  console.log(`Total: ${total}`);
  console.log(`Sucesso: ${ok} (${((ok / total) * 100).toFixed(1)}%)`);
  console.log(`Falha:   ${total - ok}`);
  console.log("Métodos:");
  for (const [m, n] of byMethod) console.log(`  ${pad(m, 12)} ${n}`);

  const avgMs =
    results.reduce((s, r) => s + r.durationMs, 0) / Math.max(results.length, 1);
  console.log(`Latência média: ${avgMs.toFixed(0)}ms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
