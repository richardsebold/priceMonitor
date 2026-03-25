import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Input } from "./ui/input";




export default function TooltipAddProduct() {
  return (
    <div>
      <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button className="flex items-center justify-center p-2 rounded-md transition-all cursor-pointer">
                      <Plus className="h-5 w-5" />
                      <span className="sr-only">Adicionar Produto</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>

                <TooltipContent side="right">Adicionar Produto</TooltipContent>
              </Tooltip>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar tarefa</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2">
                  <Input placeholder="Editar tarefa" />
                  <Button className="cursor-pointer">Editar</Button>
                </div>
              </DialogContent>
            </Dialog>

    </div>
  )
}
