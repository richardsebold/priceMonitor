import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const ABACATEPAY_API = "https://api.abacatepay.com/v2";

async function upsertAbacatePayProduct(plan: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cycle: string;
}) {
  const response = await fetch(`${ABACATEPAY_API}/products/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      externalId: plan.id,
      name: plan.name,
      description: plan.description ?? undefined,
      price: plan.price,
      currency: "BRL",
      cycle: plan.cycle,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Falha ao criar produto na AbacatePay para ${plan.id}: ${JSON.stringify(data)}`,
    );
  }

  return data.data?.id ?? data.id;
}

async function main() {
  const plans = await prisma.plan.findMany({
    where: { abacatepayProductId: null, price: { gt: 0 } },
  });

  if (plans.length === 0) {
    console.log("Todos os planos pagos já estão sincronizados com a AbacatePay.");
    return;
  }

  for (const plan of plans) {
    console.log(`Registrando ${plan.id} (${plan.name})...`);
    const productId = await upsertAbacatePayProduct(plan);
    await prisma.plan.update({
      where: { id: plan.id },
      data: { abacatepayProductId: productId },
    });
    console.log(`  → abacatepayProductId=${productId}`);
  }

  console.log("Sincronização concluída.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
