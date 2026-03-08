import { NextResponse } from "next/server";
import { runPriceCheckJob } from "@/actions/check-prices";

// Só permite requisições GET
export async function GET(request: Request) {

  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  runPriceCheckJob();

  return NextResponse.json({ message: "Job iniciado com sucesso!" });
}
