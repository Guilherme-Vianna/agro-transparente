import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyEmpresaState } from "@/components/empty-empresa-state"
import { formatDate } from "@/lib/date"

export default async function ProducoesPage() {
  const session = await requireSession()
  const empresaAtiva = await getEmpresaAtiva()

  if (!empresaAtiva) {
    return <EmptyEmpresaState isAdmin={session.user.isAdmin} />
  }

  const lotes = await prisma.producao.findMany({
    where: { produto: { empresaId: empresaAtiva.id } },
    include: { produto: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lotes de produção</h1>
          <p className="text-muted-foreground">
            Lotes de {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}.
          </p>
        </div>
        <Button asChild>
          <Link href="/producoes/nova">
            <Plus /> Novo lote
          </Link>
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Plantio</TableHead>
              <TableHead>Colheita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum lote cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
            {lotes.map((lote) => (
              <TableRow key={lote.id}>
                <TableCell className="font-medium">
                  <Link href={`/producoes/${lote.id}`} className="hover:underline">
                    {lote.numeroLote}
                  </Link>
                </TableCell>
                <TableCell>{lote.produto.nome}</TableCell>
                <TableCell>{formatDate(lote.dataPlantio)}</TableCell>
                <TableCell>{formatDate(lote.dataColheita)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
