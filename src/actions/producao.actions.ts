"use server"

import { revalidatePath } from "next/cache"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { gerarTokenLote } from "@/lib/qrcode"
import { registrarLog } from "@/lib/audit"
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

  await registrarLog({
    acao: "criar",
    entidade: "producao",
    entidadeId: producao.id,
    detalhes: { numeroLote: producao.numeroLote },
  })

  revalidatePath("/producoes")
  return producao
}

export async function updateProducao(id: number, input: ProducaoInput) {
  const data = producaoSchema.parse(input)
  await assertProdutoAcessivel(data.produtoId)

  const atualizada = await prisma.producao.update({
    where: { id },
    data: {
      produtoId: data.produtoId,
      numeroLote: data.numeroLote,
      dataPlantio: toDate(data.dataPlantio),
      dataColheita: toDate(data.dataColheita),
    },
  })

  await registrarLog({
    acao: "atualizar",
    entidade: "producao",
    entidadeId: atualizada.id,
    detalhes: { numeroLote: atualizada.numeroLote },
  })

  revalidatePath("/producoes")
}

export type ImportProducaoRow = {
  numeroLote?: string
  produto?: string
  dataPlantio?: string
  dataColheita?: string
}

export async function importProducoesCsv(empresaId: number, rows: ImportProducaoRow[]) {
  await requireEmpresaAccess(empresaId)

  const produtos = await prisma.produto.findMany({ where: { empresaId } })
  const produtoPorNome = new Map(produtos.map((p) => [p.nome.trim().toLowerCase(), p.id]))

  let criados = 0
  const erros: string[] = []

  for (const [index, row] of rows.entries()) {
    const produtoId = produtoPorNome.get((row.produto ?? "").trim().toLowerCase())
    if (!produtoId) {
      erros.push(`Linha ${index + 2}: produto "${row.produto ?? ""}" não encontrado`)
      continue
    }

    const parsed = producaoSchema.safeParse({
      produtoId,
      numeroLote: row.numeroLote ?? "",
      dataPlantio: row.dataPlantio ?? "",
      dataColheita: row.dataColheita ?? "",
    })
    if (!parsed.success) {
      erros.push(`Linha ${index + 2}: ${parsed.error.issues[0]?.message ?? "dados inválidos"}`)
      continue
    }

    try {
      const token = gerarTokenLote()
      await prisma.producao.create({
        data: {
          produtoId: parsed.data.produtoId,
          numeroLote: parsed.data.numeroLote,
          dataPlantio: toDate(parsed.data.dataPlantio),
          dataColheita: toDate(parsed.data.dataColheita),
          qrCodeToken: token,
        },
      })
      criados++
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        erros.push(`Linha ${index + 2}: número de lote "${parsed.data.numeroLote}" já existe`)
      } else {
        throw error
      }
    }
  }

  await registrarLog({
    acao: "criar",
    entidade: "producao",
    detalhes: { importacaoCsv: true, criados, erros: erros.length },
  })

  revalidatePath("/producoes")
  return { criados, erros }
}

export async function deleteProducao(id: number) {
  const producao = await prisma.producao.findUniqueOrThrow({
    where: { id },
    include: { produto: true },
  })
  await requireEmpresaAccess(producao.produto.empresaId)
  await prisma.producao.delete({ where: { id } })
  await registrarLog({
    acao: "excluir",
    entidade: "producao",
    entidadeId: id,
    detalhes: { numeroLote: producao.numeroLote },
  })
  revalidatePath("/producoes")
}
