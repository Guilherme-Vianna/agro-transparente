import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/authorization"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SearchInput } from "@/components/search-input"
import { SelectFilter } from "@/components/select-filter"
import { PaginationBar } from "@/components/ui/pagination-bar"

const PAGE_SIZE = 25

const ACAO_LABEL: Record<string, string> = {
  criar: "Criação",
  atualizar: "Atualização",
  excluir: "Exclusão",
  login: "Login",
  logout: "Logout",
  login_falhou: "Login falhou",
}

const ACAO_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  criar: "default",
  atualizar: "secondary",
  excluir: "destructive",
  login: "outline",
  logout: "outline",
  login_falhou: "destructive",
}

const ENTIDADE_LABEL: Record<string, string> = {
  auth: "Autenticação",
  empresa: "Empresa",
  produto: "Produto",
  producao: "Lote de produção",
  aplicacao: "Aplicação",
  usuario: "Usuário",
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; acao?: string; entidade?: string; page?: string }>
}) {
  await requireAdmin()

  const { q, acao, entidade, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const where = {
    ...(q ? { usuarioEmail: { contains: q, mode: "insensitive" as const } } : {}),
    ...(acao ? { acao } : {}),
    ...(entidade ? { entidade } : {}),
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (acao) params.set("acao", acao)
    if (entidade) params.set("entidade", entidade)
    if (targetPage > 1) params.set("page", String(targetPage))
    const qs = params.toString()
    return qs ? `/logs?${qs}` : "/logs"
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Logs de auditoria</h1>
        <p className="text-muted-foreground">
          Histórico de operações realizadas no sistema, incluindo login, criações e alterações.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Buscar por email..." />
        <SelectFilter
          paramKey="acao"
          placeholder="Todas as ações"
          options={Object.entries(ACAO_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <SelectFilter
          paramKey="entidade"
          placeholder="Todas as entidades"
          options={Object.entries(ENTIDADE_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  }).format(log.createdAt)}
                </TableCell>
                <TableCell className="text-sm">{log.usuarioEmail ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={ACAO_VARIANT[log.acao] ?? "outline"}>
                    {ACAO_LABEL[log.acao] ?? log.acao}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {ENTIDADE_LABEL[log.entidade] ?? log.entidade}
                  {log.entidadeId ? ` #${log.entidadeId}` : ""}
                </TableCell>
                <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                  {log.detalhes ? JSON.stringify(log.detalhes) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar page={page} totalPages={totalPages} total={total} buildHref={buildHref} />
    </div>
  )
}
