import { after } from "next/server";
import { runPriceCheckJob } from "@/modules/price-tracking/application/run-price-check-job";
import { handlePriceEvent } from "@/modules/alerting/application/handle-price-event";
import { bearerTokenMatches } from "@/lib/secure-compare";

// The round runs after the response: cron-job.org's free plan gives up after 30s,
// while a full round takes about a minute. `after` keeps running up to this limit
// (Vercel Hobby's maximum).
export const maxDuration = 300;

// Só permite requisições GET
export async function GET(request: Request) {

  const authHeader = request.headers.get("authorization");

  if (!bearerTokenMatches(authHeader, process.env.CRON_SECRET, "CRON_SECRET")) {
    return new Response("Não autorizado", { status: 401 });
  }

  after(async () => {
    try {
      await runPriceCheckJob({ onPriceEvent: handlePriceEvent });
    } catch (error) {
      console.error("Erro no cron job:", error);
    }
  });

  return new Response("Verificação iniciada", { status: 200 });
}
