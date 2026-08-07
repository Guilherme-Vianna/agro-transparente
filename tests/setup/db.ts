import { prisma } from "@/lib/prisma"

export async function resetDb() {
  await prisma.$transaction([
    prisma.producaoAplicacao.deleteMany(),
    prisma.producao.deleteMany(),
    prisma.produto.deleteMany(),
    prisma.usuarioEmpresa.deleteMany(),
    prisma.empresa.deleteMany(),
    prisma.usuario.deleteMany(),
  ])
}

export { prisma }
