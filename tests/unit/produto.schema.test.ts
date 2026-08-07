import { describe, expect, it } from "vitest"
import { produtoSchema } from "@/schemas/produto.schema"

describe("produtoSchema", () => {
  it("aceita produto válido apenas com nome", () => {
    expect(produtoSchema.safeParse({ nome: "Café Arábica" }).success).toBe(true)
  })

  it("rejeita nome vazio", () => {
    expect(produtoSchema.safeParse({ nome: "" }).success).toBe(false)
  })

  it("aceita categoria e descrição opcionais", () => {
    const result = produtoSchema.safeParse({
      nome: "Café Arábica",
      categoria: "Grãos",
      descricao: "Café arábica torrado",
    })
    expect(result.success).toBe(true)
  })
})
