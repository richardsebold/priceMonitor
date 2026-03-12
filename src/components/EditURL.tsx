import { SquarePen } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ProductHistory } from "../../generated/prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { editProduct } from "@/actions/edit-product";

type ProductProps = {
  product: ProductHistory;
  handleGetProduct: () => Promise<void>;
};

export default function EditTask({ product, handleGetProduct }: ProductProps) {
  const [editedProduct, setEditedProduct] = useState(product.url);

  async function handleEditProduct() {

  try {
    if (editedProduct.length === 0 || !editedProduct) return;

    if (editedProduct !== product.url) {
      toast.success("Produto editado com sucesso!");
    } else {
      toast.error("Produto não editado!");
      return;
    }

    await editProduct({
      idProduct: product.id,
      newProduct: editedProduct,
    });

    handleGetProduct();
  }
   catch (error) {
    console.error("Erro ao buscar:", error);
  }
}

  return (
    <Dialog>
      <DialogTrigger asChild>

        <div className="flex items-center w-full cursor-pointer">
          <SquarePen
            className="hover:text-blue-600 transition-all hover:scale-110 duration-200"
            size={20}
          />
          <span className="ml-4">Editar</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar URL</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Editar tarefa"
            value={editedProduct}
            onChange={(e) => setEditedProduct(e.target.value)}
          />

          <DialogClose asChild>
            <Button className="cursor-pointer" onClick={handleEditProduct}>
              Editar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
