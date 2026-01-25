import { Card } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-lg p-6 shadow-lg">

        <Field>
          <FieldLabel htmlFor="input-product">Produto que deseja rastrear </FieldLabel>
          <Input id="input-product" type="text" placeholder="..." />
          <FieldDescription>
            Digite o produto que deseja rastrear o preço
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="input">
            Loja que deseja rastrear preço
          </FieldLabel>
          <Select>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Lojas</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <FieldDescription>
            Selecione qual loja deseja rastrear o preço
          </FieldDescription>
        </Field>
      </Card>
    </div>
  );
}
