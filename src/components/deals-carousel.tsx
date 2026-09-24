"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ExternalLink, LoaderCircle, Plus } from "lucide-react";
import type { DealItem } from "@/modules/analytics/actions/get-deals";
import { formatDealBadge } from "@/modules/analytics/domain/deals";
import { NewProduct } from "@/modules/price-tracking/actions/add-product";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";

interface DealsCarouselProps {
  deals: DealItem[];
  onProductAdded: () => Promise<void>;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function DealsCarousel({ deals, onProductAdded }: DealsCarouselProps) {
  const [trackedIds, setTrackedIds] = useState<Set<string>>(
    () => new Set(deals.filter((deal) => deal.alreadyTracked).map((deal) => deal.id)),
  );
  const [selected, setSelected] = useState<DealItem | null>(null);
  const [priceTarget, setPriceTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  if (deals.length === 0) return null;

  function openDialog(deal: DealItem) {
    setSelected(deal);
    setPriceTarget("");
    setLimitError(null);
  }

  async function handleTrack() {
    if (!selected) return;
    const parsed = Number(priceTarget);
    if (priceTarget && Number.isNaN(parsed)) {
      toast.error("Valor inválido.");
      return;
    }

    setLoading(true);
    setLimitError(null);
    try {
      const created = await NewProduct(selected.url, parsed, { addedFrom: "carousel" });
      const isErrorResponse =
        typeof created === "object" &&
        created !== null &&
        "success" in created &&
        created.success === false;

      if (!created || isErrorResponse) {
        const message =
          isErrorResponse && "error" in created
            ? created.error
            : "Não foi possível rastrear este produto.";
        if (message.includes("limite")) {
          setLimitError(message);
        } else {
          toast.error(message);
        }
        return;
      }

      setTrackedIds((prev) => new Set(prev).add(selected.id));
      setSelected(null);
      toast.success("Produto adicionado!");
      await onProductAdded();
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      toast.error("Erro ao adicionar produto!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="deals-title" className="mb-12">
      <h2 id="deals-title" className="text-xl font-bold mb-6">
        Ofertas em destaque
      </h2>

      <Carousel opts={{ align: "start" }} className="mx-10">
        <CarouselContent>
          {deals.map((deal) => {
            const tracked = trackedIds.has(deal.id);
            return (
              <CarouselItem key={deal.id} className="sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card className="h-full gap-3 px-4 py-4">
                  <div className="relative h-36 w-full rounded-lg bg-white">
                    {deal.image && (
                      <Image
                        src={deal.image}
                        alt={deal.name ?? "Produto"}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  <Badge className="w-fit bg-emerald-600 text-white">
                    {formatDealBadge(deal.discount)}
                  </Badge>
                  <p className="line-clamp-2 text-sm font-medium" title={deal.name ?? undefined}>
                    {deal.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{deal.store}</p>
                  <p className="text-lg font-semibold tabular-nums">{brl.format(deal.price)}</p>
                  <div className="mt-auto flex flex-col gap-2">
                    {tracked ? (
                      <Badge variant="secondary" className="w-full justify-center py-2">
                        <Check className="mr-1 h-4 w-4" />
                        Já monitorado
                      </Badge>
                    ) : (
                      <Button className="w-full cursor-pointer" onClick={() => openDialog(deal)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Monitorar
                      </Button>
                    )}
                    <Button asChild variant="outline" className="w-full">
                      <a href={deal.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver na loja
                      </a>
                    </Button>
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monitorar produto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Input aria-label="URL do produto" value={selected?.url ?? ""} readOnly />
            <Input
              type="number"
              step="0.01"
              placeholder="Insira o valor desejado"
              value={priceTarget}
              onChange={(e) => setPriceTarget(e.target.value)}
            />
            {limitError && (
              <p className="text-sm text-red-500">
                {limitError}{" "}
                <Link href="/planos" className="font-medium underline">
                  Ver planos
                </Link>
              </p>
            )}
            <Button onClick={handleTrack} disabled={loading} className="w-full cursor-pointer">
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Monitorar</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
