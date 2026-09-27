import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Children, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";

const { pathname, replace, signOut } = vi.hoisted(() => ({
  pathname: { current: "/produtos" as string | null },
  replace: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut },
}));

import { TooltipProvider } from "../ui/tooltip";
import { ButtonSignOut } from "../button-signout";
import { DesktopNavLinks, MobileNavLinks } from "./nav-links";

// O Vitest roda em ambiente `node`, sem DOM: extrai as tags do HTML estático.
type Tag = {
  getAttribute: (name: string) => string | null;
  classList: { contains: (name: string) => boolean };
  textContent: string;
};

function parseTags(html: string, tag: "a" | "button"): Tag[] {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, "g");
  return [...html.matchAll(pattern)].map(([, attrs, inner]) => {
    const values = new Map(
      [...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
    );
    const classes = (values.get("class") ?? "").split(/\s+/);
    return {
      getAttribute: (name) => values.get(name) ?? null,
      classList: { contains: (name) => classes.includes(name) },
      textContent: inner.replace(/<[^>]*>/g, ""),
    };
  });
}

function render(ui: ReactElement) {
  const html = renderToStaticMarkup(ui);
  return { querySelectorAll: (tag: "a" | "button") => parseTags(html, tag) };
}

function links(container: ReturnType<typeof render>) {
  return container.querySelectorAll("a");
}

function renderDesktop() {
  return render(
    <TooltipProvider>
      <DesktopNavLinks />
      <DesktopNavLinks footer />
    </TooltipProvider>,
  );
}

beforeEach(() => {
  pathname.current = "/produtos";
  replace.mockReset();
  signOut.mockReset();
});

describe("MobileNavLinks", () => {
  it("leva cada item à rota certa, na ordem da sidebar", () => {
    const items = links(render(<MobileNavLinks />)).map((a) => [
      a.getAttribute("href"),
      a.textContent,
    ]);

    expect(items).toEqual([
      ["/dashboard", "Dashboard"],
      ["/produtos", "Produtos Rastreados"],
      ["/alertas", "Alertas"],
      ["/planos", "Planos"],
      ["/settings", "Configurações"],
      ["/help", "Ajuda"],
    ]);
  });

  it("marca só a página atual com aria-current e text-foreground", () => {
    const container = render(<MobileNavLinks />);
    const active = links(container).filter((a) => a.getAttribute("aria-current"));

    expect(active.map((a) => [a.getAttribute("href"), a.getAttribute("aria-current")])).toEqual([
      ["/produtos", "page"],
    ]);
    expect(active[0].classList.contains("text-foreground")).toBe(true);
    expect(active[0].classList.contains("text-muted-foreground")).toBe(false);
  });

  it("ativa o item em uma subrota", () => {
    pathname.current = "/settings/billing";
    const active = links(render(<MobileNavLinks />)).filter((a) => a.getAttribute("aria-current"));

    expect(active.map((a) => a.getAttribute("href"))).toEqual(["/settings"]);
  });

  it("não ativa nada quando o pathname é null", () => {
    pathname.current = null;
    const active = links(render(<MobileNavLinks />)).filter((a) => a.getAttribute("aria-current"));

    expect(active).toEqual([]);
  });

  it("renderiza Sair como botão, não como link", () => {
    const container = render(<MobileNavLinks />);
    const buttons = [...container.querySelectorAll("button")].map((b) => b.textContent);

    expect(buttons).toEqual(["Sair"]);
    expect(links(container).some((a) => a.textContent === "Sair")).toBe(false);
  });
});

describe("MobileNavLinks: Sair", () => {
  it("usa o ButtonSignOut, que chama authClient.signOut ao clicar", async () => {
    const fragment = MobileNavLinks() as ReactElement<{ children: ReactNode }>;
    const item = Children.toArray(fragment.props.children).find(
      (child) => isValidElement(child) && child.type === ButtonSignOut,
    ) as ReactElement<ComponentProps<typeof ButtonSignOut>> | undefined;

    expect(item).toBeDefined();

    const button = ButtonSignOut(item!.props) as ReactElement<{
      onClick: () => Promise<void>;
    }>;
    await button.props.onClick();

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe("DesktopNavLinks", () => {
  it("tem links para as mesmas seis rotas", () => {
    const hrefs = links(renderDesktop()).map((a) => a.getAttribute("href"));

    expect(hrefs).toEqual([
      "/dashboard",
      "/produtos",
      "/alertas",
      "/planos",
      "/settings",
      "/help",
    ]);
  });

  it("marca só a página atual com aria-current, bg-accent e text-accent-foreground", () => {
    pathname.current = "/alertas";
    const container = renderDesktop();
    const active = links(container).filter((a) => a.getAttribute("aria-current"));

    expect(active.map((a) => [a.getAttribute("href"), a.getAttribute("aria-current")])).toEqual([
      ["/alertas", "page"],
    ]);
    expect(active[0].classList.contains("bg-accent")).toBe(true);
    expect(active[0].classList.contains("text-accent-foreground")).toBe(true);

    const inactive = links(container).find((a) => a.getAttribute("href") === "/dashboard")!;
    expect(inactive.classList.contains("bg-accent")).toBe(false);
  });
});

describe("ButtonSignOut", () => {
  it("encerra a sessão e redireciona para / quando dá certo", async () => {
    signOut.mockImplementation(async ({ fetchOptions }) => fetchOptions.onSuccess());

    const button = ButtonSignOut({ children: "Sair" }) as ReactElement<{
      onClick: () => Promise<void>;
    }>;
    await button.props.onClick();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("não redireciona se o signOut não chamar onSuccess", async () => {
    signOut.mockResolvedValue({ error: { message: "falhou" } });

    const button = ButtonSignOut({ children: "Sair" }) as ReactElement<{
      onClick: () => Promise<void>;
    }>;
    await button.props.onClick();

    expect(replace).not.toHaveBeenCalled();
  });
});
