import { beforeEach, describe, expect, it, vi } from "vitest"
import { resetDb, prisma } from "../setup/db"
import { createProducao } from "@/actions/producao.actions"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "1", email: "admin@admin.com", isAdmin: true },
  }),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("createProducao (integração)", () => {
  beforeEach(async () => {
    await resetDb()
  })

  it("cria um lote com token e link de QR gerados automaticamente", async () => {
    await prisma.usuario.create({
      data: { id: 1, email: "admin@admin.com", senha: "hash", isAdmin: true },
    })
    const empresa = await prisma.empresa.create({
      data: { razaoSocial: "Fazenda Teste", municipio: "Ribeirão Preto", estado: "SP" },
    })
    const produto = await prisma.produto.create({
      data: { nome: "Café", empresaId: empresa.id },
    })

    const producao = await createProducao({
      produtoId: produto.id,
      numeroLote: "LT-001",
      dataPlantio: "",
      dataColheita: "",
    })

    expect(producao.qrCodeToken).toBeTruthy()
    expect(producao.qrCodeToken).toHaveLength(12)
  })

  it("rejeita número de lote duplicado (unique constraint)", async () => {
    await prisma.usuario.create({
      data: { id: 1, email: "admin@admin.com", senha: "hash", isAdmin: true },
    })
    const empresa = await prisma.empresa.create({
      data: { razaoSocial: "Fazenda Teste", municipio: "Ribeirão Preto", estado: "SP" },
    })
    const produto = await prisma.produto.create({
      data: { nome: "Café", empresaId: empresa.id },
    })

    await createProducao({
      produtoId: produto.id,
      numeroLote: "LT-DUPLICADO",
      dataPlantio: "",
      dataColheita: "",
    })

    await expect(
      createProducao({
        produtoId: produto.id,
        numeroLote: "LT-DUPLICADO",
        dataPlantio: "",
        dataColheita: "",
      })
    ).rejects.toThrow()
  })
})
