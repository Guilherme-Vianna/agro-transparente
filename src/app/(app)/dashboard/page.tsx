import Link from "next/link"
import { Building2, Leaf, Package, Sprout } from "lucide-react"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/date"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyEmpresaState } from "@/components/empty-empresa-state"

export default async function DashboardPage() {
  const session = await requireSession()
  const empresaAtiva = await getEmpresaAtiva()

  if (!empresaAtiva) {
    return <EmptyEmpresaState isAdmin={session.user.isAdmin} />
  }

  const [totalProdutos, totalLotes, totalAplicacoes, lotesRecentes, totalEmpresas] =
    await Promise.all([
      prisma.produto.count({ where: { empresaId: empresaAtiva.id } }),
      prisma.producao.count({ where: { produto: { empresaId: empresaAtiva.id } } }),
      prisma.producaoAplicacao.count({
        where: { producao: { produto: { empresaId: empresaAtiva.id } } },
      }),
      prisma.producao.findMany({
        where: { produto: { empresaId: empresaAtiva.id } },
        include: { produto: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      session.user.isAdmin ? prisma.empresa.count() : Promise.resolve(null),
    ])

  const cards = [
    { label: "Produtos", value: totalProdutos, icon: Package, href: "/produtos" },
    { label: "Lotes de produção", value: totalLotes, icon: Leaf, href: "/producoes" },
    { label: "Aplicações registradas", value: totalAplicacoes, icon: Sprout, href: "/producoes" },
    ...(totalEmpresas !== null
      ? [{ label: "Empresas cadastradas", value: totalEmpresas, icon: Building2, href: "/empresas" }]
      : []),
  ]

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
                <card.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lotes recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {lotesRecentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lote cadastrado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lotesRecentes.map((lote) => (
                <li key={lote.id}>
                  <Link
                    href={`/producoes/${lote.id}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <span>
                      <span className="font-medium">{lote.numeroLote}</span>{" "}
                      <span className="text-muted-foreground">— {lote.produto.nome}</span>
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
