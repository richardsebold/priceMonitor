"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/actions/get-products-from-db";
import type { ProductHistory } from "../../generated/prisma/client";
import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NewProduct } from "@/actions/add-product";
import {
  Bell,
  ExternalLink,
  Eye,
  LoaderCircle,
  MoreVertical,
  Plus,
  Sigma,
  Trash,
} from "lucide-react";
import { deleteProduct } from "@/actions/delete-product";
import { toast } from "sonner";
// import TestPage from "./button-teste-api";
import { ChartAreaInteractive } from "./chart-area-interactive";
import { Card } from "./ui/card";
import { SectionCards } from "./section-cards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import EditTask from "./EditURL";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface DashboardClientProps {
  planLimit: number;
}

export function DashboardClient({ planLimit }: DashboardClientProps) {
  const [productList, setProductList] = useState<ProductHistory[]>([]);
  const [url, setUrl] = useState<string>("");
  const [priceTarget, setPriceTarget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const isLimitReached = productList.length >= planLimit;

  async function handleGetProduct() {
    try {
      const products = await getProducts();

      if (products && products.length > 0) {
        setProductList(products);
        setExpandedItemId(products[0].id);
      } else {
        setProductList([]);
        setExpandedItemId(null);
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
    }
  }

  useEffect(() => {
    handleGetProduct();
  }, []);

  const handleAddProduct = async () => {
    setLoading(true);

    try {
      if (!url.trim()) {
        toast.error("Insira um URL");
        return;
      }

      if (productList.some((item) => item.url === url)) {
        toast.warning("Produto já cadastrado!");
        return;
      }

      const parsedPriceTarget = Number(priceTarget);

      if (parsedPriceTarget !== undefined && Number.isNaN(parsedPriceTarget)) {
        toast.error("Valor inválido");
        return;
      }

      const myNewProduct = await NewProduct(url, parsedPriceTarget);

      if (!myNewProduct) return;

      setUrl("");
      setPriceTarget("");

      await handleGetProduct();

      toast.success("Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      toast.error("Erro ao adicionar produto!");
    } finally {
      setLoading(false);
    }
  };

  async function handleDeleteProduct(id: string) {
    try {
      const deletedProduct = await deleteProduct(id);
      if (!deletedProduct) return;

      await handleGetProduct();
      toast.warning("Produto deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  }

  function toggleHistory(id: string) {
    setExpandedItemId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="container mx-auto">
      <div className="mx-4 md:mx-0 mt-12">
        <SectionCards />
        
        <div className="flex justify-center items-center">
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="px-6 py-6 cursor-pointer" disabled={isLimitReached}>
              <Plus className="h-4 w-4" />
              <span>CADASTRAR PRODUTO</span>
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
                onClick={handleAddProduct}
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
        
        <div className="ounded-2xl w-full mt-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Últimas Atualizações</h2>
            {isLimitReached && (
              <Badge className="ml-4 px-3 p-4 text-sm bg-red-500 rounded-full">
                Limite de plano atingido
              </Badge>
            )}
            <div className="flex items-center">
              <Sigma className="mr-2" />
              <p className="justify-end">
                {productList.length} / {planLimit} produtos monitorados
              </p>
            </div>
          </div>

          <Card className="grid gap-4 px-4 py-4">
            {productList.length === 0 ? (
              <div className="text-center py-10 text-slate-500 rounded-xl border border-slate-800">
                Nenhum dado carregado.
              </div>
            ) : (
              productList.map((item) => {
                const price = item.price || 0;
                const target = item.priceTarget || 0;
                const percentDiff =
                  target > 0
                    ? (((price - target) / target) * 100).toFixed(1)
                    : 0;
                const isAboveTarget = price > target;
                const isExpanded = expandedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors group flex flex-col overflow-hidden"
                  >
                    <div className="p-5 flex items-start gap-5">
                      <div className="shrink-0">
                        <div className="w-20 h-20 rounded-lg p-1 overflow-hidden flex items-center justify-center">
                          <Image
                            src={item.image as string}
                            alt={item.name as string}
                            width={80}
                            height={80}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate pr-8">
                          {item.name || "Produto sem nome"}
                        </h3>

                        <div className="flex gap-2 items-center mt-1.5">
                          <span className="text-blue-500 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-slate-500/20 underline">
                            <a href={item.url} target="_blank" rel="noreferrer">
                              {item.store || "Sem loja"}
                            </a>
                          </span>
                          <span className="text-emerald-400 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            Em estoque
                          </span>
                        </div>

                        <div className="mt-3">
                          <p className="text-2xl font-bold tracking-tight">
                            {item.currency === "BRL" ? "R$ " : ""}
                            {item.price?.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            }) ?? "---"}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            {isAboveTarget ? (
                              <span className="text-red-400 text-xs font-medium">
                                ↗ {percentDiff}%
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-xs font-medium">
                                ↘ {Math.abs(Number(percentDiff))}%
                              </span>
                            )}
                            <span className="text-slate-500 text-xs">
                              Alvo: R${" "}
                              {item.priceTarget?.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              }) ?? "---"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-md transition-colors cursor-pointer">
                              <MoreVertical size={20} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 text-slate-300"
                          >
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => toggleHistory(item.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />{" "}
                              {isExpanded
                                ? "Ocultar histórico"
                                : "Ver histórico"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <EditTask
                                product={item}
                                handleGetProduct={handleGetProduct}
                              />
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => window.open(item.url, "_blank")}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" /> Abrir
                              loja
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-400 hover:bg-red-400/10 hover:text-red-300 cursor-pointer"
                              onClick={() => handleDeleteProduct(item.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {isAboveTarget && (
                          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[11px] font-semibold px-2.5 py-1 rounded-md mt-4">
                            <Bell size={12} />
                            <span>{percentDiff}% acima</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2">
                        <ChartAreaInteractive productId={item.id} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        </div>

        {/* <TestPage /> */}
      </div>
    </div>
  );
}
