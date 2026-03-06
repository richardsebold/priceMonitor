'use client'
import { createAbacatePayCheckout } from "@/actions/abacate-pay";

 // Como tem onClick no botão, esse componente precisa rodar no cliente

export default function Plans() {
  // Lista de planos para facilitar a renderização e manutenção
  const plans = [
    {
      name: "Noob",
      price: "R$ 19,90",
      period: "/mês",
      planId: "plano_noob_mensal",
      features: ["Acesso básico ao sistema", "Suporte via email", "1 Projeto ativo"],
      isPopular: false,
    },
    {
      name: "Pro",
      price: "R$ 49,90",
      period: "/mês",
      planId: "plano_pro_mensal",
      features: ["Tudo do plano Noob", "Suporte prioritário", "Projetos ilimitados", "Relatórios avançados"],
      isPopular: true, // Vamos destacar o plano do meio
    },
    {
      name: "Hacker",
      price: "R$ 99,90",
      period: "/mês",
      planId: "plano_hacker_mensal",
      features: ["Tudo do plano Pro", "Acesso à API", "Consultoria técnica", "IP Dedicado"],
      isPopular: false,
    },
  ];

  // Função que será chamada ao clicar no botão
  const handleSubscribe = (planId: string) => {
    console.log("Iniciando assinatura para o plano:", planId);

    createAbacatePayCheckout(planId);

  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Escolha o plano ideal para você</h2>
        <p className="text-gray-500">Faça upgrade a qualquer momento.</p>
      </div>

      {/* Grid que coloca 1 coluna no celular e 3 colunas em telas maiores (lado a lado) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {plans.map((plan) => (
          <div
            key={plan.planId}
            className={`flex flex-col p-8 rounded-2xl border bg-white ${
              plan.isPopular 
                ? "border-blue-500 shadow-xl scale-105" // Destaque para o plano Pro
                : "border-gray-200 shadow-sm"
            }`}
          >
            {plan.isPopular && (
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide self-start mb-4">
                Mais Popular
              </span>
            )}

            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
            
            <div className="mt-4 mb-6">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-gray-500 font-medium">{plan.period}</span>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  {/* Ícone de check */}
                  <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.planId)}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-colors cursor-pointer ${
                plan.isPopular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              Assinar {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}