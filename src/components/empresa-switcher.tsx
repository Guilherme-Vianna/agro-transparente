"use client"

import { useTransition } from "react"
import { Building2, ChevronsUpDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { setEmpresaAtiva } from "@/actions/empresa.actions"
import { cn } from "@/lib/utils"

type Empresa = {
  id: number
  razaoSocial: string
  nomeFantasia: string | null
}

export function EmpresaSwitcher({
  empresas,
  empresaAtivaId,
}: {
  empresas: Empresa[]
  empresaAtivaId: number | null
}) {
  const [isPending, startTransition] = useTransition()
  const empresaAtiva = empresas.find((e) => e.id === empresaAtivaId) ?? empresas[0]

  if (empresas.length === 0) return null

  if (empresas.length === 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" disabled={isPending}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {empresaAtiva.nomeFantasia || empresaAtiva.razaoSocial}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" align="start">
            {empresas.map((empresa) => (
              <DropdownMenuItem
                key={empresa.id}
                onClick={() =>
                  startTransition(() => {
                    setEmpresaAtiva(empresa.id)
                  })
                }
                className="gap-2"
              >
                {empresa.nomeFantasia || empresa.razaoSocial}
                {empresa.id === empresaAtiva.id && (
                  <Check className={cn("ml-auto size-4")} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
