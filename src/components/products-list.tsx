"use client";

import { useId, useMemo, useState } from "react";
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

const GRID_COLS =
  "minmax(0, 2.4fr) 150px minmax(0, 1fr) 110px 110px 40px";

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
  const historyPrices = (p.history ?? []).map((h) => h.price);
  const allPrices = [...historyPrices, p.price];
  const maxPrice = Math.max(...allPrices);
  const oldPrice = maxPrice > p.price ? maxPrice : null;
  const variation = maxPrice > 0 ? ((maxPrice - p.price) / maxPrice) * 100 : 0;

  const sparklinePoints =
    historyPrices.length >= 2 ? historyPrices : [...historyPrices, p.price];

  const target = p.priceTarget || 0;
  const percentDiff = target > 0 ? ((p.price - target) / target) * 100 : 0;
  const isAboveTarget = p.price > target;

  return {
    sparklinePoints,
    oldPrice,
    variation,
    target,
    percentDiff,
    isAboveTarget,
  };
}

function Sparkline({ points }: { points: number[] }) {
  const rawId = useId();
  const gradId = `spark-${rawId.replace(/:/g, "")}`;

  const W = 120;
  const H = 32;
  const PAD = 3;

  if (points.length < 2) {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <line
          x1="0"
          y1={H / 2}
          x2={W}
          y2={H / 2}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeDasharray="2 4"
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = (W - 2) / (points.length - 1);

  const coords = points.map(
    (v, i) =>
      [1 + i * step, PAD + (1 - (v - min) / range) * (H - PAD * 2)] as const,
  );

  const linePath =
    "M " +
    coords.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ");
  const areaPath = `${linePath} L ${W - 1} ${H} L 1 ${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84e620" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#84e620" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="#84e620"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VariationBadge({ value }: { value: number }) {
  const abs = Math.abs(value);
  if (abs < 0.5) {
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400">
        ~ 0%
      </span>
    );
  }
  const isDown = value > 0;
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium",
        isDown
          ? "border-[#84e620]/30 bg-[#84e620]/10 text-[#a7ee47]"
          : "border-red-500/30 bg-red-500/10 text-red-400",
      ].join(" ")}
    >
      {isDown ? "↓" : "↑"} {abs.toFixed(0)}%
    </span>
  );
}

function MetaStatus({ reached }: { reached: boolean }) {
  if (reached) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#a7ee47]">
        <Check className="size-3.5" /> meta atingida
      </span>
    );
  }
  return <span className="text-xs text-zinc-500">meta pendente</span>;
}

function ProductIcon({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
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
      <div className="h-8 bg-slate-800/50 rounded-md" />
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
  const { sparklinePoints, variation, target } = deriveStats(product);
  const currency = product.currency === "BRL" ? "R$ " : "";
  const domain = product.store || getDomain(product.url);

  return (
    <div className="flex flex-col overflow-hidden hover:bg-zinc-900/30 transition-colors">
      <div
        className="grid items-center gap-4 px-5 py-4"
        style={{ gridTemplateColumns: GRID_COLS }}
      >
        {/* PRODUTO */}
        <div className="flex items-center gap-3 min-w-0">
          <ProductIcon
            src={(product.image as string | null) ?? null}
            alt={product.name ?? "Produto"}
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {product.name || "Produto sem nome"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-500 underline decoration-dotted underline-offset-2 truncate hover:text-blue-400"
              >
                {domain || "Sem loja"}
              </a>
              <span className="text-[#5a9600] text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#345400]/20 shrink-0">
                Em estoque
              </span>
            </div>
          </div>
        </div>

        {/* PREÇO ATUAL */}
        <div className="min-w-0">
          <p className="font-semibold text-sm">
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

        {/* HISTÓRICO (30D) */}
        <div className="text-zinc-500">
          <Sparkline points={sparklinePoints} />
        </div>

        {/* VARIAÇÃO */}
        <div>
          <VariationBadge value={variation} />
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
                className="p-1 rounded-md transition-colors cursor-pointer hover:bg-zinc-800/60"
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

export function ProductsList({ initialProducts, planLimit }: ProductsListProps) {
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
              {products.length}{" "}
              {products.length === 1 ? "produto" : "produtos"}
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
              <div>Histórico (30D)</div>
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
