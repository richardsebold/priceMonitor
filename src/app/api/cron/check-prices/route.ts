import { runPriceCheckJob } from "@/modules/price-tracking/application/run-price-check-job";
import { handlePriceEvent } from "@/modules/alerting/application/handle-price-event";
import { bearerTokenMatches } from "@/lib/secure-compare";

// Só permite requisições GET
export async function GET(request: Request) {

  const authHeader = request.headers.get("authorization");

  if (!bearerTokenMatches(authHeader, process.env.CRON_SECRET, "CRON_SECRET")) {
    return new Response("Não autorizado", { status: 401 });
  }
  try {
    await runPriceCheckJob({ onPriceEvent: handlePriceEvent });
    return new Response("Cron job concluído com sucesso!", { status: 200 });
  } catch (error) {
    console.error("Erro no cron job:", error);
    return new Response("Erro interno", { status: 500 });
  }
  
}
