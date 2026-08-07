import { requireAdmin } from "@/lib/authorization"
import { EmpresaForm } from "@/components/empresa-form"

export default async function NovaEmpresaPage() {
  await requireAdmin()

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova empresa</h1>
        <p className="text-muted-foreground">Cadastre uma nova empresa produtora.</p>
      </div>
      <EmpresaForm />
    </div>
  )
}
