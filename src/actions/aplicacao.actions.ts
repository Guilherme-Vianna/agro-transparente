"use server"

import { revalidatePath } from "next/cache"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { aplicacaoSchema, type AplicacaoInput } from "@/schemas/aplicacao.schema"

function normalizarDados(data: AplicacaoInput) {
  return {
    tipo: data.tipo,
    produtoUtilizado: data.produtoUtilizado || null,
    dose: data.dose || null,
    dataAplicacao: data.dataAplicacao ? new Date(data.dataAplicacao) : null,
    periodoCarenciaDias:
      data.periodoCarenciaDias && data.periodoCarenciaDias !== ""
        ? Number(data.periodoCarenciaDias)
        : null,
  }
}

async function assertProducaoAcessivel(producaoId: number) {
  const producao = await prisma.producao.findUniqueOrThrow({
    where: { id: producaoId },
    include: { produto: true },
  })
  await requireEmpresaAccess(producao.produto.empresaId)
  return producao
}

export async function addAplicacao(producaoId: number, input: AplicacaoInput) {
  const data = aplicacaoSchema.parse(input)
  await assertProducaoAcessivel(producaoId)

  await prisma.producaoAplicacao.create({
    data: { ...normalizarDados(data), producaoId },
  })

  revalidatePath(`/producoes/${producaoId}`)
}

export async function updateAplicacao(id: number, producaoId: number, input: AplicacaoInput) {
  const data = aplicacaoSchema.parse(input)
  await assertProducaoAcessivel(producaoId)

  await prisma.producaoAplicacao.update({
    where: { id },
    data: normalizarDados(data),
  })

  revalidatePath(`/producoes/${producaoId}`)
}

export async function deleteAplicacao(id: number, producaoId: number) {
  await assertProducaoAcessivel(producaoId)
  await prisma.producaoAplicacao.delete({ where: { id } })
  revalidatePath(`/producoes/${producaoId}`)
}
