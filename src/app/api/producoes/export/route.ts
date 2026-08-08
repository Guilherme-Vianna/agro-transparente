import { NextResponse } from "next/server"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { toCsv } from "@/lib/csv"
import { montarLinkRastreio } from "@/lib/qrcode"

export async function GET() {
  await requireSession()
  const empresaAtiva = await getEmpresaAtiva()
  if (!empresaAtiva) {
    return NextResponse.json({ error: "Nenhuma empresa ativa" }, { status: 400 })
  }

  const lotes = await prisma.producao.findMany({
    where: { produto: { empresaId: empresaAtiva.id } },
    include: { produto: true },
    orderBy: { createdAt: "desc" },
  })

  const csv = toCsv(
    ["numeroLote", "produto", "dataPlantio", "dataColheita", "qrCodeLink"],
    lotes.map((l) => [
      l.numeroLote,
      l.produto.nome,
      l.dataPlantio ? l.dataPlantio.toISOString().slice(0, 10) : "",
      l.dataColheita ? l.dataColheita.toISOString().slice(0, 10) : "",
      l.qrCodeToken ? montarLinkRastreio(l.qrCodeToken) : "",
    ])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lotes-producao.csv"`,
    },
  })
}
