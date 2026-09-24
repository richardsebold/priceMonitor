// Reads the price of a fixed list of real product pages with the production scraper
// and prints what came back, per store. Read-only: it never opens the database.
//
//   npx tsx scripts/probe-scrapers.ts
//
// Compare each printed price with the page by hand. Always exits 0.
import { scrapeProduct } from "../src/modules/price-tracking/scraping/scrape-product";
import { formatProbeReport, type ProbeResult } from "../src/modules/price-tracking/scraping/probe-report";

const URLS = [
  // KaBuM
  "https://www.kabum.com.br/produto/1012610/placa-de-video-msi-geforce-rtx-5060-ti-shadow-2x-oc-plus-nvidia-8gb-gddr7-128-bit-g506t-8s2cp",
  "https://www.kabum.com.br/produto/989702/console-sony-playstation-5-ssd-825gb-controle-sem-fio-dualsense-2-jogos-digitais-edicao-digital",
  "https://www.kabum.com.br/produto/609952/processador-amd-ryzen-9-9900x-4-4-ghz-5-6-ghz-cache-64-mb-12-nucleos-24-threads-am5-100-100000662wof",
  "https://www.kabum.com.br/produto/905691/robo-aspirador-de-po-e-passa-pano-kabum-smart-k1100-mapeamento-mop-rotativo-autolimpante-ate-10000pa-app-127v-preto-ksar110010pt",
  "https://www.kabum.com.br/produto/172365/memoria-ram-kingston-fury-beast-8gb-3200mhz-ddr4-cl16-preto-kf432c16bb-8",
  // Amazon
  "https://www.amazon.com.br/dp/B0GNCKHV9G",
  "https://www.amazon.com.br/dp/B0GNCJSWF5",
  "https://www.amazon.com.br/dp/B097K5J1SB",
  "https://www.amazon.com.br/dp/B0CGLW3GWG",
  // Mercado Livre: add 5 product URLs once the official-API spike settles how they are read.
  // Generic stores already in the catalog
  "https://www.terabyteshop.com.br/produto/21966/memoria-ddr4-corsair-vengeance-rgb-pro-8gb-3200mhz-black-cmw8gx4m1z3200c16",
  "https://www.gsuplementos.com.br/whey-protein-concentrado-1kg-growth-supplements-p985936",
  "https://darklabsuplementos.com.br/products/garrafa-termica-700ml-dark-lab",
  "https://www.pichau.com.br/mouse-gamer-redragon-prism-ultra-26000dpi-5-botoes-tri-mode-preto-m997-ult",
  "https://www.netshoes.com.br/p/tenis-puma-caven-20-bdp-feminino-PI3-1976-900",
  "https://www.magazineluiza.com.br/cafeteira-espresso-dolce-crema-20-bar-mondial-c-20-ec-220v-60hz/p/dbgec1gjba/ep/cfex/",
];

async function main() {
  const results: ProbeResult[] = [];
  for (const url of URLS) {
    try {
      const { method, price } = await scrapeProduct(url);
      results.push({ url, method, price });
    } catch (error) {
      console.error(`erro em ${url}:`, error instanceof Error ? error.message : error);
      results.push({ url, method: "erro", price: 0 });
    }
  }
  console.log(formatProbeReport(results).join("\n"));
}

main().finally(() => process.exit(0));
