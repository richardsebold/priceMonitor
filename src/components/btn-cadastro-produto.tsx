"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { NewProduct } from "@/actions/add-product";

export default function TooltipAddProduct() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [priceTarget, setPriceTarget] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!url.trim()) {
      toast.error("Insira uma URL.");
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
      if ("success" in created && created.success === false) {
        toast.error(created.error ?? "Não foi possível cadastrar.");
        return;
      }
      setUrl("");
      setPriceTarget("");
      setOpen(false);
      router.refresh();
      toast.success("Produto adicionado!");
    } catch (err) {
      console.error("Erro:", err);
      toast.error("Erro ao adicionar produto!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="h-9 w-9 rounded-lg cursor-pointer"
              aria-label="Adicionar Produto"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Adicionar Produto</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Adicionar Produto</TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Produto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Input
            placeholder="Insira a URL do produto"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Insira o valor desejado"
            value={priceTarget}
            onChange={(e) => setPriceTarget(e.target.value)}
          />
          <Button
            onClick={handleAdd}
            disabled={loading}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
