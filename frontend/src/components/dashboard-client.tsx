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
  const [product, setProduct] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleGetProduct() {
    try {
      const products = await getProducts();
      if (products) {
        setProductList(products);
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
    }
  }

  useEffect(() => {
    (async () => {
      await handleGetProduct();
    })();
  }, []);

  const handleAddProduct = async () => {
    setLoading(true);

    try {
      if (product.length === 0 || !product) {
        toast.error("Insira um URL");
        setLoading(false);
        return;
      }

      const myNewProduct = await NewProduct(product);

      if (!myNewProduct) return;

      setProduct("");

      await handleGetProduct();

      toast.success("Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar:", error);
    }

    setLoading(false);
  };

  async function handleDeleteProduct(id: string) {
    try {
      if (id.length === 0 || !id) return;

      const deletedProduct = await deleteProduct(id);

      if (!deletedProduct) return;

      await handleGetProduct();

      toast.warning("Produto deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar:", error);
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
          onChange={(e) => setProduct(e.target.value)}
          value={product}
        />
        <Button className="cursor-pointer" onClick={handleAddProduct}>
          {loading ? <LoaderCircle className="animate-spin" /> : <Plus />}
          Cadastrar
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {productList.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded shadow">
            Nenhum dado carregado. Clique no botão acima.
          </div>
        ) : (
          productList.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-bold text-lg text-gray-800">
                    {item.name || "Produto sem nome"}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    className="text-blue-600 text-sm hover:underline block truncate max-w-xl"
                  >
                    {item.url}
                  </a>
                </div>
                <div>
                  <Image
                    src={item.image as string}
                    alt={item.name as string}
                    className="w-16 h-16 object-cover rounded-md"
                    width={100}
                    height={100}
                  />
                </div>

                <div className="text-right">
                  {item.currency === "BRL" ? (
                    <p className="text-2xl font-bold text-green-600 gap-2">
                      R$ {item.price || "---"}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      {item.price || "---"}
                    </p>
                  )}

                  {item.currency ? (
                    <p className="text-xs text-gray-400">{item.currency}</p>
                  ) : (
                    <p className="text-xs text-gray-400">Sem informação</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Trash
                  className="cursor-pointer hover:text-red-600 transition-all hover:scale-110 duration-200"
                  size={25}
                  onClick={() => handleDeleteProduct(item.id)}
                />

                <EditURL product={item} handleGetProduct={handleGetProduct} />
              </div>

              <div className="mt-4 text-xs text-gray-400 border-t pt-2 flex gap-4">
                <span>
                  Extraído em:{" "}
                  {item.scrapedAt
                    ? new Date(item.scrapedAt).toLocaleString()
                    : "-"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
