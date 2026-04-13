import { runPriceCheckJob } from "@/actions/check-prices";

// Só permite requisições GET
export async function GET(request: Request) {

  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Não autorizado", { status: 401 });
  }
  try {
    runPriceCheckJob();
    return new Response("Job iniciado com sucesso!", { status: 200 });
  } catch (error) {
    return new Response("Erro interno", { status: 500 });
  }
  
}
