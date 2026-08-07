import { describe, expect, it } from "vitest"
import { resetDb, prisma } from "../setup/db"

// @prisma/adapter-pg's `schema` option qualifies every generated query with
// `"test"."table"` rather than changing the connection's session
// search_path — so SELECT current_schema() is NOT a valid way to verify
// isolation (it always reports the connection's real default, "public").
// The only reliable check is: does a row created through the app's prisma
// client actually land in the "test" schema and stay invisible from "public"?
describe("isolamento do banco de testes", () => {
  it("resetDb()/create operam no schema 'test', nunca no 'public'", async () => {
    await resetDb()
    const marcador = `db-isolation-guard-${Date.now()}`
    await prisma.empresa.create({
      data: { razaoSocial: marcador, municipio: "Teste", estado: "SP" },
    })

    const emTest = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT count(*)::int as count FROM test.empresa WHERE razao_social = ${marcador}
    `
    const emPublic = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT count(*)::int as count FROM public.empresa WHERE razao_social = ${marcador}
    `

    expect(Number(emTest[0].count)).toBe(1)
    expect(Number(emPublic[0].count)).toBe(0)
  })
})
