import { notFound } from "next/navigation"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { ProdutoForm } from "@/components/produto-form"

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const produto = await prisma.produto.findUnique({ where: { id: Number(id) } })
  if (!produto) notFound()

  await requireEmpresaAccess(produto.empresaId)

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar produto</h1>
        <p className="text-muted-foreground">{produto.nome}</p>
      </div>
      <ProdutoForm
        empresaId={produto.empresaId}
        produto={{
          id: produto.id,
          nome: produto.nome,
          categoria: produto.categoria ?? "",
          descricao: produto.descricao ?? "",
        }}
      />
    </div>
  )
}
