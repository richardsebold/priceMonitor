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
  const url = opts.url || '';

  // Store-specific extraction for high accuracy
  let specificPrice = 0;
  let specificName = '';
  let specificImage = '';

  try {
    if (url.includes('amazon.')) {
      const priceMatch = html.match(/<span class="a-price-whole">([\d.,]+)/i);
      const fractionMatch = html.match(/<span class="a-price-fraction">(\d+)<\/span>/i);
      if (priceMatch) {
        specificPrice = toNumberPrice(priceMatch[1] + (fractionMatch ? ',' + fractionMatch[1] : ''));
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

    } else if (url.includes('pichau.com')) {
      const priceMatch = html.match(/R\$\s*&nbsp;\s*([\d.,]+)/i) || html.match(/R\$\s*([\d.,]+)/i);
      if (priceMatch) specificPrice = toNumberPrice(priceMatch[1]);
      
      const nameMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (nameMatch) specificName = decodeEntities(nameMatch[1].replace(/<[^>]+>/g, '').trim());

      const imgMatch = html.match(/<img[^>]*alt="Foto de[^"]*"[^>]*src="([^"]+)"/i);
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
