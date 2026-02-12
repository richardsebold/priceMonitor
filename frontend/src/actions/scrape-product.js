import puppeteer from 'puppeteer';

export async function scrapeProduct(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );

  await page.setViewport({ width: 1920, height: 1080 });

  // Bloqueia recursos desnecessários para melhor performance
  await page.setRequestInterception(true);
  page.on('request', req => {
    const resourceType = req.resourceType();
    if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Aguarda apenas o necessário para JSON-LD estar disponível
    await page.waitForFunction(
      () => document.querySelectorAll('script[type="application/ld+json"]').length > 0 || document.readyState === 'complete',
      { timeout: 5000 }
    ).catch(() => {}); // Continua mesmo se timeout

    const productData = await page.evaluate(() => {
      /* ================== HELPERS OTIMIZADOS ================== */

      const toStr = (v) => {
        if (v === null || v === undefined) return '';
        return String(v).trim();
      };

      const toNumberPrice = (value) => {
        if (!value) return 0;

        let text = String(value).trim().replace(/[^\d.,]/g, '');
        
        if (!text) return 0;

        const lastComma = text.lastIndexOf(',');
        const lastDot = text.lastIndexOf('.');
        
        // Ambos presentes: último é decimal
        if (lastComma > -1 && lastDot > -1) {
          text = lastComma > lastDot
            ? text.replace(/\./g, '').replace(',', '.')
            : text.replace(/,/g, '');
        }
        // Apenas vírgula
        else if (lastComma > -1) {
          const parts = text.split(',');
          text = parts.length === 2 && parts[1].length === 2
            ? text.replace(',', '.')
            : text.replace(',', '');
        }

        const num = parseFloat(text);
        return Number.isFinite(num) ? num : 0;
      };

      const detectCurrency = (text) => {
        if (!text) return '';
        const str = String(text).toUpperCase();
        if (str.includes('R$') || str.includes('BRL')) return 'BRL';
        if (str.includes('EUR') || str.includes('€')) return 'EUR';
        if (str.includes('GBP') || str.includes('£')) return 'GBP';
        if (str.includes('JPY') || str.includes('¥')) return 'JPY';
        if (str.includes('USD') || str.includes('US$')) return 'USD';
        if (str.includes('$')) return 'USD';
        return '';
      };

      /* ================== JSON-LD PARSER OTIMIZADO ================== */

      const extractProductFromNode = (node, maxDepth = 8, currentDepth = 0) => {
        if (!node || typeof node !== 'object' || currentDepth > maxDepth) {
          return null;
        }

        // Verifica se é produto
        const type = node['@type'];
        const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
        
        if (isProduct) {
          return node;
        }

        // Busca recursiva otimizada
        // Prioriza chaves comuns onde produtos aparecem
        const priorityKeys = ['mainEntity', 'itemListElement', '@graph', 'offers'];
        
        for (const key of priorityKeys) {
          if (node[key]) {
            const result = extractProductFromNode(node[key], maxDepth, currentDepth + 1);
            if (result) return result;
          }
        }

        // Busca em outras chaves
        for (const key in node) {
          if (priorityKeys.includes(key) || !node.hasOwnProperty(key)) continue;
          
          const result = extractProductFromNode(node[key], maxDepth, currentDepth + 1);
          if (result) return result;
        }

        return null;
      };

      const extractOffer = (offers) => {
        if (!offers) return null;
        
        const offerArray = Array.isArray(offers) ? offers : [offers];
        
        for (const offer of offerArray) {
          if (!offer) continue;

          // Prioriza preços em ordem de preferência
          const rawPrice = 
            offer.price ?? 
            offer.lowPrice ?? 
            offer.priceSpecification?.price ??
            offer.highPrice ?? 
            null;

          if (rawPrice !== null && rawPrice !== undefined && rawPrice !== '') {
            const price = toNumberPrice(rawPrice);
            
            if (price > 0) {
              const currency = 
                toStr(offer.priceCurrency) || 
                toStr(offer.priceSpecification?.priceCurrency) ||
                detectCurrency(String(rawPrice));
              
              return { price, currency };
            }
          }
        }
        
        return null;
      };

      const extractImage = (imageData) => {
        if (!imageData) return '';
        
        // String direta
        if (typeof imageData === 'string') {
          return imageData.trim();
        }
        
        // Array
        if (Array.isArray(imageData)) {
          for (const item of imageData) {
            if (typeof item === 'string' && item.trim()) {
              return item.trim();
            }
            if (item && typeof item === 'object') {
              const url = item.url || item.contentUrl;
              if (url) return toStr(url);
            }
          }
          return '';
        }
        
        // Objeto
        if (typeof imageData === 'object') {
          return toStr(imageData.url || imageData.contentUrl);
        }
        
        return '';
      };

      /* ================== BUSCA JSON-LD (MÉTODO PRINCIPAL) ================== */

      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      
      // Processa todos os scripts JSON-LD
      for (const script of scripts) {
        const content = script.textContent || script.innerText;
        if (!content || !content.trim()) continue;
        
        let jsonData;
        try {
          jsonData = JSON.parse(content.trim());
        } catch (e) {
          // Tenta limpar e parsear novamente
          try {
            const cleaned = content.trim()
              .replace(/[\n\r\t]/g, ' ')
              .replace(/\s+/g, ' ');
            jsonData = JSON.parse(cleaned);
          } catch (e2) {
            continue;
          }
        }

        // Normaliza para array
        const nodes = Array.isArray(jsonData) ? jsonData : [jsonData];

        // Processa cada nó
        for (const node of nodes) {
          const product = extractProductFromNode(node);
          
          if (product && product.name) {
            const offer = extractOffer(product.offers);
            const image = extractImage(product.image);
            
            // Retorna imediatamente quando encontrar produto válido
            return {
              name: toStr(product.name),
              price: offer?.price || 0,
              currency: offer?.currency || '',
              image: image,
              method: 'json-ld'
            };
          }
        }
      }

      /* ================== FALLBACK: META TAGS ================== */

      const metaTitle = 
        document.querySelector('meta[property="og:title"]') ||
        document.querySelector('meta[name="twitter:title"]');
      
      const metaPrice = document.querySelector('meta[property="product:price:amount"]');
      const metaCurrency = document.querySelector('meta[property="product:price:currency"]');
      
      const metaImage = 
        document.querySelector('meta[property="og:image"]') ||
        document.querySelector('meta[name="twitter:image"]');

      if (metaTitle?.content) {
        const priceText = toStr(metaPrice?.content);
        const price = toNumberPrice(priceText);
        const currency = toStr(metaCurrency?.content) || detectCurrency(priceText);

        return {
          name: toStr(metaTitle.content),
          price: price,
          currency: currency,
          image: toStr(metaImage?.content),
          method: 'meta-tags'
        };
      }

      /* ================== FALLBACK: MICRODATA ================== */

      const microdataProduct = document.querySelector('[itemtype*="schema.org/Product"]');
      
      if (microdataProduct) {
        const nameElem = microdataProduct.querySelector('[itemprop="name"]');
        const priceElem = microdataProduct.querySelector('[itemprop="price"]');
        const currencyElem = microdataProduct.querySelector('[itemprop="priceCurrency"]');
        const imageElem = microdataProduct.querySelector('[itemprop="image"]');

        if (nameElem) {
          const priceText = priceElem?.content || priceElem?.textContent || '';
          const price = toNumberPrice(priceText);
          const currency = toStr(currencyElem?.content) || detectCurrency(priceText);

          return {
            name: toStr(nameElem.textContent || nameElem.content),
            price: price,
            currency: currency,
            image: toStr(imageElem?.src || imageElem?.content),
            method: 'microdata'
          };
        }
      }

      /* ================== FALLBACK: VISUAL (ÚLTIMO RECURSO) ================== */

      // Nome do produto
      const h1 = document.querySelector('h1');
      const productName = toStr(h1?.textContent) || toStr(document.title);

      // Preço com seletores otimizados
      let priceValue = 0;
      let currency = '';

      const priceSelectors = [
        '[itemprop="price"]',
        '[data-price]',
        '.price-current',
        '.product-price',
        '.sale-price',
        '.offer-price',
        '.price',
        '#preco',
        '.valor'
      ];

      for (const selector of priceSelectors) {
        const elem = document.querySelector(selector);
        if (!elem) continue;

        const text = 
          elem.getAttribute('content') ||
          elem.getAttribute('data-price') ||
          elem.textContent;
        
        const price = toNumberPrice(text);
        
        if (price > 0) {
          priceValue = price;
          currency = detectCurrency(text);
          break;
        }
      }

      // Busca no texto apenas se não encontrou
      if (priceValue === 0) {
        const bodyText = document.body.textContent;
        const priceRegex = /(?:R\$|US\$|U\$|\$|€|£|¥)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g;
        const matches = bodyText.match(priceRegex);
        
        if (matches && matches.length > 0) {
          const price = toNumberPrice(matches[0]);
          if (price > 0) {
            priceValue = price;
            currency = detectCurrency(matches[0]);
          }
        }
      }

      // Imagem
      const imgElem = 
        document.querySelector('[itemprop="image"]') ||
        document.querySelector('.product-image img') ||
        document.querySelector('main img') ||
        document.querySelector('img');

      const imageUrl = toStr(
        imgElem?.src || 
        imgElem?.getAttribute('data-src') ||
        imgElem?.getAttribute('data-lazy-src')
      );

      return {
        name: productName,
        price: priceValue,
        currency: currency,
        image: imageUrl,
        method: 'visual'
      };
    });

    return productData;
  } finally {
    await browser.close();
  }
}