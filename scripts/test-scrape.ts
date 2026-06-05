import { parseHtml } from '../src/actions/scrape/parse-html';

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function testUrl(url: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${url}`);
  console.log('='.repeat(80));

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    console.log(`Status: ${res.status}`);
    const html = await res.text();
    console.log(`HTML length: ${html.length}`);

    // Debug: check what data exists
    const hasJsonLd = html.includes('application/ld+json');
    const hasOgTitle = html.includes('og:title');
    const hasOgImage = html.includes('og:image');
    const hasProductPrice = html.includes('product:price:amount');
    const hasPriceWhole = html.includes('a-price-whole');
    const hasLandingImage = html.includes('landingImage');
    const hasProductTitle = html.includes('productTitle');
    
    console.log(`\n--- HTML Contains ---`);
    console.log(`  JSON-LD:              ${hasJsonLd}`);
    console.log(`  og:title:             ${hasOgTitle}`);
    console.log(`  og:image:             ${hasOgImage}`);
    console.log(`  product:price:amount: ${hasProductPrice}`);
    console.log(`  a-price-whole:        ${hasPriceWhole}`);
    console.log(`  landingImage:         ${hasLandingImage}`);
    console.log(`  productTitle:         ${hasProductTitle}`);

    // Extract and show raw matches
    if (hasOgTitle) {
      const m = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*?)["']/i) ||
                html.match(/<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']og:title["']/i);
      console.log(`  og:title value:       "${m?.[1]}"`);
    }
    if (hasOgImage) {
      const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*?)["']/i) ||
                html.match(/<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']og:image["']/i);
      console.log(`  og:image value:       "${m?.[1]}"`);
    }
    if (hasProductPrice) {
      const m = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']*?)["']/i) ||
                html.match(/<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']product:price:amount["']/i);
      console.log(`  price:amount value:   "${m?.[1]}"`);
    }
    if (hasPriceWhole) {
      const m = html.match(/<span class="a-price-whole">([\d.,]+)/i);
      console.log(`  a-price-whole value:  "${m?.[1]}"`);
    }
    if (hasLandingImage) {
      const m = html.match(/id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/i);
      if (m) {
        const decoded = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        try {
          const urls = Object.keys(JSON.parse(decoded));
          console.log(`  landingImage URLs:    ${urls[0]}`);
        } catch {
          console.log(`  landingImage raw:     ${decoded.substring(0, 100)}...`);
        }
      }
    }

    // Run the parser
    const parsed = parseHtml(html, { url, allowRegex: true });
    console.log(`\n--- Parsed Result ---`);
    console.log(`  Name:     "${parsed.name}"`);
    console.log(`  Price:    ${parsed.price}`);
    console.log(`  Currency: "${parsed.currency}"`);
    console.log(`  Image:    "${parsed.image}"`);
    console.log(`  Store:    "${parsed.store}"`);
    console.log(`  Method:   "${parsed.method}"`);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

const urls = [
  'https://www.amazon.com.br/dp/B08N5M7S6K',
  // Add more test URLs here if needed
];

(async () => {
  for (const url of urls) {
    await testUrl(url);
  }
})();
