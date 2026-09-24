export interface ProbeResult {
  url: string;
  method: string;
  price: number;
}

const storeOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// One line per URL for checking the read price against the page by hand, then how
// many prices each store returned. There is no expected price to compare with: a
// hand-written one goes stale within hours.
export function formatProbeReport(results: ProbeResult[]): string[] {
  const lines = results.map(
    (r) => `${storeOf(r.url)} | ${r.method} | ${r.price > 0 ? r.price : "sem preço"} | ${r.url}`,
  );

  const perStore = new Map<string, { obtained: number; total: number }>();
  for (const r of results) {
    const store = storeOf(r.url);
    const count = perStore.get(store) ?? { obtained: 0, total: 0 };
    count.total += 1;
    if (r.price > 0) count.obtained += 1;
    perStore.set(store, count);
  }

  lines.push("");
  for (const [store, { obtained, total }] of perStore) {
    lines.push(`${store}: obtidos ${obtained}/${total}`);
  }
  return lines;
}
