import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Link, BellRing, TrendingDown, HelpCircle } from "lucide-react"
import Sidebar from "@/components/sidebar"

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">

        <Sidebar />
      
      {/* Cabeçalho da Página */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Como podemos ajudar?</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Aprenda a configurar seus alertas e entenda como o nosso robô monitora as maiores lojas da internet para você economizar.
        </p>
      </div>

      {/* Seção 1: Passo a Passo (Como funciona) */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <HelpCircle className="text-primary" />
          Como o Price Tracker funciona
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <Link className="size-8 text-primary mb-2" />
              <CardTitle className="text-lg">1. Cole o Link</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Encontre o produto que você deseja comprar em qualquer loja online (Amazon, Mercado Livre, Kabum, etc) e copie a URL completa da página.
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <TrendingDown className="size-8 text-primary mb-2" />
              <CardTitle className="text-lg">2. Defina a Meta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Diga ao nosso sistema qual é o preço máximo que você aceita pagar por aquele item. Nós registramos isso como sua &quot;Meta de Preço&quot;.
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <BellRing className="size-8 text-primary mb-2" />
              <CardTitle className="text-lg">3. Deixe com o Robô</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Nossos servidores vão visitar a loja diariamente. Assim que o preço cair e atingir a sua meta, você recebe um e-mail na hora!
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção 2: Perguntas Frequentes (FAQ) */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Perguntas Frequentes</h2>
        
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Quais lojas o sistema consegue monitorar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Nosso robô utiliza um sistema avançado de leitura visual e de código. Ele é compatível com praticamente <strong>qualquer loja virtual</strong>. Basta colar o link da página do produto. Se o site tiver o preço visível, nós conseguimos rastrear.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Como recebo os avisos de queda de preço?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Você receberá um e-mail automático com um design amigável diretamente na caixa de entrada da conta que você usou para se cadastrar. O e-mail contém o preço atual, sua meta e um botão direto para a loja.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  O que acontece se eu atingir o limite do meu plano?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  O plano &quot;Noob&quot; (Gratuito) permite monitorar 1 projeto/produto por vez. Se você tentar adicionar mais itens, o sistema bloqueará a ação. Para monitorar dezenas de URLs simultaneamente, recomendamos fazer o upgrade para os planos <strong>Pro</strong> ou <strong>Hacker</strong> na página de Assinaturas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Meu produto aparece com preço zerado. O que houve?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Isso geralmente acontece se a loja bloqueou nosso robô de acesso, ou se o produto esgotou (ficou fora de estoque) e o site removeu o preço da tela. Verifique o link clicando em &quot;Editar&quot; no seu painel. Se o produto voltar ao estoque, o robô voltará a ler o preço normalmente.
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Seção de Contato */}
      <section className="text-center pt-8">
        <p className="text-muted-foreground mb-4">Ainda precisa de ajuda com alguma coisa?</p>
        <a 
          href="mailto:richardsebold21@gmail.com" 
          className="text-primary font-semibold hover:underline"
        >
          Fale com comigo!
        </a>
      </section>

    </div>
  )
}