import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PoliticaDePrivacidade() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground">Última atualização: 30 de março de 2026</p>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Coleta de Informações</h2>
          <p>
            Coletamos informações que você nos fornece diretamente, como nome, endereço de e-mail e outras informações de contato ao criar uma conta, preencher seu perfil ou se comunicar conosco. Também podemos coletar dados automaticamente sobre como você interage com nossa plataforma, incluindo URLs de produtos que você monitora.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Uso das Informações</h2>
          <p className="mb-3">
            Utilizamos as informações coletadas para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer, manter e melhorar nossos serviços de monitoramento;</li>
            <li>Processar e enviar alertas de alteração de preços;</li>
            <li>Responder aos seus comentários, perguntas e solicitações de suporte;</li>
            <li>Monitorar e analisar tendências, uso e atividades relacionadas à plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Compartilhamento de Dados</h2>
          <p>
            Não compartilhamos, vendemos, alugamos ou negociamos suas informações pessoais com terceiros para fins comerciais. Podemos compartilhar dados anonimizados e agregados que não identificam você pessoalmente. Podemos divulgar suas informações se exigido por lei ou em resposta a processos legais válidos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Segurança</h2>
          <p>
            Tomamos medidas razoáveis para ajudar a proteger as informações pessoais sobre você contra perda, roubo, uso indevido, acesso não autorizado, divulgação, alteração e destruição. No entanto, nenhum sistema de segurança é impenetrável e não podemos garantir a segurança absoluta dos seus dados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies e Tecnologias Semelhantes</h2>
          <p>
            Nossa plataforma pode usar cookies e tecnologias de rastreamento semelhantes para rastrear a atividade em nosso serviço e reter certas informações, visando melhorar e analisar nossa plataforma, além de manter sua sessão autenticada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Seus Direitos</h2>
          <p>
            Você tem o direito de acessar, corrigir, atualizar ou excluir as informações pessoais que temos sobre você. Você pode gerenciar a maioria dessas informações diretamente nas configurações do seu perfil na plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Alterações nesta Política</h2>
          <p>
            Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a data no topo deste documento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade, as práticas deste site ou suas relações com ele, entre em contato conosco através do nosso e-mail de suporte.
          </p>
        </section>
      </div>
    </div>
  )
}