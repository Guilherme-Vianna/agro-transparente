import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const EMPRESA_COOKIE = "empresa_ativa_id"

export async function getEmpresasDoUsuario() {
  const session = await auth()
  if (!session?.user) return []

  if (session.user.isAdmin) {
    return prisma.empresa.findMany({ orderBy: { razaoSocial: "asc" } })
  }

  const vinculos = await prisma.usuarioEmpresa.findMany({
    where: { usuarioId: Number(session.user.id) },
    include: { empresa: true },
    orderBy: { empresa: { razaoSocial: "asc" } },
  })

  return vinculos.map((v) => v.empresa)
}

export async function getEmpresaAtiva() {
  const session = await auth()
  if (!session?.user) return null

  const empresas = await getEmpresasDoUsuario()
  if (empresas.length === 0) return null

  const cookieStore = await cookies()
  const empresaId = Number(cookieStore.get(EMPRESA_COOKIE)?.value)

  const empresaValida = empresas.find((e) => e.id === empresaId)
  if (empresaValida) return empresaValida

  return empresas[0]
}

export async function setEmpresaAtivaCookie(empresaId: number) {
  const cookieStore = await cookies()
  cookieStore.set(EMPRESA_COOKIE, String(empresaId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
}
