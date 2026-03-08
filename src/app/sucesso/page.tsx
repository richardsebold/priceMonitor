import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        
        {/* Ícone de Sucesso Animado (Pulse) */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        {/* Textos de Confirmação */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Aprovado!
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Que legal ter você com a gente! Sua assinatura foi processada com sucesso e os recursos do seu novo plano já estão liberados.
        </p>

        {/* Botão de Ação */}
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          Ir para o Dashboard
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
        
        {/* Nota de rodapé opcional */}
        <p className="text-sm text-gray-400 mt-6">
          Um recibo com os detalhes da transação foi enviado para o seu email.
        </p>
      </div>
    </div>
  );
}