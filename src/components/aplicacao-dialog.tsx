"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { aplicacaoSchema, type AplicacaoInput } from "@/schemas/aplicacao.schema"
import { addAplicacao, updateAplicacao } from "@/actions/aplicacao.actions"

export function AplicacaoDialog({
  producaoId,
  aplicacao,
}: {
  producaoId: number
  aplicacao?: AplicacaoInput & { id: number }
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<AplicacaoInput>({
    resolver: zodResolver(aplicacaoSchema),
    defaultValues: {
      tipo: aplicacao?.tipo ?? "",
      produtoUtilizado: aplicacao?.produtoUtilizado ?? "",
      dose: aplicacao?.dose ?? "",
      dataAplicacao: aplicacao?.dataAplicacao ?? "",
      periodoCarenciaDias: aplicacao?.periodoCarenciaDias ?? "",
    },
  })

  async function onSubmit(data: AplicacaoInput) {
    setIsPending(true)
    try {
      if (aplicacao) {
        await updateAplicacao(aplicacao.id, producaoId, data)
        toast.success("Aplicação atualizada com sucesso")
      } else {
        await addAplicacao(producaoId, data)
        toast.success("Aplicação registrada com sucesso")
      }
      setOpen(false)
      form.reset()
      router.refresh()
    } catch {
      toast.error("Não foi possível salvar a aplicação")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {aplicacao ? (
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> Adicionar aplicação
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{aplicacao ? "Editar aplicação" : "Nova aplicação"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Adubação, Defensivo, Irrigação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="produtoUtilizado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto utilizado</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dose</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2L/ha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodoCarenciaDias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carência (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dataAplicacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de aplicação</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
