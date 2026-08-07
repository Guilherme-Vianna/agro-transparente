"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin, requireEmpresaAccess } from "@/lib/authorization"
import { setEmpresaAtivaCookie } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { empresaSchema, type EmpresaInput } from "@/schemas/empresa.schema"

export async function setEmpresaAtiva(empresaId: number) {
  await requireEmpresaAccess(empresaId)
  await setEmpresaAtivaCookie(empresaId)
  revalidatePath("/", "layout")
}

function normalizarOpcionais(data: EmpresaInput) {
  return {
    ...data,
    nomeFantasia: data.nomeFantasia || null,
    cnpj: data.cnpj || null,
    cpf: data.cpf || null,
    inscricaoEstadual: data.inscricaoEstadual || null,
    email: data.email || null,
    telefone: data.telefone || null,
    cep: data.cep || null,
    logradouro: data.logradouro || null,
    numero: data.numero || null,
    bairro: data.bairro || null,
  }
}

export async function createEmpresa(input: EmpresaInput) {
  await requireAdmin()
  const data = empresaSchema.parse(input)

  const empresa = await prisma.empresa.create({
    data: normalizarOpcionais(data),
  })

  revalidatePath("/empresas")
  return empresa
}

export async function updateEmpresa(id: number, input: EmpresaInput) {
  await requireAdmin()
  const data = empresaSchema.parse(input)

  const empresa = await prisma.empresa.update({
    where: { id },
    data: normalizarOpcionais(data),
  })

  revalidatePath("/empresas")
  return empresa
}

export async function deleteEmpresa(id: number) {
  await requireAdmin()
  await prisma.empresa.delete({ where: { id } })
  revalidatePath("/empresas")
}
