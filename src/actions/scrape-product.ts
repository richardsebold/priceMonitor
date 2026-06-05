'use server'

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { existsSync } from "fs";
import { parseHtml, type ParsedProduct } from "./scrape/parse-html";

export type { ScrapeMethod, ParsedProduct } from "./scrape/parse-html";
export type ScrapedProduct = ParsedProduct;

const FETCH_TIMEOUT_MS = 20000;
const BROWSER_TIMEOUT_MS = 60000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const LOCAL_CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA ?? ""}\\Google\\Chrome\\Application\\chrome.exe`,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

function findLocalChrome(): string | null {
  for (const p of LOCAL_CHROME_PATHS) {
    try {
      if (existsSync(p)) return p;
    } catch { /* ignore */ }
  }
  return null;
}

async function fetchTier(url: string): Promise<ParsedProduct | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const parsed = parseHtml(html, { url, allowRegex: false });
    return parsed.price > 0 ? parsed : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function browserTier(url: string): Promise<ParsedProduct> {
  // Try local Chrome first, then fall back to serverless chromium
  const localChrome = findLocalChrome();

  let browser;
  if (localChrome) {
    console.log(`[SCRAPE] Usando Chrome local: ${localChrome}`);
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      executablePath: localChrome,
      headless: true,
      acceptInsecureCerts: true,
    });
  } else {
    console.log("[SCRAPE] Usando chromium-min (serverless)");
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar",
      ),
      headless: true,
      acceptInsecureCerts: true,
    });
  }

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setExtraHTTPHeaders({
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: BROWSER_TIMEOUT_MS,
    });

    // Wait for JS-rendered content (SPAs like Pichau/Magalu)
    await new Promise((r) => setTimeout(r, 5000));

    const html = await page.content();
    return parseHtml(html, { url, allowRegex: true });
  } finally {
    await browser.close();
  }
}

export async function scrapeProduct(url: string): Promise<ParsedProduct> {
  const tier1 = await fetchTier(url);
  if (tier1) {
    console.log(`[SCRAPE] tier1 (${tier1.method}) → ${url}`);
    return tier1;
  }

  console.log(`[SCRAPE] tier1 falhou, caindo no browser → ${url}`);
  try {
    const tier2 = await browserTier(url);
    console.log(`[SCRAPE] tier2 (${tier2.method}) → ${url}`);
    return tier2;
  } catch (err) {
    console.error(`[SCRAPE] tier2 falhou → ${url}`, err);
    return parseHtml("", { url, allowRegex: true });
  }
}

