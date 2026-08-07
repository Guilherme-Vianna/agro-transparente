import { auth } from "@/lib/auth"
import { getEmpresasDoUsuario, getEmpresaAtiva } from "@/lib/session"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const [empresas, empresaAtiva] = await Promise.all([
    getEmpresasDoUsuario(),
    getEmpresaAtiva(),
  ])

  return (
    <SidebarProvider>
      <AppSidebar
        isAdmin={!!session?.user.isAdmin}
        empresas={empresas.map((e) => ({
          id: e.id,
          razaoSocial: e.razaoSocial,
          nomeFantasia: e.nomeFantasia,
        }))}
        empresaAtivaId={empresaAtiva?.id ?? null}
        userEmail={session?.user.email ?? ""}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
