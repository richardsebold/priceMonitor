export type ScrapeMethod = 'json-ld' | 'meta-tags' | 'regex' | 'none';

export interface ParsedProduct {
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
  method: ScrapeMethod;
}

export interface ParseOptions {
  url?: string;
  allowRegex?: boolean;
}

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

const decodeEntities = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

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
  offers: OfferLike | OfferLike[] | undefined | null,
): { price: number; currency: string } => {
  if (!offers) return { price: 0, currency: '' };
  if (Array.isArray(offers)) return extractOffer(offers[0]);
  const rawPrice = offers.price ?? offers.lowPrice ?? offers.highPrice ?? '';
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

const extractJsonLdBlocks = (html: string): string[] => {
  const blocks: string[] = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) blocks.push(m[1].trim());
  return blocks;
};

const extractMeta = (html: string, key: string): string => {
  const a = new RegExp(
    `<meta[^>]*(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
    'i',
  );
  const b = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
    'i',
  );
  return decodeEntities(html.match(a)?.[1] ?? html.match(b)?.[1] ?? '');
};

const extractH1 = (html: string): string => {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return '';
  return decodeEntities(m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
};

const extractFirstImg = (html: string): string => {
  const m = html.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  return m?.[1] ?? '';
};

const extractTitle = (html: string): string => {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeEntities((m?.[1] ?? '').trim());
};

const getStore = (html: string, url?: string): string => {
  const og = extractMeta(html, 'og:site_name');
  if (og) return og;
  if (url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      /* ignore */
    }
  }
  return '';
};

const normalizeImage = (
  raw: string | string[] | { url?: string } | undefined,
): string => {
  if (!raw) return '';
  if (Array.isArray(raw)) return toStr(raw[0]);
  if (typeof raw === 'object') return toStr(raw.url);
  return toStr(raw);
};

export function parseHtml(html: string, opts: ParseOptions = {}): ParsedProduct {
  const store = getStore(html, opts.url);

  for (const raw of extractJsonLdBlocks(html)) {
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
      if (offer.price <= 0) continue;
      return {
        name: toStr(product.name),
        price: offer.price,
        currency: offer.currency,
        image: normalizeImage(
          product.image as string | string[] | { url?: string } | undefined,
        ),
        store,
        method: 'json-ld',
      };
    }
  }

  const ogTitle = extractMeta(html, 'og:title');
  const ogPrice = extractMeta(html, 'product:price:amount');
  const ogCurrency = extractMeta(html, 'product:price:currency');
  const ogImage = extractMeta(html, 'og:image');
  if (ogTitle && toNumberPrice(ogPrice) > 0) {
    return {
      name: ogTitle,
      price: toNumberPrice(ogPrice),
      currency: ogCurrency || detectCurrency(ogPrice),
      image: ogImage,
      store,
      method: 'meta-tags',
    };
  }

  if (opts.allowRegex) {
    const visible = html.replace(/<[^>]+>/g, ' ');
    const m = visible.match(
      /(?:R\$|\$|€|£|¥)\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/,
    );
    const priceText = toStr(m?.[0]);
    const price = toNumberPrice(priceText);
    if (price > 0) {
      return {
        name: extractH1(html) || extractTitle(html),
        price,
        currency: detectCurrency(priceText),
        image: ogImage || extractFirstImg(html),
        store,
        method: 'regex',
      };
    }
  }

  return {
    name: ogTitle || extractH1(html) || extractTitle(html),
    price: 0,
    currency: '',
    image: ogImage || extractFirstImg(html),
    store,
    method: 'none',
  };
}
