import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="bg-muted/30 p-6 rounded-full mb-8">
        <FileQuestion className="w-16 h-16 text-muted-foreground" />
      </div>
      
      <h1 className="text-6xl font-bold tracking-tight mb-4 text-primary">404</h1>
      
      <h2 className="text-2xl font-semibold mb-3">Página não encontrada</h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        Desculpe, não conseguimos encontrar a página que você está procurando. Ela pode ter sido movida, excluída ou talvez nunca tenha existido.
      </p>
      
      <Button asChild size="lg" className="font-semibold">
        <Link href="/dashboard">
          Voltar para o Início
        </Link>
      </Button>
    </div>
  )
}