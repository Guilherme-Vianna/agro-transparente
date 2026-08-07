import { notFound } from "next/navigation"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { ProducaoForm } from "@/components/producao-form"

export default async function EditarProducaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const producao = await prisma.producao.findUnique({
    where: { id: Number(id) },
    include: { produto: true },
  })
  if (!producao) notFound()

  await requireEmpresaAccess(producao.produto.empresaId)

  const produtos = await prisma.produto.findMany({
    where: { empresaId: producao.produto.empresaId },
    orderBy: { nome: "asc" },
  })

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar lote</h1>
        <p className="text-muted-foreground">{producao.numeroLote}</p>
      </div>
      <ProducaoForm
        produtos={produtos}
        producao={{
          id: producao.id,
          produtoId: producao.produtoId,
          numeroLote: producao.numeroLote,
          dataPlantio: producao.dataPlantio,
          dataColheita: producao.dataColheita,
        }}
      />
    </div>
  )
}
