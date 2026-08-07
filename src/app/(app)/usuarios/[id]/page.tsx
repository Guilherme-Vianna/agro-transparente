import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { UsuarioForm } from "@/components/usuario-form"

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const [usuario, empresas] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: { usuarioEmpresas: true },
    }),
    prisma.empresa.findMany({ orderBy: { razaoSocial: "asc" } }),
  ])
  if (!usuario) notFound()

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar usuário</h1>
        <p className="text-muted-foreground">{usuario.email}</p>
      </div>
      <UsuarioForm
        empresas={empresas}
        usuario={{
          id: usuario.id,
          email: usuario.email,
          isAdmin: usuario.isAdmin,
          empresaIds: usuario.usuarioEmpresas.map((v) => v.empresaId),
        }}
      />
    </div>
  )
}
