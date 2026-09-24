export type ScrapeMethod = 'json-ld' | 'meta-tags' | 'regex' | 'none';
export type Availability = 'in_stock' | 'out_of_stock' | 'unknown';

export interface ParsedProduct {
  name: string;
  price: number;
  currency: string;
  image: string;
  store: string;
  method: ScrapeMethod;
  availability: Availability;
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

const AMAZON_PRICE_CONTAINER_IDS = [
  'corePriceDisplay_desktop_feature_div',
  'corePrice_feature_div',
  'apex_desktop',
  'centerCol',
];

const AMAZON_PRICE_CONTAINER_WINDOW = 8000;
// Amazon's basis/strikethrough price wrapper combines both classes on the same
// element ("a-price a-text-price"); matching the pair instead of the bare
// "a-text-price" substring avoids misfiring on unrelated elements (badges, per-unit
// annotations) that only carry one of the two classes.
const AMAZON_STRIKETHROUGH_MARKER = 'a-price a-text-price';
const AMAZON_FRACTION_LOOKAHEAD = 200;

const scopeToAmazonPriceContainer = (html: string): string | null => {
  for (const id of AMAZON_PRICE_CONTAINER_IDS) {
    const idx = html.indexOf(`id="${id}"`);
    if (idx !== -1) {
      return html.slice(idx, idx + AMAZON_PRICE_CONTAINER_WINDOW);
    }
  }
  return null;
};

interface AmazonPriceMatch {
  whole: string;
  fraction: string | null;
}

// Amazon renders more than one a-price-whole on a PDP (e.g. a struck-through list
// price beside the real one), so pick the first candidate that is not wrapped in the
// "a-text-price" class Amazon uses for strikethrough/basis prices. The marker is looked
// for only in the gap since the previous candidate (not a fixed-size window), so a
// strikethrough wrapper around one price never "bleeds" onto the next sibling price.
const extractAmazonPrice = (html: string): AmazonPriceMatch | null => {
  const wholeRe = /<span class="a-price-whole">([\d.,]+)/gi;
  const candidates: { index: number; end: number; whole: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = wholeRe.exec(html)) !== null) {
    candidates.push({ index: match.index, end: wholeRe.lastIndex, whole: match[1] });
  }
  if (candidates.length === 0) return null;

  let searchFrom = 0;
  const chosen =
    candidates.find((c) => {
      const isStrikethrough = html.slice(searchFrom, c.index).includes(AMAZON_STRIKETHROUGH_MARKER);
      searchFrom = c.end;
      return !isStrikethrough;
    }) ?? candidates[0];

  const fractionMatch = html
    .slice(chosen.index, chosen.index + AMAZON_FRACTION_LOOKAHEAD)
    .match(/<span class="a-price-fraction">(\d+)<\/span>/i);

  return { whole: chosen.whole, fraction: fractionMatch ? fractionMatch[1] : null };
};

// Amazon's buy box submits the offer it is showing through a hidden
// customerVisiblePrice input. When the page offers both a new and a used item it
// renders one accordion row per condition, each with its own input, so the price is
// read from inside the new-item row and the used row is never considered.
const AMAZON_NEW_ROW_MARKER = 'id="newAccordionRow_0"';
const AMAZON_USED_ROW_MARKER = 'id="usedAccordionRow"';
const AMAZON_NEXT_ROW_RE = /id="[A-Za-z]*AccordionRow[^"]*"/g;
const AMAZON_VISIBLE_PRICE_RE = /customerVisiblePrice\]\[amount\]"\s+value="([\d.]+)"/;

type AmazonVisiblePrice =
  | { kind: 'price'; price: number }
  | { kind: 'used-only' }
  | { kind: 'none' };

const readVisiblePrice = (html: string): number => {
  const match = html.match(AMAZON_VISIBLE_PRICE_RE);
  const price = match ? Number(match[1]) : 0;
  return Number.isFinite(price) ? price : 0;
};

const extractAmazonVisiblePrice = (html: string): AmazonVisiblePrice => {
  const newIdx = html.indexOf(AMAZON_NEW_ROW_MARKER);
  if (newIdx !== -1) {
    AMAZON_NEXT_ROW_RE.lastIndex = newIdx + AMAZON_NEW_ROW_MARKER.length;
    const next = AMAZON_NEXT_ROW_RE.exec(html);
    const price = readVisiblePrice(html.slice(newIdx, next ? next.index : undefined));
    return price > 0 ? { kind: 'price', price } : { kind: 'none' };
  }
  if (html.includes(AMAZON_USED_ROW_MARKER)) return { kind: 'used-only' };
  const price = readVisiblePrice(html);
  return price > 0 ? { kind: 'price', price } : { kind: 'none' };
};

