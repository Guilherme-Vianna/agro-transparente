"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { registrarLog } from "@/lib/audit"
import {
  criarUsuarioSchema,
  atualizarUsuarioSchema,
  type CriarUsuarioInput,
  type AtualizarUsuarioInput,
} from "@/schemas/usuario.schema"

export async function createUsuario(input: CriarUsuarioInput) {
  await requireAdmin()
  const data = criarUsuarioSchema.parse(input)

  const senhaHash = await bcrypt.hash(data.senha, 10)

  const usuario = await prisma.usuario.create({
    data: {
      email: data.email,
      senha: senhaHash,
      isAdmin: data.isAdmin,
      usuarioEmpresas: {
        create: data.empresaIds.map((empresaId) => ({ empresaId })),
      },
    },
  })

  await registrarLog({
    acao: "criar",
    entidade: "usuario",
    entidadeId: usuario.id,
    detalhes: { email: usuario.email },
  })

  revalidatePath("/usuarios")
  return usuario
}

export async function updateUsuario(id: number, input: AtualizarUsuarioInput) {
  await requireAdmin()
  const data = atualizarUsuarioSchema.parse(input)

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id },
      data: {
        email: data.email,
        isAdmin: data.isAdmin,
        ...(data.senha ? { senha: await bcrypt.hash(data.senha, 10) } : {}),
      },
    })

    await tx.usuarioEmpresa.deleteMany({ where: { usuarioId: id } })
    if (data.empresaIds.length > 0) {
      await tx.usuarioEmpresa.createMany({
        data: data.empresaIds.map((empresaId) => ({ usuarioId: id, empresaId })),
      })
    }
  })

  await registrarLog({
    acao: "atualizar",
    entidade: "usuario",
    entidadeId: id,
    detalhes: { email: data.email },
  })

  revalidatePath("/usuarios")
}

export async function deleteUsuario(id: number) {
  await requireAdmin()
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id } })
  await prisma.usuario.delete({ where: { id } })
  await registrarLog({
    acao: "excluir",
    entidade: "usuario",
    entidadeId: id,
    detalhes: { email: usuario.email },
  })
  revalidatePath("/usuarios")
}
