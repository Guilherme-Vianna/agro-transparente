"use server"

import { revalidatePath } from "next/cache"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { gerarTokenLote, montarLinkRastreio } from "@/lib/qrcode"
import { producaoSchema, type ProducaoInput } from "@/schemas/producao.schema"

function toDate(value?: string) {
  return value ? new Date(value) : null
}

async function assertProdutoAcessivel(produtoId: number) {
  const produto = await prisma.produto.findUniqueOrThrow({ where: { id: produtoId } })
  await requireEmpresaAccess(produto.empresaId)
  return produto
}

export async function createProducao(input: ProducaoInput) {
  const data = producaoSchema.parse(input)
  await assertProdutoAcessivel(data.produtoId)

  const tentarCriar = async () => {
    const token = gerarTokenLote()
    return prisma.producao.create({
      data: {
        produtoId: data.produtoId,
        numeroLote: data.numeroLote,
        dataPlantio: toDate(data.dataPlantio),
        dataColheita: toDate(data.dataColheita),
        qrCodeToken: token,
        qrCodeLink: montarLinkRastreio(token),
      },
    })
  }

  let producao
  try {
    producao = await tentarCriar()
  } catch (error) {
    const isTokenConflict =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      (error.meta?.target as string[] | undefined)?.includes("qr_code_token")
    if (!isTokenConflict) throw error
    producao = await tentarCriar()
  }

  revalidatePath("/producoes")
  return producao
}

export async function updateProducao(id: number, input: ProducaoInput) {
  const data = producaoSchema.parse(input)
  await assertProdutoAcessivel(data.produtoId)

  await prisma.producao.update({
    where: { id },
    data: {
      produtoId: data.produtoId,
      numeroLote: data.numeroLote,
      dataPlantio: toDate(data.dataPlantio),
      dataColheita: toDate(data.dataColheita),
    },
  })

  revalidatePath("/producoes")
}

export async function deleteProducao(id: number) {
  const producao = await prisma.producao.findUniqueOrThrow({
    where: { id },
    include: { produto: true },
  })
  await requireEmpresaAccess(producao.produto.empresaId)
  await prisma.producao.delete({ where: { id } })
  revalidatePath("/producoes")
}