const OUT_OF_STOCK_VALUES = ['OutOfStock', 'SoldOut', 'Discontinued'];

const toAvailability = (value: unknown): Availability => {
  const text = toStr(value).replace(/^https?:\/\/schema\.org\//i, '');
  if (!text) return 'unknown';
  if (OUT_OF_STOCK_VALUES.includes(text)) return 'out_of_stock';
  if (text === 'InStock') return 'in_stock';
  return 'unknown';
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
  availability?: unknown;
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

const findJsonLdAvailability = (html: string): Availability => {
  for (const raw of extractJsonLdBlocks(html)) {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }
    for (const root of Array.isArray(json) ? json : [json]) {
      const product = deepFindProduct(root);
      if (!product) continue;
      const offers = product.offers as OfferLike | OfferLike[] | undefined;
      const offer = Array.isArray(offers) ? offers[0] : offers;
      return toAvailability(offer?.availability);
    }
  }
  return 'unknown';
};

function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) blocks.push(m[1].trim());
  return blocks;
}

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
  const url = opts.url || '';
  const availability = findJsonLdAvailability(html);

  // Store-specific extraction for high accuracy
  let specificPrice = 0;
  let specificName = '';
  let specificImage = '';

  try {
    if (url.includes('amazon.')) {
      const visible = extractAmazonVisiblePrice(html);
      if (visible.kind === 'used-only') {
        // Only a used offer is on sale: the new item is unavailable, and the used
        // price must never stand in for it.
        return {
          name: decodeEntities(extractTitle(html).replace(/\s*:?\s*Amazon\.com\.br.*/i, '').trim()),
          price: 0,
          currency: 'BRL',
          image: extractMeta(html, 'og:image'),
          store,
          method: 'regex',
          availability: 'out_of_stock',
        };
      }
      if (visible.kind === 'price') {
        specificPrice = visible.price;
      } else {
        const containerSlice = scopeToAmazonPriceContainer(html);
        const amazonPrice = (containerSlice && extractAmazonPrice(containerSlice)) || extractAmazonPrice(html);
        if (amazonPrice) {
          specificPrice = toNumberPrice(amazonPrice.whole + (amazonPrice.fraction ? ',' + amazonPrice.fraction : ''));
        }
      }
      const nameMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (nameMatch) {
          specificName = decodeEntities(nameMatch[1].replace(/\s*:?\s*Amazon\.com\.br.*/i, '').trim());
      }
      
      const imgMatch = html.match(/<img[^>]*id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/i) ||
                       html.match(/<img[^>]*id="landingImage"[^>]*data-old-hires="([^"]+)"/i) ||
                       html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i) || 
                       html.match(/<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-a-dynamic-image="([^"]+)"/i) ||
                       html.match(/<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-old-hires="([^"]+)"/i) ||
                       html.match(/<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*src="([^"]+)"/i) ||
                       html.match(/<img[^>]*id="imgBlkFront"[^>]*src="([^"]+)"/i) ||
                       html.match(/"large":"([^"]+)"/i);
      if (imgMatch) {
        specificImage = imgMatch[1];
        if (specificImage.startsWith('{&quot;') || specificImage.startsWith('{"')) {
            try {
                const dynamicData = JSON.parse(decodeEntities(specificImage));
                specificImage = Object.keys(dynamicData)[0] || specificImage;
            } catch (e) {}
        } else if (specificImage.startsWith('data:image')) {
            const dynamicImgMatch = html.match(/<img[^>]*id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/i);
            if (dynamicImgMatch) {
                try {
                    const dynamicData = JSON.parse(decodeEntities(dynamicImgMatch[1]));
                    specificImage = Object.keys(dynamicData)[0] || specificImage;
                } catch (e) {}
            }
        }
      }

    } else if (url.includes('mercadolivre.com')) {
      const priceMatch = html.match(/<span class="andes-money-amount__fraction">([\d.,]+)<\/span>/i);
      if (priceMatch) specificPrice = toNumberPrice(priceMatch[1]);
      
      const nameMatch = html.match(/<h1 class="ui-pdp-title">([\s\S]*?)<\/h1>/i);
      if (nameMatch) specificName = decodeEntities(nameMatch[1].trim());

      const imgMatch = html.match(/<img[^>]*class="ui-pdp-image ui-pdp-gallery__figure__image"[^>]*src="([^"]+)"/i) ||
                       html.match(/data-zoom="([^"]+)"/i);
      if (imgMatch) specificImage = imgMatch[1];

    } else if (url.includes('shopee.com')) {
      const priceMatch = html.match(/"price":(\d+00000)/i);
      if (priceMatch) specificPrice = parseInt(priceMatch[1]) / 100000;
      else {
        const textMatch = html.match(/>R\$ ?([\d.,]+)</i);
        if (textMatch) specificPrice = toNumberPrice(textMatch[1]);
      }
      
      const titleMatch = html.match(/<title>([^|]+)\|/i) || html.match(/"name":"([^"]+)"/i);
      if (titleMatch) specificName = decodeEntities(titleMatch[1].trim());

      const imgMatch = html.match(/"image":"([^"]+)"/i) || html.match(/background-image:\s*url\((?:&quot;|")([^"&]+)(?:&quot;|")\)/i);
      if (imgMatch) specificImage = imgMatch[1];

    } else if (url.includes('magazineluiza.com') || url.includes('magalu.com')) {
      // Magalu uses data-testid attributes (stable selectors)
      // Price: data-testid="price-value" or data-testid="price-original"
      const priceMatch = html.match(/data-testid="price-value"[^>]*>([^<]+)</i) ||
                         html.match(/data-testid="price-value"[^>]*>[^R]*R\$\s*([\d.,]+)/i);
      if (priceMatch) {
        specificPrice = toNumberPrice(priceMatch[1]);
      }
      if (specificPrice <= 0) {
        // Fallback: search for price in __NEXT_DATA__
        const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
        if (nextData) {
          try {
            const data = JSON.parse(nextData[1]);
            const str = JSON.stringify(data);
            const pMatch = str.match(/"bestPrice":([\d.]+)/) || str.match(/"price":([\d.]+)/);
            if (pMatch) specificPrice = Number(pMatch[1]);
          } catch {}
        }
      }

      // Title: data-testid="heading-product-title"
      const titleMatch = html.match(/data-testid="heading-product-title"[^>]*>([\s\S]*?)<\/h[12]>/i) ||
                          html.match(/data-testid="product-title"[^>]*>([\s\S]*?)<\/[^>]+>/i);
      if (titleMatch) {
        specificName = decodeEntities(titleMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (!specificName) {
        const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
        if (nextData) {
          try {
            const str = nextData[1];
            const nMatch = str.match(/"title":"([^"]{5,200})"/);
            if (nMatch) specificName = decodeEntities(nMatch[1]);
          } catch {}
        }
      }

      // Image: data-testid="image-selected-thumbnail" or product gallery img
      const imgTagMatch = html.match(/data-testid="image-selected-thumbnail"[^>]*src="([^"]+)"/i) ||
                          html.match(/data-testid="product-image"[^>]*src="([^"]+)"/i) ||
                          html.match(/<img[^>]*src="(https:\/\/a-static\.mlcdn\.com\.br[^"]+)"/i);
      if (imgTagMatch) {
        specificImage = imgTagMatch[1];
      }
    }
  } catch (e) {
    // Ignore error and fallback
  }

  const ogTitle = extractMeta(html, 'og:title');
  const ogImage = extractMeta(html, 'og:image');
  
  if (specificPrice > 0) {
    return {
      name: specificName || ogTitle || extractH1(html) || extractTitle(html),
      price: specificPrice,
      currency: 'BRL',
      image: specificImage || ogImage || extractFirstImg(html),
      store,
      method: 'regex',
      availability,
    };
  }

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
        availability,
      };
    }
  }

  const ogPrice = extractMeta(html, 'product:price:amount');
  const ogCurrency = extractMeta(html, 'product:price:currency');
  if (ogTitle && toNumberPrice(ogPrice) > 0) {
    return {
      name: ogTitle,
      price: toNumberPrice(ogPrice),
      currency: ogCurrency || detectCurrency(ogPrice),
      image: ogImage,
      store,
      method: 'meta-tags',
      availability,
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
        availability,
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
    availability,
  };
}
