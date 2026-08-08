"use server"

import { revalidatePath } from "next/cache"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { registrarLog } from "@/lib/audit"
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

  const aplicacao = await prisma.producaoAplicacao.create({
    data: { ...normalizarDados(data), producaoId },
  })

  await registrarLog({
    acao: "criar",
    entidade: "aplicacao",
    entidadeId: aplicacao.id,
    detalhes: { producaoId, tipo: aplicacao.tipo },
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

  await registrarLog({
    acao: "atualizar",
    entidade: "aplicacao",
    entidadeId: id,
    detalhes: { producaoId, tipo: data.tipo },
  })

  revalidatePath(`/producoes/${producaoId}`)
}

export async function deleteAplicacao(id: number, producaoId: number) {
  await assertProducaoAcessivel(producaoId)
  await prisma.producaoAplicacao.delete({ where: { id } })
  await registrarLog({
    acao: "excluir",
    entidade: "aplicacao",
    entidadeId: id,
    detalhes: { producaoId },
  })
  revalidatePath(`/producoes/${producaoId}`)
}
