import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/authorization"
import { getEmpresaAtiva } from "@/lib/session"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDeleteButton } from "@/components/confirm-delete-button"
import { EmptyEmpresaState } from "@/components/empty-empresa-state"
import { deleteProduto } from "@/actions/produto.actions"

export default async function ProdutosPage() {
  const session = await requireSession()
  const empresaAtiva = await getEmpresaAtiva()

  if (!empresaAtiva) {
    return <EmptyEmpresaState isAdmin={session.user.isAdmin} />
  }

  const produtos = await prisma.produto.findMany({
    where: { empresaId: empresaAtiva.id },
    orderBy: { nome: "asc" },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Produtos de {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}.
          </p>
        </div>
        <Button asChild>
          <Link href="/produtos/novo">
            <Plus /> Novo produto
          </Link>
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum produto cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
            {produtos.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell className="font-medium">
                  <Link href={`/produtos/${produto.id}`} className="hover:underline">
                    {produto.nome}
                  </Link>
                </TableCell>
                <TableCell>{produto.categoria || "—"}</TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">
                  {produto.descricao || "—"}
                </TableCell>
                <TableCell>
                  <ConfirmDeleteButton
                    title="Excluir produto"
                    description={`Tem certeza que deseja excluir "${produto.nome}"? Essa ação não pode ser desfeita.`}
                    action={deleteProduto.bind(null, produto.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
