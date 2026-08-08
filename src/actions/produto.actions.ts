"use server"

import { revalidatePath } from "next/cache"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { registrarLog } from "@/lib/audit"
import { produtoSchema, type ProdutoInput } from "@/schemas/produto.schema"

function normalizarOpcionais(data: ProdutoInput) {
  return {
    nome: data.nome,
    categoria: data.categoria || null,
    descricao: data.descricao || null,
  }
}

export async function createProduto(empresaId: number, input: ProdutoInput) {
  await requireEmpresaAccess(empresaId)
  const data = produtoSchema.parse(input)

  const produto = await prisma.produto.create({
    data: { ...normalizarOpcionais(data), empresaId },
  })

  await registrarLog({
    acao: "criar",
    entidade: "produto",
    entidadeId: produto.id,
    detalhes: { nome: produto.nome },
  })

  revalidatePath("/produtos")
  return produto
}

export async function updateProduto(id: number, input: ProdutoInput) {
  const produto = await prisma.produto.findUniqueOrThrow({ where: { id } })
  await requireEmpresaAccess(produto.empresaId)
  const data = produtoSchema.parse(input)

  const atualizado = await prisma.produto.update({
    where: { id },
    data: normalizarOpcionais(data),
  })

  await registrarLog({
    acao: "atualizar",
    entidade: "produto",
    entidadeId: atualizado.id,
    detalhes: { nome: atualizado.nome },
  })

  revalidatePath("/produtos")
}

export type ImportProdutoRow = { nome?: string; categoria?: string; descricao?: string }

export async function importProdutosCsv(empresaId: number, rows: ImportProdutoRow[]) {
  await requireEmpresaAccess(empresaId)

  let criados = 0
  const erros: string[] = []

  for (const [index, row] of rows.entries()) {
    const parsed = produtoSchema.safeParse({
      nome: row.nome ?? "",
      categoria: row.categoria ?? "",
      descricao: row.descricao ?? "",
    })
    if (!parsed.success) {
      erros.push(`Linha ${index + 2}: ${parsed.error.issues[0]?.message ?? "dados inválidos"}`)
      continue
    }
    await prisma.produto.create({
      data: { ...normalizarOpcionais(parsed.data), empresaId },
    })
    criados++
  }

  await registrarLog({
    acao: "criar",
    entidade: "produto",
    detalhes: { importacaoCsv: true, criados, erros: erros.length },
  })

  revalidatePath("/produtos")
  return { criados, erros }
}

export async function deleteProduto(id: number) {
  const produto = await prisma.produto.findUniqueOrThrow({ where: { id } })
  await requireEmpresaAccess(produto.empresaId)
  await prisma.produto.delete({ where: { id } })
  await registrarLog({
    acao: "excluir",
    entidade: "produto",
    entidadeId: id,
    detalhes: { nome: produto.nome },
  })
  revalidatePath("/produtos")
}
