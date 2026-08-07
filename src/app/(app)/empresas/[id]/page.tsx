import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { EmpresaForm } from "@/components/empresa-form"

export default async function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const empresa = await prisma.empresa.findUnique({ where: { id: Number(id) } })
  if (!empresa) notFound()

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar empresa</h1>
        <p className="text-muted-foreground">{empresa.razaoSocial}</p>
      </div>
      <EmpresaForm
        empresa={{
          id: empresa.id,
          razaoSocial: empresa.razaoSocial,
          nomeFantasia: empresa.nomeFantasia ?? "",
          cnpj: empresa.cnpj ?? "",
          cpf: empresa.cpf ?? "",
          inscricaoEstadual: empresa.inscricaoEstadual ?? "",
          email: empresa.email ?? "",
          telefone: empresa.telefone ?? "",
          cep: empresa.cep ?? "",
          logradouro: empresa.logradouro ?? "",
          numero: empresa.numero ?? "",
          bairro: empresa.bairro ?? "",
          municipio: empresa.municipio,
          estado: empresa.estado,
          ativo: empresa.ativo,
        }}
      />
    </div>
  )
}
