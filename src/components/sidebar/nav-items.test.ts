import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isActivePath } from "./nav-items";

describe("isActivePath", () => {
  it("ativa quando o pathname é igual ao href", () => {
    expect(isActivePath("/produtos", "/produtos")).toBe(true);
  });

  it("ativa em subrotas do href", () => {
    expect(isActivePath("/settings/billing", "/settings")).toBe(true);
  });

  it("não ativa para outra rota", () => {
    expect(isActivePath("/alertas", "/produtos")).toBe(false);
  });

  it("não ativa quando o pathname só compartilha o prefixo de texto", () => {
    expect(isActivePath("/produtosx", "/produtos")).toBe(false);
  });

  it("não ativa nenhum item na landing page", () => {
    expect(NAV_ITEMS.filter((item) => isActivePath("/", item.href))).toEqual([]);
  });

  it("não ativa nada quando o pathname é null", () => {
    expect(isActivePath(null, "/dashboard")).toBe(false);
  });
});

describe("NAV_ITEMS", () => {
  it("lista as seis rotas do app na ordem da sidebar", () => {
    expect(NAV_ITEMS.map(({ href, label }) => [href, label])).toEqual([
      ["/dashboard", "Dashboard"],
      ["/produtos", "Produtos Rastreados"],
      ["/alertas", "Alertas"],
      ["/planos", "Planos"],
      ["/settings", "Configurações"],
      ["/help", "Ajuda"],
    ]);
  });
});
