import Link from "next/link"
import { ArrowRight, Building2, Leaf, Package, Sprout } from "lucide-react"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { formatDate, addDaysUTC } from "@/lib/date"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyEmpresaState } from "@/components/empty-empresa-state"
import { LotesPorMesChart } from "@/components/lotes-por-mes-chart"

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
]

function carenciaStatus(aplicacoes: { dataAplicacao: Date | null; periodoCarenciaDias: number | null }[]) {
  const hoje = new Date()
  const emCarencia = aplicacoes.some((a) => {
    if (!a.dataAplicacao || a.periodoCarenciaDias === null) return false
    return addDaysUTC(a.dataAplicacao, a.periodoCarenciaDias) > hoje
  })
  return emCarencia
}

export default async function DashboardPage() {
  const session = await requireSession()
  const empresaAtiva = await getEmpresaAtiva()

  if (!empresaAtiva) {
    return <EmptyEmpresaState isAdmin={session.user.isAdmin} />
  }

  const seisMesesAtras = new Date()
  seisMesesAtras.setUTCMonth(seisMesesAtras.getUTCMonth() - 5)
  seisMesesAtras.setUTCDate(1)
  seisMesesAtras.setUTCHours(0, 0, 0, 0)

  const [
    totalProdutos,
    totalLotes,
    totalAplicacoes,
    lotesRecentes,
    totalEmpresas,
    lotesUltimos6Meses,
    aplicacoesPorTipo,
  ] = await Promise.all([
    prisma.produto.count({ where: { empresaId: empresaAtiva.id } }),
    prisma.producao.count({ where: { produto: { empresaId: empresaAtiva.id } } }),
    prisma.producaoAplicacao.count({
      where: { producao: { produto: { empresaId: empresaAtiva.id } } },
    }),
    prisma.producao.findMany({
      where: { produto: { empresaId: empresaAtiva.id } },
      include: { produto: true, aplicacoes: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    session.user.isAdmin ? prisma.empresa.count() : Promise.resolve(null),
    prisma.producao.findMany({
      where: {
        produto: { empresaId: empresaAtiva.id },
        createdAt: { gte: seisMesesAtras },
      },
      select: { createdAt: true },
    }),
    prisma.producaoAplicacao.groupBy({
      by: ["tipo"],
      where: { producao: { produto: { empresaId: empresaAtiva.id } } },
      _count: { tipo: true },
      orderBy: { _count: { tipo: "desc" } },
    }),
  ])

  const cards = [
    { label: "Produtos", value: totalProdutos, icon: Package, href: "/produtos" },
    { label: "Lotes de produção", value: totalLotes, icon: Leaf, href: "/producoes" },
    { label: "Aplicações registradas", value: totalAplicacoes, icon: Sprout, href: "/producoes" },
    ...(totalEmpresas !== null
      ? [{ label: "Empresas cadastradas", value: totalEmpresas, icon: Building2, href: "/empresas" }]
      : []),
  ]

  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const ref = new Date(seisMesesAtras)
    ref.setUTCMonth(ref.getUTCMonth() + i)
    const count = lotesUltimos6Meses.filter(
      (l) => l.createdAt.getUTCFullYear() === ref.getUTCFullYear() && l.createdAt.getUTCMonth() === ref.getUTCMonth()
    ).length
    return { label: MESES[ref.getUTCMonth()], value: count }
  })

  const totalAplicacoesPorTipo = aplicacoesPorTipo.reduce((sum, a) => sum + a._count.tipo, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral de {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <card.icon className="size-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lotes criados nos últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <LotesPorMesChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aplicações por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {aplicacoesPorTipo.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma aplicação registrada ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {aplicacoesPorTipo.map((item) => {
                  const pct = totalAplicacoesPorTipo
                    ? Math.round((item._count.tipo / totalAplicacoesPorTipo) * 100)
                    : 0
                  return (
                    <li key={item.tipo} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.tipo}</span>
                        <span className="text-muted-foreground">{item._count.tipo}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lotes recentes</CardTitle>
          <Link
            href="/producoes"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Ver todos <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {lotesRecentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lote cadastrado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lotesRecentes.map((lote) => (
                <li key={lote.id}>
                  <Link
                    href={`/producoes/${lote.id}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{lote.numeroLote}</span>
                      <span className="text-muted-foreground">— {lote.produto.nome}</span>
                      {carenciaStatus(lote.aplicacoes) && (
                        <Badge variant="secondary">Em carência</Badge>
                      )}
                    </span>
                    <span className="text-muted-foreground">{formatDate(lote.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
