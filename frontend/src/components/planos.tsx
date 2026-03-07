'use client'
import { createAbacatePayCheckout } from "@/actions/abacate-pay";

// Adicionamos a tipagem para receber a prop do componente pai
interface PlansProps {
  currentPlanId?: string | null;
}

export default function Plans({ currentPlanId }: PlansProps) {
  
  // Se o usuário não tiver plano no banco, assumimos que é o free
  const activePlanId = currentPlanId || "plano_free";

  const plans = [
    {
      name: "Free",
      price: "Grátis",
      period: "",
      planId: "plano_free",
      features: ["Acesso de leitura", "Sem suporte", "0 Projetos ativos"],
      isPopular: false,
    },
    {
      name: "Noob",
      price: "R$ 4,90",
      period: "/mês",
      planId: "plano_noob_mensal",
      features: ["Acesso básico ao sistema", "Suporte via email", "1 Projeto ativo"],
      isPopular: false,
    },
    {
      name: "Pro",
      price: "R$ 9,90",
      period: "/mês",
      planId: "plano_pro_mensal",
      features: ["Tudo do plano Noob", "Suporte prioritário", "Projetos ilimitados", "Relatórios avançados"],
      isPopular: true,
    },
    {
      name: "Hacker",
      price: "R$ 19,90",
      period: "/mês",
      planId: "plano_hacker_mensal",
      features: ["Tudo do plano Pro", "Acesso à API", "Consultoria técnica", "IP Dedicado"],
      isPopular: false,
    },
  ];

  const handleSubscribe = (planId: string) => {
    // Evita o clique se for o plano atual ou se for o gratuito
    if (planId === activePlanId || planId === "plano_free") {
      return;
    }

    console.log("Iniciando assinatura para o plano:", planId);
    createAbacatePayCheckout(planId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Escolha o plano ideal para você</h2>
        <p className="text-gray-500">Faça upgrade a qualquer momento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
        {plans.map((plan) => {

          const isCurrentPlan = plan.planId === activePlanId;

          return (
            <div
              key={plan.planId}
              className={`flex flex-col p-8 rounded-2xl border bg-white h-full ${
                plan.isPopular 
                  ? "border-blue-500 shadow-xl lg:scale-105 relative z-10"
                  : isCurrentPlan ? "border-green-500 shadow-md" // Destaque extra se for o plano atual
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.isPopular && (
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide self-start mb-4">
                  Mais Popular
                </span>
              )}

              {!plan.isPopular && <div className="h-6 mb-4"></div>}

              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              
              <div className="mt-4 mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-gray-500 font-medium">{plan.period}</span>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <svg className="w-5 h-5 mr-3 mt-0.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.planId)}
                disabled={isCurrentPlan || plan.planId === "plano_free"} 
                className={`w-full py-3 px-4 rounded-xl font-bold transition-colors ${
                  isCurrentPlan
                    ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200" // Visual para o plano atual
                    : plan.planId === "plano_free"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" // <-- REGRA NOVA: Deixa o Free cinza claro e bloqueado
                      : plan.isPopular
                        ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer"
                }`}
              >
                {isCurrentPlan ? "Plano Atual" : `Assinar ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}