import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Leaf, MapPin, Sprout } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDate, addDaysUTC } from "@/lib/date"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function getProducao(token: string) {
  return prisma.producao.findUnique({
    where: { qrCodeToken: token },
    include: {
      produto: { include: { empresa: true } },
      aplicacoes: { orderBy: { dataAplicacao: "asc" } },
    },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const producao = await getProducao(token)
  if (!producao) return { title: "Lote não encontrado | Agro Transparente" }

  const titulo = `Lote ${producao.numeroLote} — ${producao.produto.nome} | Agro Transparente`
  const descricao = `Rastreabilidade do lote ${producao.numeroLote} produzido por ${
    producao.produto.empresa.nomeFantasia || producao.produto.empresa.razaoSocial
  }.`

  return {
    title: titulo,
    description: descricao,
    openGraph: { title: titulo, description: descricao },
  }
}

export default async function RastreioPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const producao = await getProducao(token)
  if (!producao) notFound()

  const { produto } = producao
  const { empresa } = produto

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-4">
          <Leaf className="size-5 text-primary" />
          <span className="font-semibold">Agro Transparente</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
        <div>
          <Badge variant="secondary" className="mb-2">
            Lote rastreado
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">{produto.nome}</h1>
          <p className="text-muted-foreground">Lote {producao.numeroLote}</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Sprout className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Produto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nome</p>
              <p>{produto.nome}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Categoria</p>
              <p>{produto.categoria || "—"}</p>
            </div>
            <div className="sm:col-span-3">
              <p className="text-muted-foreground">Descrição</p>
              <p>{produto.descricao || "—"}</p>
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
          <CardHeader className="flex flex-row items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Produtor</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Empresa</p>
              <p>{empresa.nomeFantasia || empresa.razaoSocial}</p>
            </div>
            {empresa.cnpj && (
              <div>
                <p className="text-muted-foreground">CNPJ</p>
                <p>{empresa.cnpj}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Localização</p>
              <p>
                {empresa.municipio}/{empresa.estado}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aplicações registradas</CardTitle>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {producao.aplicacoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhuma aplicação registrada para este lote.
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
                        {aplicacao.dataAplicacao && aplicacao.periodoCarenciaDias !== null
                          ? formatDate(
                              addDaysUTC(aplicacao.dataAplicacao, aplicacao.periodoCarenciaDias)
                            )
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Informações fornecidas por {empresa.nomeFantasia || empresa.razaoSocial}.
        </p>
      </main>
    </div>
  )
}
