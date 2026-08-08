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
import { ConfirmDeleteButton } from "@/components/confirm-delete-button"
import { EmptyEmpresaState } from "@/components/empty-empresa-state"
import { ClickableTableRow } from "@/components/clickable-table-row"
import { StopPropagation } from "@/components/stop-propagation"
import { SearchInput } from "@/components/search-input"
import { SelectFilter } from "@/components/select-filter"
import { PaginationBar } from "@/components/ui/pagination-bar"
import { ImportCsvDialog } from "@/components/import-csv-dialog"
import { deleteProduto, importProdutosCsv, type ImportProdutoRow } from "@/actions/produto.actions"

const PAGE_SIZE = 10

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; page?: string }>
}) {
  const session = await requireSession()
  const empresaAtiva = await getEmpresaAtiva()

  if (!empresaAtiva) {
    return <EmptyEmpresaState isAdmin={session.user.isAdmin} />
  }

  const { q, categoria, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const where = {
    empresaId: empresaAtiva.id,
    ...(q ? { nome: { contains: q, mode: "insensitive" as const } } : {}),
    ...(categoria ? { categoria } : {}),
  }

  const [produtos, total, categorias] = await Promise.all([
    prisma.produto.findMany({
      where,
      orderBy: { nome: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.produto.count({ where }),
    prisma.produto.findMany({
      where: { empresaId: empresaAtiva.id, categoria: { not: null } },
      select: { categoria: true },
      distinct: ["categoria"],
      orderBy: { categoria: "asc" },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (categoria) params.set("categoria", categoria)
    if (targetPage > 1) params.set("page", String(targetPage))
    const qs = params.toString()
    return qs ? `/produtos?${qs}` : "/produtos"
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Produtos de {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/api/produtos/export">
              <Download /> Exportar CSV
            </a>
          </Button>
          <ImportCsvDialog<ImportProdutoRow>
            title="Importar produtos"
            description="Envie um arquivo CSV para criar produtos em lote."
            templateHint="Colunas esperadas: nome, categoria, descricao"
            action={importProdutosCsv.bind(null, empresaAtiva.id)}
          />
          <Button asChild>
            <Link href="/produtos/novo">
              <Plus /> Novo produto
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Buscar por nome..." />
        <SelectFilter
          paramKey="categoria"
          placeholder="Todas as categorias"
          options={categorias
            .filter((c) => c.categoria)
            .map((c) => ({ value: c.categoria as string, label: c.categoria as string }))}
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {q || categoria
                    ? "Nenhum produto encontrado para os filtros aplicados."
                    : "Nenhum produto cadastrado ainda."}
                </TableCell>
              </TableRow>
            )}
            {produtos.map((produto) => (
              <ClickableTableRow key={produto.id} href={`/produtos/${produto.id}`}>
                <TableCell className="font-medium">
                  <Link href={`/produtos/${produto.id}`} className="hover:underline">
                    {produto.nome}
                  </Link>
                </TableCell>
                <TableCell>{produto.categoria || "—"}</TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">
                  {produto.descricao || "—"}
                </TableCell>
                <TableCell>
                  <StopPropagation>
                    <ConfirmDeleteButton
                      title="Excluir produto"
                      description={`Tem certeza que deseja excluir "${produto.nome}"? Essa ação não pode ser desfeita.`}
                      action={deleteProduto.bind(null, produto.id)}
                    />
                  </StopPropagation>
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={page} totalPages={totalPages} total={total} buildHref={buildHref} />
    </div>
  )
}
