import { requireAdmin } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { UsuarioForm } from "@/components/usuario-form"

export default async function NovoUsuarioPage() {
  await requireAdmin()
  const empresas = await prisma.empresa.findMany({ orderBy: { razaoSocial: "asc" } })

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo usuário</h1>
        <p className="text-muted-foreground">Cadastre um novo usuário e vincule suas empresas.</p>
      </div>
      <UsuarioForm empresas={empresas} />
    </div>
  )
}
