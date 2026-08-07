import Link from "next/link"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { ProducaoForm } from "@/components/producao-form"
import { Button } from "@/components/ui/button"

export default async function NovaProducaoPage() {
  await requireSession()
  const empresaAtiva = await getEmpresaAtiva()

  if (!empresaAtiva) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <p>Selecione uma empresa antes de criar um lote.</p>
      </div>
    )
  }

  const produtos = await prisma.produto.findMany({
    where: { empresaId: empresaAtiva.id },
    orderBy: { nome: "asc" },
  })

  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-muted-foreground">
          Cadastre ao menos um produto antes de criar um lote de produção.
        </p>
        <Button asChild>
          <Link href="/produtos/novo">Cadastrar produto</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo lote de produção</h1>
        <p className="text-muted-foreground">
          Um QR code de rastreabilidade será gerado automaticamente ao salvar.
        </p>
      </div>
      <ProducaoForm produtos={produtos} />
    </div>
  )
}
