"use server"

import { revalidatePath } from "next/cache"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
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

  revalidatePath("/produtos")
  return produto
}

export async function updateProduto(id: number, input: ProdutoInput) {
  const produto = await prisma.produto.findUniqueOrThrow({ where: { id } })
  await requireEmpresaAccess(produto.empresaId)
  const data = produtoSchema.parse(input)

  await prisma.produto.update({
    where: { id },
    data: normalizarOpcionais(data),
  })

  revalidatePath("/produtos")
}

export async function deleteProduto(id: number) {
  const produto = await prisma.produto.findUniqueOrThrow({ where: { id } })
  await requireEmpresaAccess(produto.empresaId)
  await prisma.produto.delete({ where: { id } })
  revalidatePath("/produtos")
}
