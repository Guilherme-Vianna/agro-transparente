import { NextResponse } from "next/server"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { toCsv } from "@/lib/csv"

export async function GET() {
  await requireSession()
  const empresaAtiva = await getEmpresaAtiva()
  if (!empresaAtiva) {
    return NextResponse.json({ error: "Nenhuma empresa ativa" }, { status: 400 })
  }

  const produtos = await prisma.produto.findMany({
    where: { empresaId: empresaAtiva.id },
    orderBy: { nome: "asc" },
  })

  const csv = toCsv(
    ["nome", "categoria", "descricao"],
    produtos.map((p) => [p.nome, p.categoria, p.descricao])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="produtos.csv"`,
    },
  })
}
