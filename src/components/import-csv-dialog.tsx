"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { parseCsvRecords } from "@/lib/csv"

export function ImportCsvDialog<Row extends Record<string, string>>({
  title,
  description,
  templateHint,
  action,
}: {
  title: string
  description: string
  templateHint: string
  action: (rows: Row[]) => Promise<{ criados: number; erros: string[] }>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ criados: number; erros: string[] } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    setResultado(null)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? "")
      const rows = parseCsvRecords(text) as Row[]
      if (rows.length === 0) {
        toast.error("Nenhuma linha válida encontrada no arquivo")
        return
      }
      startTransition(async () => {
        try {
          const resultado = await action(rows)
          setResultado(resultado)
          if (resultado.criados > 0) {
            toast.success(`${resultado.criados} registro(s) importado(s)`)
            router.refresh()
          }
          if (resultado.erros.length > 0) {
            toast.error(`${resultado.erros.length} linha(s) com erro`)
          }
        } catch {
          toast.error("Não foi possível importar o arquivo")
        }
      })
    }
    reader.readAsText(file, "utf-8")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setFileName(null)
          setResultado(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload /> Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{templateHint}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          {fileName ?? "Selecionar arquivo CSV"}
        </Button>

        {isPending && <p className="text-sm text-muted-foreground">Importando...</p>}

        {resultado && (
          <div className="flex flex-col gap-2 rounded-md border p-3 text-sm">
            <p>{resultado.criados} registro(s) importado(s) com sucesso.</p>
            {resultado.erros.length > 0 && (
              <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto text-destructive">
                {resultado.erros.map((erro, i) => (
                  <li key={i}>{erro}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
