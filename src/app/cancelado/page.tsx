import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";

export default function CancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        
        {/* Ícone de Erro/Cancelamento */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Textos de Aviso */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Cancelado
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Parece que você cancelou a compra ou houve algum problema com a transação. Não se preocupe, <strong>nenhuma cobrança foi feita</strong>.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard" // Ajuste para a rota onde ficam seus cards de planos
            className="w-full flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-lg"
          >
            <RefreshCcw className="mr-2 w-5 h-5" />
            Tentar Novamente
          </Link>
          
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 px-4 rounded-xl transition-colors"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Voltar para o Dashboard
          </Link>
        </div>
        
        {/* Nota de rodapé */}
        <p className="text-sm text-gray-400 mt-6">
          Se você acha que isso é um erro, verifique os dados do cartão ou tente pagar via PIX.
        </p>
      </div>
    </div>
  );
}