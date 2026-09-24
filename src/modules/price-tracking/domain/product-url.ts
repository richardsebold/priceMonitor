// Chave usada para reconhecer o mesmo produto em URLs diferentes (parâmetros de
// rastreio, slug alterado, www). KaBuM e Amazon têm um id estável no caminho.
export function normalizeProductUrl(url: string): string {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const path = parsed.pathname.replace(/\/+$/, "");

  if (host === "kabum.com.br") {
    const id = path.match(/^\/produto\/(\d+)/)?.[1];
    if (id) return `${host}/produto/${id}`;
  }

  if (host === "amazon.com.br") {
    const asin = path.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1];
    if (asin) return `${host}/dp/${asin.toUpperCase()}`;
  }

  return `${host}${path}`;
}
