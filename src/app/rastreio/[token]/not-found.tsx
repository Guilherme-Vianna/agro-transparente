import Link from "next/link"
import { PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RastreioNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <PackageSearch className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Lote não encontrado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Verifique se o QR code foi lido corretamente ou entre em contato com o produtor.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
