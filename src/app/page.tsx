import Link from "next/link"
import {
  ArrowRight,
  BadgeDollarSign,
  Bell,
  Check,
  Clipboard,
  Eye,
  Github,
  History,
  Instagram,
  LineChart,
  Mail,
  Send,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingDown,
  Wand2,
  Zap,
} from "lucide-react"

import { TrackUrlForm } from "@/components/landing/track-url-form"
import { PriceHistoryDemo } from "@/components/landing/price-history-demo"
import { TestimonialsMarquee } from "@/components/landing/testimonials-marquee"
import { LandingFAQ } from "@/components/landing/landing-faq"

const stores = [
  "Amazon",
  "Mercado Livre",
  "Magalu",
  "Americanas",
  "Casas Bahia",
  "Shopee",
  "Kabum",
  "Pichau",
  "Centauro",
  "Netshoes",
  "Fast Shop",
  "AliExpress",
]

const features = [
  {
    icon: History,
    title: "Histórico de preço",
    body:
      "Coletamos o preço todo dia e desenhamos a curva completa. Veja se aquela 'promoção' é real ou marketing.",
  },
  {
    icon: Target,
    title: "Meta de preço",
    body:
      "Define o valor que você toparia pagar. Quando o preço bater a sua meta, a gente avisa imediatamente.",
  },
  {
    icon: Bell,
    title: "Alertas no Telegram e e-mail",
    body:
      "Notificações instantâneas com o gráfico, o preço atual e o link direto pra fechar a compra.",
  },
  {
    icon: ShoppingBag,
    title: "Funciona em qualquer loja",
    body:
      "De Amazon a Magalu, Shopee e Kabum. Se a loja tem página de produto pública, a gente monitora.",
  },
]

const plans = [
  {
    name: "Free",
    tag: "pra testar a vibe",
    price: "Grátis",
    period: "",
    features: [
      "1 produto monitorado",
      "Histórico de 30 dias",
      "Alerta por e-mail",
      "Coleta diária",
    ],
    cta: "Começar grátis",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    tag: "pro consumidor consciente",
    price: "R$ 9,90",
    period: "/mês",
    features: [
      "Até 25 produtos",
      "Histórico de 12 meses",
      "Alertas no Telegram + e-mail",
      "Meta de preço por produto",
      "Compare 3 lojas no mesmo card",
    ],
    cta: "Assinar Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Hacker",
    tag: "quando preço é trabalho",
    price: "R$ 19,90",
    period: "/mês",
    features: [
      "Produtos ilimitados",
      "Histórico irrestrito",
      "Frequência de coleta ajustável",
      "Acesso à API",
      "Webhooks pro Slack/Discord",
    ],
    cta: "Assinar Hacker",
    href: "/signup?plan=hacker",
    highlight: false,
  },
]

const navLinks = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#lojas", label: "Lojas" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
]

