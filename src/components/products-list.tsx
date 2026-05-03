"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Check,
  ExternalLink,
  Eye,
  LoaderCircle,
  MoreVertical,
  Package,
  Plus,
  Search,
  Sigma,
  Trash,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { NewProduct } from "@/actions/add-product";
import { deleteProduct } from "@/actions/delete-product";
import { getProductsListWithHistory } from "@/actions/get-products-list";
import { ChartAreaInteractive } from "./chart-area-interactive";
import EditTask from "./EditURL";

type Product = Awaited<ReturnType<typeof getProductsListWithHistory>>[number];

interface ProductsListProps {
  initialProducts: Product[];
  planLimit: number;
}

// Proporções exatas para: Produto | Preço | Variação | Meta | Ações
// Substitua a linha do GRID_COLS por esta:
const GRID_COLS = "minmax(0, 2.5fr) minmax(0, 1.2fr) 120px 110px 40px";

const formatBRL = (n: number | null | undefined) =>
  n == null
    ? "—"
    : n.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

function getDomain(url: string | null | undefined) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function deriveStats(p: Product) {
  const target = p.priceTarget || 0;
  const absDiff = target > 0 ? target - p.price : 0;
  const variation = target > 0 ? ((target - p.price) / target) * 100 : 0;
  const isAboveTarget = p.price > target;

  return {
    target,
    absDiff,
    variation,
    isAboveTarget,
  };
}

