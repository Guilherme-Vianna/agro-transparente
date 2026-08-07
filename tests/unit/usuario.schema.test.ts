import { describe, expect, it } from "vitest"
import { criarUsuarioSchema, loginSchema } from "@/schemas/usuario.schema"

describe("loginSchema", () => {
  it("aceita email e senha válidos", () => {
    expect(loginSchema.safeParse({ email: "admin@admin.com", senha: "admin" }).success).toBe(true)
  })

  it("rejeita email inválido", () => {
    expect(loginSchema.safeParse({ email: "nao-e-email", senha: "admin" }).success).toBe(false)
  })

  it("rejeita senha vazia", () => {
    expect(loginSchema.safeParse({ email: "admin@admin.com", senha: "" }).success).toBe(false)
  })
})

describe("criarUsuarioSchema", () => {
  it("aceita um usuário válido", () => {
    const result = criarUsuarioSchema.safeParse({
      email: "novo@empresa.com",
      senha: "senha123",
      isAdmin: false,
      empresaIds: [1, 2],
    })
    expect(result.success).toBe(true)
  })

  it("rejeita senha com menos de 6 caracteres", () => {
    const result = criarUsuarioSchema.safeParse({
      email: "novo@empresa.com",
      senha: "123",
      isAdmin: false,
      empresaIds: [],
    })
    expect(result.success).toBe(false)
  })
})
