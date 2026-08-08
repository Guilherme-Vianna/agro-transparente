import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/authorization"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDeleteButton } from "@/components/confirm-delete-button"
import { ClickableTableRow } from "@/components/clickable-table-row"
import { StopPropagation } from "@/components/stop-propagation"
import { SearchInput } from "@/components/search-input"
import { SelectFilter } from "@/components/select-filter"
import { PaginationBar } from "@/components/ui/pagination-bar"
import { deleteUsuario } from "@/actions/usuario.actions"

const PAGE_SIZE = 10

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; perfil?: string; empresaId?: string; page?: string }>
}) {
  const session = await requireAdmin()

  const { q, perfil, empresaId, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const where = {
    ...(q ? { email: { contains: q, mode: "insensitive" as const } } : {}),
    ...(perfil === "admin" ? { isAdmin: true } : {}),
    ...(perfil === "usuario" ? { isAdmin: false } : {}),
    ...(empresaId ? { usuarioEmpresas: { some: { empresaId: Number(empresaId) } } } : {}),
  }

  const [usuarios, total, empresas] = await Promise.all([
    prisma.usuario.findMany({
      where,
      orderBy: { email: "asc" },
      include: { usuarioEmpresas: { include: { empresa: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.usuario.count({ where }),
    prisma.empresa.findMany({ orderBy: { razaoSocial: "asc" } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (perfil) params.set("perfil", perfil)
    if (empresaId) params.set("empresaId", empresaId)
    if (targetPage > 1) params.set("page", String(targetPage))
    const qs = params.toString()
    return qs ? `/usuarios?${qs}` : "/usuarios"
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários e seus vínculos com empresas.</p>
        </div>
        <Button asChild>
          <Link href="/usuarios/novo">
            <Plus /> Novo usuário
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Buscar por email..." />
        <SelectFilter
          paramKey="perfil"
          placeholder="Todos os perfis"
          options={[
            { value: "admin", label: "Administrador" },
            { value: "usuario", label: "Usuário" },
          ]}
        />
        <SelectFilter
          paramKey="empresaId"
          placeholder="Todas as empresas"
          options={empresas.map((e) => ({
            value: String(e.id),
            label: e.nomeFantasia || e.razaoSocial,
          }))}
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Empresas</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {q || perfil || empresaId
                    ? "Nenhum usuário encontrado para os filtros aplicados."
                    : "Nenhum usuário cadastrado ainda."}
                </TableCell>
              </TableRow>
            )}
            {usuarios.map((usuario) => (
              <ClickableTableRow key={usuario.id} href={`/usuarios/${usuario.id}`}>
                <TableCell className="font-medium">
                  <Link href={`/usuarios/${usuario.id}`} className="hover:underline">
                    {usuario.email}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.isAdmin ? "default" : "secondary"}>
                    {usuario.isAdmin ? "Administrador" : "Usuário"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {usuario.isAdmin
                    ? "Todas"
                    : usuario.usuarioEmpresas
                        .map((v) => v.empresa.nomeFantasia || v.empresa.razaoSocial)
                        .join(", ") || "Nenhuma"}
                </TableCell>
                <TableCell>
                  {usuario.id !== Number(session.user.id) && (
                    <StopPropagation>
                      <ConfirmDeleteButton
                        title="Excluir usuário"
                        description={`Tem certeza que deseja excluir "${usuario.email}"? Essa ação não pode ser desfeita.`}
                        action={deleteUsuario.bind(null, usuario.id)}
                      />
                    </StopPropagation>
                  )}
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
