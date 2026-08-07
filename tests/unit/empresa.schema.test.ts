import { describe, expect, it } from "vitest"
import { empresaSchema } from "@/schemas/empresa.schema"

describe("empresaSchema", () => {
  it("aceita uma empresa válida com apenas os campos obrigatórios", () => {
    const result = empresaSchema.safeParse({
      razaoSocial: "Fazenda Boa Vista Ltda",
      municipio: "Ribeirão Preto",
      estado: "SP",
      ativo: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejeita quando razão social está vazia", () => {
    const result = empresaSchema.safeParse({
      razaoSocial: "",
      municipio: "Ribeirão Preto",
      estado: "SP",
    })
    expect(result.success).toBe(false)
  })

  it("rejeita UF com mais de 2 caracteres", () => {
    const result = empresaSchema.safeParse({
      razaoSocial: "Fazenda Boa Vista Ltda",
      municipio: "Ribeirão Preto",
      estado: "SPX",
    })
    expect(result.success).toBe(false)
  })

  it("rejeita email inválido quando informado", () => {
    const result = empresaSchema.safeParse({
      razaoSocial: "Fazenda Boa Vista Ltda",
      municipio: "Ribeirão Preto",
      estado: "SP",
      email: "nao-e-email",
    })
    expect(result.success).toBe(false)
  })

  it("aceita email vazio (opcional)", () => {
    const result = empresaSchema.safeParse({
      razaoSocial: "Fazenda Boa Vista Ltda",
      municipio: "Ribeirão Preto",
      estado: "SP",
      email: "",
      ativo: true,
    })
    expect(result.success).toBe(true)
  })
})
