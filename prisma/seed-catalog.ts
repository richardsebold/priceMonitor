import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedCatalog } from "../src/modules/price-tracking/application/seed-catalog";
import { CATALOG_SEED_URLS } from "../src/modules/price-tracking/domain/catalog";
import { scrapeProduct } from "../src/modules/price-tracking/scraping/scrape-product";

// Grava no banco de DATABASE_URL. Com o .env padrão, isso é o Neon de produção.
async function main() {
  const { created, failed } = await seedCatalog({
    urls: CATALOG_SEED_URLS,
    scrape: scrapeProduct,
  });

  console.log(`Catálogo: ${created.length} criados, ${failed.length} falharam.`);
  for (const url of failed) console.log(`  falhou: ${url}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
