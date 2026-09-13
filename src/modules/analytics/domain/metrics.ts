export type BiggestDrop = {
  name: string | null;
  drop: string;
  oldPrice: number;
  currentPrice: number;
};

export function sumPotentialSavings(products: { price: number; priceTarget: number }[]): number {
  return products.reduce(
    (acc, p) => (p.price < p.priceTarget ? acc + (p.priceTarget - p.price) : acc),
    0,
  );
}

export function findBiggestDrop(
  products: { name: string | null; price: number; history: { price: number }[] }[],
): BiggestDrop | null {
  let maxDrop = 0;
  let biggestDrop: BiggestDrop | null = null;

  for (const product of products) {
    if (!product.history?.length) continue;

    const maxPrice = Math.max(...product.history.map((h) => h.price), product.price);
    if (maxPrice <= product.price) continue;

    const dropPct = ((maxPrice - product.price) / maxPrice) * 100;
    if (dropPct > maxDrop) {
      maxDrop = dropPct;
      biggestDrop = {
        name: product.name,
        drop: dropPct.toFixed(1),
        oldPrice: maxPrice,
        currentPrice: product.price,
      };
    }
  }

  return biggestDrop;
}
