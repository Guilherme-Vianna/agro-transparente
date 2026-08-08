import { beforeEach, describe, expect, it } from "vitest"
import { resetDb, prisma } from "../setup/db"

describe("consulta de rastreio por token (integração)", () => {
  beforeEach(async () => {
    await resetDb()
  })

  it("retorna o lote completo (empresa, produto, aplicações) para um token válido", async () => {
    const empresa = await prisma.empresa.create({
      data: { razaoSocial: "Fazenda Teste", municipio: "Ribeirão Preto", estado: "SP" },
    })
    const produto = await prisma.produto.create({
      data: { nome: "Café", empresaId: empresa.id },
    })
    const producao = await prisma.producao.create({
      data: {
        produtoId: produto.id,
        numeroLote: "LT-001",
        qrCodeToken: "TOKEN123",
      },
    })
    await prisma.producaoAplicacao.create({
      data: { producaoId: producao.id, tipo: "Defensivo" },
    })

    const resultado = await prisma.producao.findUnique({
      where: { qrCodeToken: "TOKEN123" },
      include: { produto: { include: { empresa: true } }, aplicacoes: true },
    })

    expect(resultado).not.toBeNull()
    expect(resultado?.produto.nome).toBe("Café")
    expect(resultado?.produto.empresa.razaoSocial).toBe("Fazenda Teste")
    expect(resultado?.aplicacoes).toHaveLength(1)
  })

  it("retorna null para um token inexistente", async () => {
    const resultado = await prisma.producao.findUnique({
      where: { qrCodeToken: "TOKEN-QUE-NAO-EXISTE" },
    })
    expect(resultado).toBeNull()
  })
})
