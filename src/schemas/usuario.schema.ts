import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const criarUsuarioSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  isAdmin: z.boolean(),
  empresaIds: z.array(z.number().int()),
})

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>

export const atualizarUsuarioSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  isAdmin: z.boolean(),
  empresaIds: z.array(z.number().int()),
})

export type AtualizarUsuarioInput = z.infer<typeof atualizarUsuarioSchema>
