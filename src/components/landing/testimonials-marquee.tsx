import { Quote } from "lucide-react"

type Testimonial = {
  name: string
  handle: string
  product: string
  saved: string
  body: string
  initials: string
}

const testimonials: Testimonial[] = [
  {
    name: "Marina Costa",
    handle: "@maricosta",
    product: "PlayStation 5 Slim",
    saved: "R$ 540",
    body: "Esperei 3 semanas com a meta cravada. O bot mandou alerta no Telegram às 2h da manhã, comprei do celular ainda na cama.",
    initials: "MC",
  },
  {
    name: "Rafael Andrade",
    handle: "@rafa.dev",
    product: "MacBook Air M3",
    saved: "R$ 1.200",
    body: "Coloquei a URL e esqueci. Quando o gráfico mostrou o menor preço dos últimos 90 dias, foi só clicar e finalizar.",
    initials: "RA",
  },
  {
    name: "Beatriz Lima",
    handle: "@biamlima",
    product: "Geladeira Brastemp 482L",
    saved: "R$ 720",
    body: "Achei que era só hype, mas o histórico me mostrou que a 'promoção da Black Friday' era mais cara que o preço de outubro.",
    initials: "BL",
  },
  {
    name: "Diego Souza",
    handle: "@diegoosouza",
    product: "Bicicleta Caloi Elite Carbon",
    saved: "R$ 1.850",
    body: "Comparar histórico de preço virou rotina. Não compro mais nada acima de R$ 500 sem rastrear por pelo menos 14 dias antes.",
    initials: "DS",
  },
  {
    name: "Camila Reis",
    handle: "@camireis",
    product: "AirPods Pro 2",
    saved: "R$ 380",
    body: "O alerta no email é objetivo: preço, gráfico e link direto. Sem newsletter, sem cupom falso. Funciona.",
    initials: "CR",
  },
  {
    name: "Lucas Tavares",
    handle: "@ltavares",
    product: "Monitor LG UltraGear 27\"",
    saved: "R$ 460",
    body: "Saí da rotina de F5 em três sites. Cole a URL, defino a meta, recebo o alerta. Tempo de volta pra mim.",
    initials: "LT",
  },
  {
    name: "Aline Pereira",
    handle: "@alinep",
    product: "Robô aspirador Roborock",
    saved: "R$ 690",
    body: "O dashboard mostra a curva inteira. Dá pra ver claramente quando é 'falsa promoção' e quando é descontão de verdade.",
    initials: "AP",
  },
  {
    name: "Henrique Faria",
    handle: "@hfaria",
    product: "Câmera Sony A6400",
    saved: "R$ 950",
    body: "Já recomendei pra três amigos. O custo é menor que um cafezinho e me poupa centenas em cada compra grande.",
    initials: "HF",
  },
]

function Card({ t }: { t: Testimonial }) {
  return (
    <article className="flex w-[320px] shrink-0 flex-col gap-3 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur sm:w-[360px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold tracking-wide text-primary">
            {t.initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.handle}</p>
          </div>
        </div>
        <Quote className="size-4 text-muted-foreground/50" />
      </div>

      <p className="text-sm leading-relaxed text-foreground/85">{t.body}</p>

      <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] uppercase tracking-widest">
        <span className="truncate text-muted-foreground">{t.product}</span>
        <span className="font-mono font-semibold text-primary">
          –{t.saved}
        </span>
      </div>
    </article>
  )
}

export function TestimonialsMarquee() {
  const row1 = testimonials.slice(0, 4)
  const row2 = testimonials.slice(4)

  return (
    <div className="marquee-mask flex flex-col gap-4 overflow-hidden">
      <div className="flex gap-4 animate-marquee" style={{ width: "max-content" }}>
        {[...row1, ...row1].map((t, i) => (
          <Card key={`r1-${i}`} t={t} />
        ))}
      </div>
      <div className="flex gap-4 animate-marquee-reverse" style={{ width: "max-content" }}>
        {[...row2, ...row2].map((t, i) => (
          <Card key={`r2-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}
