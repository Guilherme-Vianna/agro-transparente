import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { gerarQrBuffer } from "@/lib/qrcode"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const producao = await prisma.producao.findUnique({ where: { qrCodeToken: token } })

  if (!producao || !producao.qrCodeLink) {
    return NextResponse.json({ error: "Lote não encontrado" }, { status: 404 })
  }

  const buffer = await gerarQrBuffer(producao.qrCodeLink)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="lote-${producao.numeroLote}.png"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
