"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const items = [
  {
    q: "O que é o Price Tracker?",
    a: "Um SaaS que monitora o preço de produtos em e-commerces brasileiros. Você cola a URL, a gente coleta o preço todos os dias e te avisa quando ele cair ou bater a sua meta.",
  },
  {
    q: "Em quais lojas funciona?",
    a: "Funciona em qualquer loja com página pública de produto: Amazon, Mercado Livre, Magalu, Americanas, Casas Bahia, Shopee, Kabum, Pichau, Centauro, Netshoes — e qualquer site que você consiga abrir no navegador.",
  },
  {
    q: "Com que frequência o preço é checado?",
    a: "Uma vez por dia, em horário automatizado. No plano Hacker a frequência é ajustável e você pode forçar uma verificação manual a qualquer momento.",
  },
  {
    q: "Como recebo os alertas?",
    a: "Por e-mail e Telegram. Basta conectar seu @ no Telegram nas configurações. Você recebe alerta quando o preço bate sua meta, ou quando cai 10% em relação ao primeiro valor cadastrado.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Você cancela direto no painel, sem ligar pra ninguém, e mantém acesso até o fim do ciclo já pago.",
  },
  {
    q: "Vocês compram ou afiliam o produto pra mim?",
    a: "Não. A gente só rastreia o preço e te manda o alerta com o link. A compra acontece direto no site da loja, no seu nome.",
  },
]

export function LandingFAQ() {
  return (
    <Accordion type="single" collapsible className="w-full divide-y divide-border/70">
      {items.map((item, idx) => (
        <AccordionItem
          key={idx}
          value={`item-${idx}`}
          className="border-b-0 px-1 py-1"
        >
          <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline data-[state=open]:text-foreground">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-8 text-[15px] leading-relaxed text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
