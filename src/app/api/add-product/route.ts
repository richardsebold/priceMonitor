import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NewProduct } from "@/actions/add-product";
import { getUser } from "@/actions/get-user";

const HACKER_PLAN_ID = "plano_hacker_mensal";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return json({ success: false, error: "Não autorizado." }, 401);
    }

    const user = await getUser();

    if (!user) {
      return json({ success: false, error: "Usuário não encontrado." }, 401);
    }

    if (user.planId !== HACKER_PLAN_ID) {
      return json(
        {
          success: false,
          error:
            "A extensão está disponível apenas para usuários do plano Hacker.",
        },
        403,
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ success: false, error: "JSON inválido." }, 400);
    }

    const { url, priceTarget } = (body ?? {}) as {
      url?: unknown;
      priceTarget?: unknown;
    };

    if (typeof url !== "string" || !url.trim()) {
      return json({ success: false, error: "URL é obrigatória." }, 400);
    }

    try {
      new URL(url);
    } catch {
      return json({ success: false, error: "URL inválida." }, 400);
    }

    const parsedTarget =
      priceTarget === undefined || priceTarget === null || priceTarget === ""
        ? 0
        : Number(priceTarget);

    if (Number.isNaN(parsedTarget) || parsedTarget < 0) {
      return json(
        { success: false, error: "Preço alvo inválido." },
        400,
      );
    }

    const result = await NewProduct(url, parsedTarget);

    if (!result) {
      return json(
        { success: false, error: "Não foi possível cadastrar o produto." },
        502,
      );
    }

    if ("success" in result && result.success === false) {
      return json(
        { success: false, error: result.error ?? "Falha ao cadastrar." },
        400,
      );
    }

    return json({ success: true, product: result }, 201);
  } catch (error) {
    console.error("Erro na extensão:", error);
    return json({ success: false, error: "Erro interno." }, 500);
  }
}