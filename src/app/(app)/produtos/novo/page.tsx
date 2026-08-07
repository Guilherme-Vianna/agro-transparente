import { redirect } from "next/navigation"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { ProdutoForm } from "@/components/produto-form"

export default async function NovoProdutoPage() {
  await requireSession()
  const empresaAtiva = await getEmpresaAtiva()
  if (!empresaAtiva) redirect("/produtos")

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo produto</h1>
        <p className="text-muted-foreground">
          Cadastre um novo produto para {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}.
        </p>
      </div>
      <ProdutoForm empresaId={empresaAtiva.id} />
    </div>
  )
}
