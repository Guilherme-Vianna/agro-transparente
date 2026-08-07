import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, Pencil } from "lucide-react"
import { requireEmpresaAccess } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { gerarQrDataUrl } from "@/lib/qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AplicacaoDialog } from "@/components/aplicacao-dialog"
import { ConfirmDeleteButton } from "@/components/confirm-delete-button"
import { deleteAplicacao } from "@/actions/aplicacao.actions"
import { formatDate, addDaysUTC } from "@/lib/date"

function toInputDate(date: Date | null) {
  if (!date) return ""
  return date.toISOString().slice(0, 10)
}

function formatCarenciaAte(dataAplicacao: Date | null, periodoCarenciaDias: number | null) {
  if (!dataAplicacao || periodoCarenciaDias === null) return "—"
  return formatDate(addDaysUTC(dataAplicacao, periodoCarenciaDias))
}

export default async function DetalheProducaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const producao = await prisma.producao.findUnique({
    where: { id: Number(id) },
    include: {
      produto: { include: { empresa: true } },
      aplicacoes: { orderBy: { dataAplicacao: "asc" } },
    },
  })
  if (!producao) notFound()

  await requireEmpresaAccess(producao.produto.empresaId)

  const qrDataUrl = producao.qrCodeLink ? await gerarQrDataUrl(producao.qrCodeLink) : null

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lote {producao.numeroLote}</h1>
          <p className="text-muted-foreground">{producao.produto.nome}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/producoes/${producao.id}/editar`}>
            <Pencil /> Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Informações do lote</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Produto</p>
              <p>{producao.produto.nome}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Empresa</p>
              <p>{producao.produto.empresa.nomeFantasia || producao.produto.empresa.razaoSocial}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data de plantio</p>
              <p>{formatDate(producao.dataPlantio)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data de colheita</p>
              <p>{formatDate(producao.dataColheita)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR code de rastreio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code do lote ${producao.numeroLote}`}
                className="size-40 rounded-md border"
              />
            ) : (
              <p className="text-sm text-muted-foreground">QR code indisponível.</p>
            )}
            {producao.qrCodeToken && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`/api/qrcode/${producao.qrCodeToken}`} download={`lote-${producao.numeroLote}.png`}>
                  <Download /> Baixar
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Aplicações</CardTitle>
          <AplicacaoDialog producaoId={producao.id} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Carência até</TableHead>
                  <TableHead className="w-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {producao.aplicacoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma aplicação registrada ainda.
                    </TableCell>
                  </TableRow>
                )}
                {producao.aplicacoes.map((aplicacao) => (
                  <TableRow key={aplicacao.id}>
                    <TableCell className="font-medium">{aplicacao.tipo}</TableCell>
                    <TableCell>{aplicacao.produtoUtilizado || "—"}</TableCell>
                    <TableCell>{aplicacao.dose || "—"}</TableCell>
                    <TableCell>{formatDate(aplicacao.dataAplicacao)}</TableCell>
                    <TableCell>
                      {formatCarenciaAte(aplicacao.dataAplicacao, aplicacao.periodoCarenciaDias)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <AplicacaoDialog
                          producaoId={producao.id}
                          aplicacao={{
                            id: aplicacao.id,
                            tipo: aplicacao.tipo,
                            produtoUtilizado: aplicacao.produtoUtilizado ?? "",
                            dose: aplicacao.dose ?? "",
                            dataAplicacao: toInputDate(aplicacao.dataAplicacao),
                            periodoCarenciaDias: aplicacao.periodoCarenciaDias?.toString() ?? "",
                          }}
                        />
                        <ConfirmDeleteButton
                          title="Excluir aplicação"
                          description="Tem certeza que deseja excluir esta aplicação? Essa ação não pode ser desfeita."
                          action={deleteAplicacao.bind(null, aplicacao.id, producao.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
