"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
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

  revalidatePath("/usuarios")
}

export async function deleteUsuario(id: number) {
  await requireAdmin()
  await prisma.usuario.delete({ where: { id } })
  revalidatePath("/usuarios")
}
