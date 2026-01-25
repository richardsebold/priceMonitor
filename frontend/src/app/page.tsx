
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SquarePen, Trash, ListCheck, Sigma } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function Home() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 ">
      <Card className="w-lg shadow-lg mx-6">
        <CardHeader className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="input-product">
              Produto que deseja rastrear{" "}
            </FieldLabel>
            <Input id="input-product" type="text" placeholder="Digite o produto que deseja rastrear o preço" />
          </Field>
          <Button variant="default" className="cursor-pointer"> Adicionar </Button>
        </CardHeader>

        <CardContent>
          <Separator className="mb-4" />

           <div className="text-center text-gray-500" hidden={true}>
            Nenhum produto adicionado ainda. Adicione um produto para começar a rastrear os preços!
           </div>


          <div className="mt-4 border-b">

            <div className="h-14 flex justify-between items-center border-t">
              <div className="w-1 h-full bg-green-300"></div>
              <p className="flex-1 px-2 text-sm">Estudar React</p>
              <div className="flex gap-2 items-center">
                <Dialog>

                  <DialogTrigger asChild><SquarePen size={16} className="cursor-pointer" /></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle >Editar tarefa</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-2">
                      <Input placeholder="Editar tarefa" />
                      <Button className="cursor-pointer">Editar</Button>
                    </div>

                  </DialogContent>
                </Dialog>
                <Trash size={16} className="cursor-pointer" />
              </div>
            </div>

          </div>



          <div className="flex justify-between mt-4">
            <div className="flex gap-2 items-center">
              <ListCheck size={18} />
              <p className="text-xs">Tarefas concluidas</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="cursor-pointer text-xs h-7" variant={"outline"}><Trash />Limpar tarefas concluidas</Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja excluir X itens?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction>Continuar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>

          <div className="h-2 w-full bg-gray-100 mt-4 rounded-md">
            <div className="h-full bg-blue-500 rounded-md" style={{ width: "50%" }}> </div>
          </div>

          <div className="flex justify-end items-center mt-2 gap-2">
            <Sigma size={18} />
            <p className="text-xs">Buscas no total</p>
          </div>



        </CardContent>
      </Card>
    </div>
  );
}
