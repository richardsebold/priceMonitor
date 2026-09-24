import { prisma } from "@/lib/prisma";
import type { ScrapedProduct } from "../scraping/scrape-product";
import { CATALOG_USER_ID } from "../domain/catalog";

type SeedCatalogOptions = {
  urls: readonly string[];
  scrape: (url: string) => Promise<ScrapedProduct | null>;
};

const catalogUser = {
  email: "catalogo@system.monitorador.invalid",
  name: "Catálogo",
  priceAlertsEnabled: false,
  weeklySummaryEnabled: false,
};

export async function seedCatalog({ urls, scrape }: SeedCatalogOptions) {
  await prisma.user.upsert({
    where: { id: CATALOG_USER_ID },
    create: { id: CATALOG_USER_ID, ...catalogUser },
    update: { priceAlertsEnabled: false, weeklySummaryEnabled: false },
  });

  const existing = await prisma.productHistory.findMany({
    where: { userId: CATALOG_USER_ID },
    select: { url: true },
  });
  const seeded = new Set(existing.map((product) => product.url));

  const created: string[] = [];
  const failed: string[] = [];

  for (const url of urls) {
    if (seeded.has(url)) continue;

    try {
      const scraped = await scrape(url);
      if (!scraped || scraped.price <= 0) {
        console.error(`[CATALOG] Falha ao ler o preço de ${url}`);
        failed.push(url);
        continue;
      }

      const product = await prisma.productHistory.create({
        data: {
          url,
          name: scraped.name,
          price: scraped.price,
          priceTarget: 0,
          currency: scraped.currency,
          image: scraped.image,
          method: scraped.method,
          store: scraped.store,
          lastPriceReadAt: new Date(),
          userId: CATALOG_USER_ID,
        },
      });

      await prisma.priceHistory.create({
        data: { price: scraped.price, productId: product.id },
      });

      created.push(url);
      console.log(`[CATALOG] ${scraped.name}: R$ ${scraped.price}`);
    } catch (error) {
      console.error(`[CATALOG] Erro ao cadastrar ${url}:`, error);
      failed.push(url);
    }
  }

  return { created, failed };
}
