import Link from "next/link"
import { Download, Plus } from "lucide-react"
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
import { ClickableTableRow } from "@/components/clickable-table-row"
import { SearchInput } from "@/components/search-input"
import { SelectFilter } from "@/components/select-filter"
import { PaginationBar } from "@/components/ui/pagination-bar"
import { ImportCsvDialog } from "@/components/import-csv-dialog"
import { importProducoesCsv, type ImportProducaoRow } from "@/actions/producao.actions"
import { formatDate } from "@/lib/date"

const PAGE_SIZE = 10

export default async function ProducoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; produtoId?: string; page?: string }>
}) {
  const session = await requireSession()
  const empresaAtiva = await getEmpresaAtiva()

  if (!empresaAtiva) {
    return <EmptyEmpresaState isAdmin={session.user.isAdmin} />
  }

  const { q, produtoId, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const where = {
    produto: { empresaId: empresaAtiva.id },
    ...(q ? { numeroLote: { contains: q, mode: "insensitive" as const } } : {}),
    ...(produtoId ? { produtoId: Number(produtoId) } : {}),
  }

  const [lotes, total, produtos] = await Promise.all([
    prisma.producao.findMany({
      where,
      include: { produto: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.producao.count({ where }),
    prisma.produto.findMany({
      where: { empresaId: empresaAtiva.id },
      orderBy: { nome: "asc" },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (produtoId) params.set("produtoId", produtoId)
    if (targetPage > 1) params.set("page", String(targetPage))
    const qs = params.toString()
    return qs ? `/producoes?${qs}` : "/producoes"
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lotes de produção</h1>
          <p className="text-muted-foreground">
            Lotes de {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/api/producoes/export">
              <Download /> Exportar CSV
            </a>
          </Button>
          <ImportCsvDialog<ImportProducaoRow>
            title="Importar lotes de produção"
            description="Envie um arquivo CSV para criar lotes em lote. O produto deve já existir e o nome deve ser idêntico."
            templateHint="Colunas esperadas: numeroLote, produto, dataPlantio, dataColheita"
            action={importProducoesCsv.bind(null, empresaAtiva.id)}
          />
          <Button asChild>
            <Link href="/producoes/nova">
              <Plus /> Novo lote
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Buscar por número do lote..." />
        <SelectFilter
          paramKey="produtoId"
          placeholder="Todos os produtos"
          options={produtos.map((p) => ({ value: String(p.id), label: p.nome }))}
        />
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
                  {q || produtoId
                    ? "Nenhum lote encontrado para os filtros aplicados."
                    : "Nenhum lote cadastrado ainda."}
                </TableCell>
              </TableRow>
            )}
            {lotes.map((lote) => (
              <ClickableTableRow key={lote.id} href={`/producoes/${lote.id}`}>
                <TableCell className="font-medium">
                  <Link href={`/producoes/${lote.id}`} className="hover:underline">
                    {lote.numeroLote}
                  </Link>
                </TableCell>
                <TableCell>{lote.produto.nome}</TableCell>
                <TableCell>{formatDate(lote.dataPlantio)}</TableCell>
                <TableCell>{formatDate(lote.dataColheita)}</TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={page} totalPages={totalPages} total={total} buildHref={buildHref} />
    </div>
  )
}
