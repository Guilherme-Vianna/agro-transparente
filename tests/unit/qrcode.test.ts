import { describe, expect, it } from "vitest"
import { gerarTokenLote, montarLinkRastreio } from "@/lib/qrcode"

describe("gerarTokenLote", () => {
  it("gera um token de 12 caracteres alfanuméricos", () => {
    const token = gerarTokenLote()
    expect(token).toHaveLength(12)
    expect(token).toMatch(/^[0-9A-HJ-NP-Z]+$/)
  })

  it("gera tokens diferentes a cada chamada", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => gerarTokenLote()))
    expect(tokens.size).toBe(100)
  })
})

describe("montarLinkRastreio", () => {
  it("monta o link de rastreio a partir do token", () => {
    const link = montarLinkRastreio("ABC123")
    expect(link).toMatch(/\/rastreio\/ABC123$/)
  })
})
