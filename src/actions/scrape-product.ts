'use server'

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export type ScrapeMethod = 'json-ld' | 'meta-tags' | 'visual';

export interface ScrapedProduct {
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
  method: ScrapeMethod;
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar"
    ),
    headless: true,
    acceptInsecureCerts: true,
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const productData = await page.evaluate((): ScrapedProduct => {
      /* ================== HELPERS ================== */

      const toStr = (v: unknown): string =>
        v !== null && v !== undefined ? String(v).trim() : '';

      const toNumberPrice = (value: unknown): number => {
        if (!value) return 0;

        let text = String(value).replace(/[^\d.,]/g, '');

        if (text.includes(',') && text.lastIndexOf(',') > text.lastIndexOf('.')) {
          text = text.replace(/\./g, '').replace(',', '.');
        } else {
          text = text.replace(/,/g, '');
        }

        const num = Number(text);
        return Number.isFinite(num) ? num : 0;
      };

      const detectCurrency = (text: string): string => {
        if (!text) return '';
        if (text.includes('R$')) return 'BRL';
        if (text.includes('€')) return 'EUR';
        if (text.includes('£')) return 'GBP';
        if (text.includes('¥')) return 'JPY';
        if (text.includes('$')) return 'USD';
        return '';
      };

      type JsonLdNode = Record<string, unknown> & { '@type'?: string | string[] };

      const isProduct = (node: JsonLdNode | null | undefined): boolean => {
        const type = node?.['@type'];
        if (Array.isArray(type)) return type.includes('Product');
        return type === 'Product';
      };

      interface OfferLike {
        price?: unknown;
        lowPrice?: unknown;
        highPrice?: unknown;
        priceCurrency?: unknown;
      }

      const extractOffer = (
        offers: OfferLike | OfferLike[] | undefined | null
      ): { price: number; currency: string } => {
        if (!offers) return { price: 0, currency: '' };
        if (Array.isArray(offers)) return extractOffer(offers[0]);

        const rawPrice =
          offers.price ??
          offers.lowPrice ??
          offers.highPrice ??
          '';

        return {
          price: toNumberPrice(rawPrice),
          currency: toStr(offers.priceCurrency),
        };
      };

      const deepFindProduct = (node: unknown): JsonLdNode | null => {
        if (!node || typeof node !== 'object') return null;
        const obj = node as JsonLdNode;
        if (isProduct(obj)) return obj;

        for (const key in obj) {
          const found = deepFindProduct(obj[key]);
          if (found) return found;
        }
        return null;
      };

      const getStoreName = (): string => {
        const ogSiteName = document.querySelector<HTMLMetaElement>(
          'meta[property="og:site_name"]'
        );
        if (ogSiteName && ogSiteName.content) {
          return toStr(ogSiteName.content);
        }
        return window.location.hostname.replace(/^www\./, '');
      };

      /* ================== JSON-LD ================== */

      const scripts = document.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]'
      );

      for (const script of Array.from(scripts)) {
        let json: unknown;
        try {
          json = JSON.parse(script.innerText.trim());
        } catch {
          continue;
        }

        const roots = Array.isArray(json) ? json : [json];

        for (const root of roots) {
          const product = deepFindProduct(root);
          if (!product) continue;

          const offer = extractOffer(product.offers as OfferLike | OfferLike[] | undefined);
          const rawImage = product.image as
            | string
            | string[]
            | { url?: string }
            | undefined;

          const image = Array.isArray(rawImage)
            ? rawImage[0]
            : typeof rawImage === 'object' && rawImage !== null
              ? rawImage.url ?? ''
              : rawImage;

          return {
            name: toStr(product.name),
            price: offer.price,
            currency: offer.currency,
            image: toStr(image),
            store: getStoreName(),
            method: 'json-ld',
          };
        }
      }

      /* ================== FALLBACKS ================== */

      const ogTitle = document.querySelector<HTMLMetaElement>(
        'meta[property="og:title"]'
      );
      const ogPrice = document.querySelector<HTMLMetaElement>(
        'meta[property="product:price:amount"]'
      );
      const ogImage = document.querySelector<HTMLMetaElement>(
        'meta[property="og:image"]'
      );

      if (ogTitle) {
        const priceText = toStr(ogPrice?.content);

        return {
          name: toStr(ogTitle.content),
          price: toNumberPrice(priceText),
          currency: detectCurrency(priceText),
          image: toStr(ogImage?.content),
          store: getStoreName(),
          method: 'meta-tags',
        };
      }

      const h1 = document.querySelector<HTMLHeadingElement>('h1');
      const bodyText = document.body.innerText;
      const match = bodyText.match(
        /(?:R\$|\$|€|£|¥)\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/
      );

      const priceText = toStr(match?.[0]);

      return {
        name: toStr(h1?.innerText || document.title),
        price: toNumberPrice(priceText),
        currency: detectCurrency(priceText),
        image: toStr(document.querySelector<HTMLImageElement>('img')?.src),
        store: getStoreName(),
        method: 'visual',
      };
    });

    return productData;
  } finally {
    await browser.close();
  }
}
