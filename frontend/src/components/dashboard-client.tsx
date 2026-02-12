"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/actions/get-products-from-db";
import type { ProductHistory } from "../../generated/prisma/client";
import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NewProduct } from "@/actions/add-product";
import { LoaderCircle, Plus, Trash } from "lucide-react";
import { deleteProduct } from "@/actions/delete-product";
import { toast } from "sonner";
import EditURL from "./EditURL";

export function DashboardClient() {
  const [productList, setProductList] = useState<ProductHistory[]>([]);
  const [url, setUrl] = useState<string>("");

  // ✅ sempre string no input
  const [priceTarget, setPriceTarget] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  async function handleGetProduct() {
    try {
      const products = await getProducts();
      if (products) setProductList(products);
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

      if (
        parsedPriceTarget !== undefined &&
        Number.isNaN(parsedPriceTarget)
      ) {
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

  return (
    <div className="container mx-auto px-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Histórico de Monitoramento
      </h2>

      <div className="flex gap-4">
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

        <Button onClick={handleAddProduct} disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="animate-spin" />
              <span>Cadastrando...</span>
            </>
          ) : (
            <>
              <Plus />
              <span>Cadastrar</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {productList.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded shadow">
            Nenhum dado carregado.
          </div>
        ) : (
          productList.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">
                    {item.name || "Produto sem nome"}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    className="text-blue-600 text-sm truncate block max-w-xl"
                  >
                    {item.url}
                  </a>
                </div>

                <Image
                  src={item.image as string}
                  alt={item.name as string}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {item.currency === "BRL" ? "R$ " : ""}
                    {item.price ?? "---"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.currency || "Sem informação"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center mt-4">
                <Trash
                  size={24}
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => handleDeleteProduct(item.id)}
                />
                <EditURL
                  product={item}
                  handleGetProduct={handleGetProduct}
                />
              </div>

              <div className="mt-4 text-xs text-gray-400 border-t pt-2">
                Extraído em:{" "}
                {item.scrapedAt
                  ? new Date(item.scrapedAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}