import { sendWeeklySummaries } from "@/modules/alerting/application/send-weekly-summaries";

// Só permite requisições GET
export async function GET(request: Request) {

  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Não autorizado", { status: 401 });
  }
  try {
    await sendWeeklySummaries();
    return new Response("Resumo semanal concluído com sucesso!", { status: 200 });
  } catch (error) {
    console.error("Erro no cron de resumo semanal:", error);
    return new Response("Erro interno", { status: 500 });
  }

}
