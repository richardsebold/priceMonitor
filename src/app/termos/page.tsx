import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermosDeServico() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Termos de Serviço</h1>
        <p className="text-sm text-muted-foreground">Última atualização: 30 de março de 2026</p>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar este sistema, você concorda em cumprir e ficar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Descrição do Serviço</h2>
          <p>
            Nosso sistema fornece ferramentas para monitoramento de preços e envio de alertas automatizados. Reservamo-nos o direito de modificar, suspender ou descontinuar o serviço a qualquer momento, com ou sem aviso prévio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Cadastro e Conta de Usuário</h2>
          <p className="mb-3">
            Para utilizar certas funcionalidades do serviço, você precisará se cadastrar. Você concorda em:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer informações precisas, atualizadas e completas.</li>
            <li>Manter a segurança da sua senha e identificação.</li>
            <li>Aceitar a responsabilidade por todas as atividades que ocorrerem sob sua conta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Uso Aceitável</h2>
          <p>
            Você concorda em não usar o serviço para qualquer propósito ilegal ou não autorizado. É estritamente proibido tentar violar a segurança do sistema, acessar dados de outros usuários ou sobrecarregar nossos servidores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Limitação de Responsabilidade</h2>
          <p>
            Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais ou consequentes resultantes do uso ou da incapacidade de usar nossos serviços, incluindo falhas no envio de alertas ou imprecisão de preços capturados por terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Modificações dos Termos</h2>
          <p>
            Podemos revisar estes Termos de Serviço a qualquer momento. Ao continuar a usar ou acessar o serviço após as revisões entrarem em vigor, você concorda em ficar vinculado aos termos revisados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco através do e-mail de suporte.
          </p>
        </section>
      </div>
    </div>
  )
}