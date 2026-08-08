"use client"

import { Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function QrCodeLinkActions({ link }: { link: string }) {
  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Link copiado")
    } catch {
      toast.error("Não foi possível copiar o link")
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button variant="outline" size="sm" className="w-full whitespace-nowrap" onClick={copiarLink}>
        <Copy /> Copiar link
      </Button>
      <Button variant="outline" size="sm" className="w-full whitespace-nowrap" asChild>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <ExternalLink /> Abrir
        </a>
      </Button>
    </div>
  )
}
