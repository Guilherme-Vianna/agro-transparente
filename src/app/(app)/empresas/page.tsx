import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/authorization"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDeleteButton } from "@/components/confirm-delete-button"
import { deleteEmpresa } from "@/actions/empresa.actions"

export default async function EmpresasPage() {
  await requireAdmin()
  const empresas = await prisma.empresa.findMany({ orderBy: { razaoSocial: "asc" } })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">Gerencie as empresas cadastradas na plataforma.</p>
        </div>
        <Button asChild>
          <Link href="/empresas/nova">
            <Plus /> Nova empresa
          </Link>
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão social</TableHead>
              <TableHead>Município/UF</TableHead>
              <TableHead>CNPJ/CPF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma empresa cadastrada ainda.
                </TableCell>
              </TableRow>
            )}
            {empresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell className="font-medium">
                  <Link href={`/empresas/${empresa.id}`} className="hover:underline">
                    {empresa.nomeFantasia || empresa.razaoSocial}
                  </Link>
                </TableCell>
                <TableCell>
                  {empresa.municipio}/{empresa.estado}
                </TableCell>
                <TableCell>{empresa.cnpj || empresa.cpf || "—"}</TableCell>
                <TableCell>
                  <Badge variant={empresa.ativo ? "default" : "secondary"}>
                    {empresa.ativo ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ConfirmDeleteButton
                    title="Excluir empresa"
                    description={`Tem certeza que deseja excluir "${empresa.razaoSocial}"? Essa ação não pode ser desfeita.`}
                    action={deleteEmpresa.bind(null, empresa.id)}
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
