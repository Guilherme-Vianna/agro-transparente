import Link from "next/link"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyEmpresaState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <Building2 className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Nenhuma empresa disponível</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isAdmin
          ? "Cadastre uma empresa para começar a gerenciar produtos e lotes."
          : "Você ainda não está vinculado a nenhuma empresa. Fale com um administrador."}
      </p>
      {isAdmin && (
        <Button asChild>
          <Link href="/empresas/nova">Cadastrar empresa</Link>
        </Button>
      )}
    </div>
  )
}
