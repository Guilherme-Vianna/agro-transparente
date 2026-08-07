import { describe, expect, it } from "vitest"
import { aplicacaoSchema } from "@/schemas/aplicacao.schema"

describe("aplicacaoSchema", () => {
  it("aceita aplicação válida apenas com tipo", () => {
    expect(aplicacaoSchema.safeParse({ tipo: "Adubação" }).success).toBe(true)
  })

  it("rejeita tipo vazio", () => {
    expect(aplicacaoSchema.safeParse({ tipo: "" }).success).toBe(false)
  })

  it("aceita todos os campos preenchidos", () => {
    const result = aplicacaoSchema.safeParse({
      tipo: "Defensivo",
      produtoUtilizado: "Fungicida X",
      dose: "2L/ha",
      dataAplicacao: "2026-01-10",
      periodoCarenciaDias: "14",
    })
    expect(result.success).toBe(true)
  })
})
