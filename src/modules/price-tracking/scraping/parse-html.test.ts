import { describe, it, expect } from "vitest";
import { parseHtml } from "./parse-html";

describe("parseHtml", () => {
  it("extracts product data from JSON-LD", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {"@type":"Product","name":"Produto Teste","image":"https://img.test/a.png","offers":{"price":"199.90","priceCurrency":"BRL"}}
        </script>
      </head><body></body></html>
    `;

    const result = parseHtml(html);

    expect(result).toMatchObject({
      name: "Produto Teste",
      price: 199.9,
      currency: "BRL",
      image: "https://img.test/a.png",
      method: "json-ld",
    });
  });

  it("falls back to og/product meta tags when there is no JSON-LD", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Meta Produto">
        <meta property="og:image" content="https://img.test/b.png">
        <meta property="product:price:amount" content="99.90">
        <meta property="product:price:currency" content="BRL">
      </head></html>
    `;

    const result = parseHtml(html);

    expect(result).toMatchObject({
      name: "Meta Produto",
      price: 99.9,
      currency: "BRL",
      image: "https://img.test/b.png",
      method: "meta-tags",
    });
  });

  it("uses the Amazon-specific extraction when the url is from Amazon", () => {
    const html = `
      <html><head><title>Produto Amazon Exemplo : Amazon.com.br</title></head>
      <body>
        <span class="a-price-whole">1.234</span><span class="a-price-fraction">56</span>
        <img id="landingImage" src="https://amazon.img/x.jpg">
      </body></html>
    `;

    const result = parseHtml(html, { url: "https://www.amazon.com.br/produto" });

    expect(result).toMatchObject({
      name: "Produto Amazon Exemplo",
      price: 1234.56,
      currency: "BRL",
      image: "https://amazon.img/x.jpg",
      store: "amazon.com.br",
      method: "regex",
    });
  });

  it("scopes Amazon price extraction to the price container, ignoring a decoy price outside it", () => {
    const html = `
      <html><head><title>Produto Amazon Exemplo : Amazon.com.br</title></head>
      <body>
        <div id="decoy"><span class="a-price-whole">999</span><span class="a-price-fraction">99</span></div>
        <div id="corePriceDisplay_desktop_feature_div">
          <span class="a-price-whole">1.234</span><span class="a-price-fraction">56</span>
        </div>
        <img id="landingImage" src="https://amazon.img/x.jpg">
      </body></html>
    `;

    const result = parseHtml(html, { url: "https://www.amazon.com.br/produto" });

    expect(result).toMatchObject({
      price: 1234.56,
      method: "regex",
    });
  });

  it("prefers a non-strikethrough price over a list price inside the same container", () => {
    const html = `
      <html><head><title>Produto Amazon Exemplo : Amazon.com.br</title></head>
      <body>
        <div id="corePriceDisplay_desktop_feature_div">
          <span class="a-price a-text-price" data-a-strike="true">
            <span class="a-price-whole">2.699</span><span class="a-price-fraction">90</span>
          </span>
          <span class="a-price">
            <span class="a-price-whole">1.234</span><span class="a-price-fraction">56</span>
          </span>
        </div>
        <img id="landingImage" src="https://amazon.img/x.jpg">
      </body></html>
    `;

    const result = parseHtml(html, { url: "https://www.amazon.com.br/produto" });

    expect(result).toMatchObject({
      price: 1234.56,
      method: "regex",
    });
  });

  it("falls back to the whole document when the price container has no price within its window", () => {
    const html = `
      <html><head><title>Produto Amazon Exemplo : Amazon.com.br</title></head>
      <body>
        <div id="corePriceDisplay_desktop_feature_div">
          <p>Sem preço aqui dentro.</p>
        </div>
        <span class="a-price-whole">1.234</span><span class="a-price-fraction">56</span>
        <img id="landingImage" src="https://amazon.img/x.jpg">
      </body></html>
    `;

    const result = parseHtml(html, { url: "https://www.amazon.com.br/produto" });

    expect(result).toMatchObject({
      price: 1234.56,
      method: "regex",
    });
  });

  it("uses the Mercado Livre-specific extraction when the url is from Mercado Livre", () => {
    const html = `
      <html><body>
        <h1 class="ui-pdp-title">Produto ML Teste</h1>
        <span class="andes-money-amount__fraction">349</span>
        <img class="ui-pdp-image ui-pdp-gallery__figure__image" src="https://ml.img/y.jpg">
      </body></html>
    `;

    const result = parseHtml(html, { url: "https://www.mercadolivre.com.br/produto-x" });

    expect(result).toMatchObject({
      name: "Produto ML Teste",
      price: 349,
      currency: "BRL",
      image: "https://ml.img/y.jpg",
      method: "regex",
    });
  });

  it("uses the Shopee-specific extraction when the url is from Shopee", () => {
    const html = `
      <html><head><title>Produto Shopee Teste | Shopee Brasil</title></head>
      <body>
        <script>{"price":34900000,"image":"https://shopee.img/w.jpg"}</script>
      </body></html>
    `;

    const result = parseHtml(html, { url: "https://shopee.com.br/produto-y" });

    expect(result).toMatchObject({
      name: "Produto Shopee Teste",
      price: 349,
      image: "https://shopee.img/w.jpg",
      method: "regex",
    });
  });

  it("uses the Magalu-specific extraction when the url is from Magazine Luiza", () => {
    const html = `
      <html><body>
        <h1 data-testid="heading-product-title">Produto Magalu Teste</h1>
        <p data-testid="price-value">R$ 399,90</p>
        <img data-testid="image-selected-thumbnail" src="https://magalu.img/z.jpg">
      </body></html>
    `;

    const result = parseHtml(html, { url: "https://www.magazineluiza.com.br/produto-z" });

    expect(result).toMatchObject({
      name: "Produto Magalu Teste",
      price: 399.9,
      image: "https://magalu.img/z.jpg",
      method: "regex",
    });
  });

  it("falls back to visible text regex when allowRegex is set and nothing else matched", () => {
    const html = `
      <html><head><title>Produto Fallback</title></head>
      <body><p>Por apenas R$ 129,90 hoje!</p></body></html>
    `;

    const result = parseHtml(html, { allowRegex: true });

    expect(result).toMatchObject({
      name: "Produto Fallback",
      price: 129.9,
      currency: "BRL",
      method: "regex",
    });
  });

  it("returns method 'none' with price 0 when no product data can be found", () => {
    const html = `
      <html><head><title>Sem Preco</title></head>
      <body><h1>Titulo Visivel</h1></body></html>
    `;

    const result = parseHtml(html);

    expect(result).toMatchObject({
      name: "Titulo Visivel",
      price: 0,
      currency: "",
      method: "none",
    });
  });
});
