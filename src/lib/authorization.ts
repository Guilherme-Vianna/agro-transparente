import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export class UnauthorizedError extends Error {
  constructor(message = "Acesso não autorizado") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export async function requireSession() {
  const session = await auth()
  if (!session?.user) throw new UnauthorizedError("Sessão inválida")
  return session
}

export async function requireAdmin() {
  const session = await requireSession()
  if (!session.user.isAdmin) throw new UnauthorizedError("Requer permissão de administrador")
  return session
}

export async function requireEmpresaAccess(empresaId: number) {
  const session = await requireSession()
  if (session.user.isAdmin) return session

  const vinculo = await prisma.usuarioEmpresa.findFirst({
    where: { usuarioId: Number(session.user.id), empresaId },
  })
  if (!vinculo) throw new UnauthorizedError("Você não tem acesso a esta empresa")

  return session
}