function VariationBadge({
  value,
  absDiff,
  hasTarget,
  currency,
}: {
  value: number;
  absDiff: number;
  hasTarget: boolean;
  currency: string;
}) {
  if (!hasTarget) {
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-transparent px-2.5 py-1 text-[11px] font-medium text-zinc-500">
        sem meta
      </span>
    );
  }
  const abs = Math.abs(value);
  if (abs < 0.5) {
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-transparent px-2.5 py-1 text-[11px] font-medium text-zinc-500">
        na meta
      </span>
    );
  }
  const isBelowTarget = value > 0;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex cursor-default items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${
              isBelowTarget
                ? "border-[#a7ee47]/30 bg-transparent text-[#a7ee47]"
                : "border-red-500/30 bg-transparent text-red-400"
            }`}
          >
            {isBelowTarget ? "↓" : "↑"} {abs.toFixed(1)}%
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="tabular-nums">
            {isBelowTarget ? "abaixo da meta em " : "acima da meta em "}
            {currency}
            {formatBRL(Math.abs(absDiff))}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MetaStatus({ reached }: { reached: boolean }) {
  if (reached) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#a7ee47]">
        <Check className="size-3.5" /> Atingida
      </span>
    );
  }
  return <span className="text-xs text-zinc-500">Pendente</span>;
}

function ProductIcon({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="size-12 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 shrink-0">
        <Package className="size-5" />
      </div>
    );
  }
  return (
    <div className="size-12 rounded-lg bg-zinc-900/60 flex items-center justify-center overflow-hidden shrink-0 p-1">
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className="object-contain w-full h-full"
        unoptimized
      />
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div
      className="grid items-center gap-4 px-5 py-4 animate-pulse"
      style={{ gridTemplateColumns: GRID_COLS }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-12 rounded-lg bg-slate-800/50 shrink-0" />
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="h-4 bg-slate-800/50 rounded-md w-3/4" />
          <div className="h-3 bg-slate-800/50 rounded-md w-1/2" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-slate-800/50 rounded-md w-20" />
        <div className="h-3 bg-slate-800/50 rounded-md w-16" />
      </div>
      <div className="h-6 bg-slate-800/50 rounded-full w-16" />
      <div className="h-4 bg-slate-800/50 rounded-md w-20" />
      <div className="h-5 bg-slate-800/50 rounded-md w-5" />
    </div>
  );
}

interface ProductItemProps {
  product: Product;
  expanded: boolean;
  onToggleHistory: () => void;
  onDelete: () => void;
  onRefresh: () => Promise<void>;
}

function ProductItem({
  product,
  expanded,
  onToggleHistory,
  onDelete,
  onRefresh,
}: ProductItemProps) {
  const { variation, target, absDiff } = deriveStats(product);

  const domain = product.store || getDomain(product.url);
  const currency = product.currency === "BRL" ? "R$ " : "";

  return (
    <div className="flex flex-col overflow-hidden hover:bg-zinc-900/30 transition-colors">
      <div
        className="grid items-center gap-4 px-5 py-5" // <-- py-5 aumenta o espaçamento inferior e superior da linha
        style={{ gridTemplateColumns: GRID_COLS }}
      >
        {/* PRODUTO */}
        <div className="flex items-center gap-3 min-w-0">
          <ProductIcon
            src={(product.image as string | null) ?? null}
            alt={product.name ?? "Produto"}
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate text-zinc-200">
              {product.name || "Produto sem nome"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-500 hover:text-zinc-300 truncate block"
              >
                {domain || "Sem loja"}
              </a>
              <span className="text-[#a7ee47] text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#a7ee47]/20 shrink-0">
                Em estoque
              </span>
            </div>
          </div>
        </div>

        {/* PREÇO ATUAL */}
        <div className="min-w-0">
          <p className="font-semibold text-sm text-zinc-200">
            {currency}
            {formatBRL(product.price)}
          </p>
          {target > 0 ? (
            <p className="text-xs text-zinc-500">
              Meta: {currency}
              {formatBRL(target)}
            </p>
          ) : (
            <p className="text-xs text-zinc-700">Sem meta</p>
          )}
        </div>

        {/* VARIAÇÃO (vs meta) */}
        <div className="justify-self-start">
          <VariationBadge
            value={variation}
            absDiff={absDiff}
            hasTarget={target > 0}
            currency={currency}
          />
        </div>

        {/* META */}
        <div>
          <MetaStatus reached={product.targetReached} />
        </div>

        {/* AÇÕES */}
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-md transition-colors cursor-pointer text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
                aria-label="Mais opções"
              >
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-slate-300">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={onToggleHistory}
              >
                <Eye className="mr-2 h-4 w-4" />
                {expanded ? "Ocultar histórico" : "Ver histórico"}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <EditTask product={product} handleGetProduct={onRefresh} />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => window.open(product.url, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Abrir loja
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-400 hover:bg-red-400/10 hover:text-red-300 cursor-pointer"
                onClick={onDelete}
              >
                <Trash className="mr-2 h-4 w-4" /> Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2">
          <ChartAreaInteractive productId={product.id} />
        </div>
      )}
    </div>
  );
}

export function ProductsList({
  initialProducts,
  planLimit,
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [priceTarget, setPriceTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const isLimitReached = products.length >= planLimit;

  async function refresh() {
    setIsRefreshing(true);
    try {
      const data = await getProductsListWithHistory();
      setProducts(data);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        (p.name?.toLowerCase().includes(q) ?? false) ||
        (p.store?.toLowerCase().includes(q) ?? false) ||
        (p.url?.toLowerCase().includes(q) ?? false),
    );
  }, [products, query]);

  async function handleAdd() {
    if (!url.trim()) {
      toast.error("Insira uma URL.");
      return;
    }
    if (products.some((p) => p.url === url)) {
      toast.warning("Produto já cadastrado!");
      return;
    }
    const parsed = Number(priceTarget);
    if (priceTarget && Number.isNaN(parsed)) {
      toast.error("Valor inválido.");
      return;
    }

    setLoading(true);
    try {
      const created = await NewProduct(url, parsed);
      if (!created) {
        toast.error("Não foi possível cadastrar.");
        return;
      }
      setUrl("");
      setPriceTarget("");
      await refresh();
      toast.success("Produto adicionado!");
    } catch (err) {
      console.error("Erro:", err);
      toast.error("Erro ao adicionar produto!");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      await refresh();
      toast.warning("Produto removido.");
    } catch (err) {
      console.error("Erro:", err);
    }
  }

  function toggleHistory(id: string) {
    setExpandedItemId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="container mx-auto">
      <div className="mx-4 md:mx-0 mt-12">
        <div className="rounded-2xl w-full mt-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold">
              {products.length} {products.length === 1 ? "Produto" : "Produtos"}
            </h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
                <Input
                  placeholder="Buscar produto"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                <Sigma className="mr-2 h-4 w-4" />
                <span>
                  {products.length} / {planLimit} monitorados
                </span>
              </div>

              {isLimitReached && (
                <Badge className="px-3 py-1 text-sm bg-red-500 rounded-full">
                  Limite atingido
                </Badge>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="cursor-pointer w-full sm:w-auto"
                    disabled={isLimitReached}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    CADASTRAR PRODUTO
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Produto</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 mt-4">
                    <Input
                      placeholder="Insira a URL do produto"
                      disabled={isLimitReached}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isLimitReached}
                      placeholder="Insira o valor desejado"
                      value={priceTarget}
                      onChange={(e) => setPriceTarget(e.target.value)}
                    />
                    <DialogClose asChild>
                      <Button
                        onClick={handleAdd}
                        disabled={loading || isLimitReached}
                        className="w-full cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            <span>Cadastrando...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Cadastrar</span>
                          </>
                        )}
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="overflow-hidden p-0 gap-0">
            <div
              className="grid items-center gap-4 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-zinc-500 border-b border-zinc-800/80"
              style={{ gridTemplateColumns: GRID_COLS }}
            >
              <div>Produto</div>
              <div>Preço atual</div>
              <div>Variação</div>
              <div>Meta</div>
              <div></div>
            </div>

            {isRefreshing ? (
              <div className="divide-y divide-zinc-800/60">
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                {query
                  ? "Nenhum produto encontrado para essa busca."
                  : "Nenhum produto monitorado ainda. Clique em Cadastrar para começar."}
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {filtered.map((p) => (
                  <ProductItem
                    key={p.id}
                    product={p}
                    expanded={expandedItemId === p.id}
                    onToggleHistory={() => toggleHistory(p.id)}
                    onDelete={() => handleDelete(p.id)}
                    onRefresh={refresh}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
