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
import { deleteUsuario } from "@/actions/usuario.actions"

export default async function UsuariosPage() {
  const session = await requireAdmin()
  const usuarios = await prisma.usuario.findMany({
    orderBy: { email: "asc" },
    include: { usuarioEmpresas: { include: { empresa: true } } },
  })

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
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
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
                    <ConfirmDeleteButton
                      title="Excluir usuário"
                      description={`Tem certeza que deseja excluir "${usuario.email}"? Essa ação não pode ser desfeita.`}
                      action={deleteUsuario.bind(null, usuario.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
