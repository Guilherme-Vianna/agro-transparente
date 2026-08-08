import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

export type AuditAcao = "criar" | "atualizar" | "excluir" | "login" | "logout" | "login_falhou"

export async function registrarLog({
  acao,
  entidade,
  entidadeId,
  detalhes,
}: {
  acao: AuditAcao
  entidade: string
  entidadeId?: number
  detalhes?: Record<string, unknown>
}) {
  const session = await auth()

  await prisma.auditLog.create({
    data: {
      usuarioId: session?.user?.id ? Number(session.user.id) : null,
      usuarioEmail: session?.user?.email ?? null,
      acao,
      entidade,
      entidadeId,
      detalhes: detalhes as Prisma.InputJsonValue | undefined,
    },
  })
}
