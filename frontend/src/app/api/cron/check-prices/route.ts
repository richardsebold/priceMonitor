import { NextResponse } from "next/server";
import { runPriceCheckJob } from "@/actions/check-price";

// Só permite requisições GET
export async function GET(request: Request) {
  // SEGURANÇA: Garante que só o seu sistema de CRON possa chamar essa URL
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Não autorizado', { status: 401 });
  }

  runPriceCheckJob();

  return NextResponse.json({ message: "Job iniciado com sucesso!" });
}