const stats = [
  { value: "2.4M+", label: "economizados pelos usuários" },
  { value: "180k", label: "preços coletados por dia" },
  { value: "12s", label: "do paste ao primeiro registro" },
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
      {/* ============================== NAVBAR ============================== */}
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-white/10 bg-zinc-950/80 py-2 pl-3 pr-2 shadow-2xl shadow-black/50 ring-1 ring-black/5 backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
          >
            <span className="relative flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
              <BadgeDollarSign className="size-4" />
              <span className="absolute -inset-px -z-10 rounded-full bg-primary/20 blur-md" />
            </span>
            <span className="font-semibold tracking-tight text-white">Price Tracker</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-100"
            >
              Acessar
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint" />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] glow-primary" />

        <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground/90">
              <Sparkles className="size-3 text-primary" />
              <span>Mais que rastreador, um copiloto pra suas compras.</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 max-w-4xl text-balance text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Compre na hora certa.{" "}
              <span className="text-gradient-primary">Pague o melhor preço.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              Cole a URL do produto, defina sua meta e relaxe.
              A gente coleta o preço todo dia, monta o histórico e te avisa
              no momento exato em que vale a pena fechar.
            </p>

            {/* URL form */}
            <div className="mt-10 w-full">
              <TrackUrlForm />
            </div>

            {/* Stats row */}
            <div className="mt-12 grid w-full max-w-2xl grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/60 bg-card/40 backdrop-blur">
              {stats.map((s) => (
                <div key={s.label} className="px-3 py-4 text-center">
                  <p className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Demo dashboard preview */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute -left-10 top-10 hidden size-24 rounded-full bg-primary/10 blur-3xl lg:block" />
            <div className="absolute -right-10 bottom-10 hidden size-32 rounded-full bg-primary/15 blur-3xl lg:block" />
            <PriceHistoryDemo />
          </div>
        </div>
      </section>

      {/* ============================== COMO FUNCIONA ============================== */}
      <section id="como-funciona" className="relative py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Como funciona
            </span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Três passos. <span className="text-muted-foreground">Zero esforço.</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Você cuida da escolha. A gente cuida do timing.
            </p>
          </div>

          <ol className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Clipboard,
                title: "Cole a URL",
                body:
                  "Pegou um produto no Mercado Livre, Amazon ou qualquer outro? Cola o link no painel.",
              },
              {
                step: "02",
                icon: Eye,
                title: "A gente monitora",
                body:
                  "Todo dia, em horário fixo, registramos o preço, o estoque e a loja. Sem você abrir nada.",
              },
              {
                step: "03",
                icon: Bell,
                title: "Avisamos a hora certa",
                body:
                  "Bateu sua meta ou caiu 10%? Você recebe um alerta no Telegram com gráfico e link pronto.",
              },
            ].map(({ step, icon: Icon, title, body }) => (
              <li
                key={step}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-primary/30"
              >
                <div className="absolute -right-4 -top-6 font-mono text-7xl font-black leading-none text-primary/5 transition-colors group-hover:text-primary/15">
                  {step}
                </div>
                <div className="relative flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Icon className="size-5" />
                </div>
                <h3 className="relative mt-5 text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================== FEATURES GRID ============================== */}
      <section className="relative border-t border-border/60 bg-secondary/15 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Funcionalidades
            </span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Tudo que falta nas{" "}
              <span className="text-gradient-primary">"promoções"</span> de fim de ano.
            </h2>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/80"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  saiba mais <ArrowRight className="size-3" />
                </div>
              </div>
            ))}
          </div>

          {/* Big highlight card */}
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-border bg-card/60 p-8">
              <div className="absolute -right-16 -bottom-16 size-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <LineChart className="size-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Veja o gráfico antes de comprar.
                  </h3>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    O preço subiu 30% na semana passada pra "cair 20%" hoje?
                    A gente expõe o truque. Sua decisão fica baseada em dados,
                    não em manchete.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-8">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/25 blur-3xl" />
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Wand2 className="size-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  Setup em <span className="text-primary">12 segundos.</span>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sem extensão de navegador, sem instalação. Cola, salva, fim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== LOJAS SUPORTADAS ============================== */}
      <section id="lojas" className="relative py-24 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Compatibilidade
          </span>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Qualquer e-commerce.{" "}
            <span className="text-gradient-primary">Mesmo aquele que você nem ouviu falar.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base text-muted-foreground">
            A gente lê a página como se fosse um humano (mas sem precisar de café).
            Se a loja tem URL pública de produto, é compatível.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            {stores.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm font-medium text-foreground/85 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary/70" />
                {s}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground">
              + qualquer outra
            </span>
          </div>
        </div>
      </section>

      {/* ============================== TESTIMONIALS ============================== */}
      <section className="relative border-y border-border/60 bg-secondary/20 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Quem já economiza
            </span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              R$ 2,4 milhões salvos do impulso.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Histórico de preço vira hábito. E hábito vira dinheiro no bolso.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <TestimonialsMarquee />
        </div>
      </section>

      {/* ============================== PRICING ============================== */}
      <section id="planos" className="relative py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Planos
            </span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Menos do que um café.{" "}
              <span className="text-gradient-primary">Mais que um cofrinho.</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Sem letrinha miúda, sem taxa de adesão, cancela quando quiser.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3 md:items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  "relative flex flex-col rounded-2xl border bg-card/60 p-7 transition-colors",
                  plan.highlight
                    ? "border-primary/60 bg-card shadow-2xl shadow-primary/10 lg:scale-[1.02]"
                    : "border-border hover:border-primary/30",
                ].join(" ")}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30">
                    Mais escolhido
                  </span>
                )}

                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                  {plan.highlight && (
                    <Zap className="size-4 text-primary" />
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tag}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="mt-6 space-y-3 border-t border-border/60 pt-6 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-foreground/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={[
                    "mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    plan.highlight
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                      : "border border-border bg-secondary/60 text-foreground hover:bg-secondary",
                  ].join(" ")}
                >
                  {plan.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section id="faq" className="relative border-t border-border/60 py-24 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              FAQ
            </span>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight">
              Perguntas que aparecem antes do café.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Não achou? Manda um e-mail, a gente responde rápido.
            </p>
            <a
              href="mailto:contato@pricetracker.app"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Mail className="size-4" />
              contato@pricetracker.app
            </a>
          </div>

          <LandingFAQ />
        </div>
      </section>

      {/* ============================== FINAL CTA ============================== */}
      <section className="relative overflow-hidden border-t border-border/60 py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 -z-10 glow-primary opacity-70" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground/90">
            <TrendingDown className="size-3 text-primary" />
            Promoção real é a que cabe no seu bolso.
          </span>
          <h2 className="mt-6 text-balance text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
            Pare de pagar caro{" "}
            <span className="text-gradient-primary">por costume.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Cola a URL do próximo produto que você quer. Em 12 segundos
            o histórico começa. Em alguns dias, você compra com desconto de verdade.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-0.5"
            >
              Começar agora — é grátis
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#planos"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Ver planos
            </Link>
          </div>

          <p className="mt-6 font-mono text-xs text-muted-foreground">
            sem cartão · sem amarração · cancela quando quiser
          </p>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                  <BadgeDollarSign className="size-4" />
                </span>
                <span className="font-semibold tracking-tight">Price Tracker</span>
              </Link>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                Histórico de preço pra quem leva a sério economizar.
                Feito no Brasil, com café e gráficos.
              </p>
              <div className="mt-5 flex gap-2">
                {[
                  { Icon: Send, href: "https://t.me/", label: "Telegram" },
                  { Icon: Instagram, href: "https://instagram.com/", label: "Instagram" },
                  { Icon: Github, href: "https://github.com/", label: "GitHub" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Produto
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-foreground">Como funciona</a></li>
                <li><a href="#lojas" className="hover:text-foreground">Lojas</a></li>
                <li><a href="#planos" className="hover:text-foreground">Planos</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                Empresa
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/termos" className="hover:text-foreground">Termos de uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-foreground">Privacidade</Link></li>
                <li><Link href="/help" className="hover:text-foreground">Ajuda</Link></li>
                <li><a href="mailto:contato@pricetracker.app" className="hover:text-foreground">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Price Tracker. Todos os direitos reservados.</p>
            <p className="font-mono">
              feito com{" "}
              <span className="text-primary">{"<3"}</span> em São Paulo
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
