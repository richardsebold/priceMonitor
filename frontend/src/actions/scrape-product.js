import puppeteer from 'puppeteer';

export async function scrapeProduct(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );

  await page.setViewport({ width: 1920, height: 1080 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (['image', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else req.continue();
  });

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const productData = await page.evaluate(() => {
      /* ================== HELPERS ================== */

      const toStr = (v) =>
        v !== null && v !== undefined ? String(v).trim() : '';

      const toNumberPrice = (value) => {
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

      const detectCurrency = (text) => {
        if (!text) return '';
        if (text.includes('R$')) return 'BRL';
        if (text.includes('€')) return 'EUR';
        if (text.includes('£')) return 'GBP';
        if (text.includes('¥')) return 'JPY';
        if (text.includes('$')) return 'USD';
        return '';
      };

      const isProduct = (node) => {
        const type = node?.['@type'];
        if (Array.isArray(type)) return type.includes('Product');
        return type === 'Product';
      };

      const extractOffer = (offers) => {
        if (!offers) return { price: 0, currency: '' };
        if (Array.isArray(offers)) return extractOffer(offers[0]);

        const rawPrice =
          offers.price ??
          offers.lowPrice ??
          offers.highPrice ??
          '';

        return {
          price: toNumberPrice(rawPrice),
          currency: toStr(offers.priceCurrency)
        };
      };

      const deepFindProduct = (node) => {
        if (!node || typeof node !== 'object') return null;
        if (isProduct(node)) return node;

        for (const key in node) {
          const found = deepFindProduct(node[key]);
          if (found) return found;
        }
        return null;
      };

      /* ================== JSON-LD ================== */

      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );

      for (const script of scripts) {
        let json;
        try {
          json = JSON.parse(script.innerText.trim());
        } catch {
          continue;
        }

        const roots = Array.isArray(json) ? json : [json];

        for (const root of roots) {
          const product = deepFindProduct(root);
          if (!product) continue;

          const offer = extractOffer(product.offers);

          return {
            name: toStr(product.name),
            price: offer.price,        // ✅ NUMBER
            currency: offer.currency,
            image: toStr(
              Array.isArray(product.image)
                ? product.image[0]
                : product.image?.url || product.image
            ),
            method: 'json-ld'
          };
        }
      }

      /* ================== FALLBACKS ================== */

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogPrice = document.querySelector(
        'meta[property="product:price:amount"]'
      );
      const ogImage = document.querySelector('meta[property="og:image"]');

      if (ogTitle) {
        const priceText = toStr(ogPrice?.content);

        return {
          name: toStr(ogTitle.content),
          price: toNumberPrice(priceText), // ✅ NUMBER
          currency: detectCurrency(priceText),
          image: toStr(ogImage?.content),
          method: 'meta-tags'
        };
      }

      const h1 = document.querySelector('h1');
      const bodyText = document.body.innerText;
      const match = bodyText.match(
        /(?:R\$|\$|€|£|¥)\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/
      );

      const priceText = toStr(match?.[0]);

      return {
        name: toStr(h1?.innerText || document.title),
        price: toNumberPrice(priceText), // ✅ NUMBER
        currency: detectCurrency(priceText),
        image: toStr(document.querySelector('img')?.src),
        method: 'visual'
      };
    });

    return productData;
  } finally {
    await browser.close();
  }
}

/* import puppeteer from 'puppeteer';

export async function scrapeProduct(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );

  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const productData = await page.evaluate(() => {
      const toStr = (v) => (v !== null && v !== undefined) ? String(v) : '';

      const detectCurrency = (priceText) => {
        if (!priceText) return '';
        if (priceText.includes('R$')) return 'BRL';
        if (priceText.includes('€')) return 'EUR';
        if (priceText.includes('£')) return 'GBP';
        if (priceText.includes('¥')) return 'JPY';
        if (priceText.includes('$')) return 'USD';
        return '';
      };

      let data = {
        name: '',
        price: '',
        image: '',
        currency: '',
        method: ''
      };

      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of jsonLdScripts) {
        try {
          const json = JSON.parse(script.innerText);
          const nodes = Array.isArray(json) ? json : [json];
          const product = nodes.find(n => n['@type'] === 'Product');

          if (product) {
            data.name = toStr(product.name);

            if (product.image) {
              const img = Array.isArray(product.image)
                ? product.image[0]
                : product.image;
              data.image = toStr(typeof img === 'object' ? img.url : img);
            }

            const offer = Array.isArray(product.offers)
              ? product.offers[0]
              : product.offers;

            const priceValue = offer?.price || offer?.lowPrice || '';
            data.price = toStr(priceValue);
            data.currency = toStr(
              offer?.priceCurrency || detectCurrency(data.price)
            );

            data.method = 'json-ld';
            return data;
          }
        } catch {}
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogPrice = document.querySelector('meta[property="product:price:amount"]');
      const ogImage = document.querySelector('meta[property="og:image"]');

      if (ogTitle) {
        const priceText = toStr(ogPrice?.content);

        return {
          name: toStr(ogTitle.content),
          price: priceText,
          image: toStr(ogImage?.content),
          currency: detectCurrency(priceText),
          method: 'meta-tags'
        };
      }

      const h1 = document.querySelector('h1');
      const bodyText = document.body.innerText;
      const priceMatch = bodyText.match(/(?:R\$|\$|€|£|¥)\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/);
      const priceText = toStr(priceMatch?.[0]);

      return {
        name: toStr(h1?.innerText || document.title),
        price: priceText,
        image: toStr(document.querySelector('img')?.src),
        currency: detectCurrency(priceText),
        method: 'visual'
      };
    });

    return productData;
  } finally {
    await browser.close();
  }
} */

