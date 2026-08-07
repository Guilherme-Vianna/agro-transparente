"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppError({ error }: { error: Error & { digest?: string } }) {
  const isUnauthorized = error.name === "UnauthorizedError"

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">
        {isUnauthorized ? "Acesso não autorizado" : "Algo deu errado"}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isUnauthorized
          ? error.message || "Você não tem permissão para acessar esta página."
          : "Ocorreu um erro inesperado. Tente novamente."}
      </p>
      <Button asChild>
        <Link href="/dashboard">Voltar ao dashboard</Link>
      </Button>
    </div>
  )
}
