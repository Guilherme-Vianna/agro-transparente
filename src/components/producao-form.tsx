"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { producaoSchema, type ProducaoInput } from "@/schemas/producao.schema"
import { createProducao, updateProducao } from "@/actions/producao.actions"

function toInputDate(value: Date | string | null | undefined) {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  return date.toISOString().slice(0, 10)
}

export function ProducaoForm({
  produtos,
  producao,
}: {
  produtos: { id: number; nome: string }[]
  producao?: {
    id: number
    produtoId: number
    numeroLote: string
    dataPlantio: Date | string | null
    dataColheita: Date | string | null
  }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProducaoInput>({
    resolver: zodResolver(producaoSchema),
    defaultValues: {
      produtoId: producao?.produtoId ?? 0,
      numeroLote: producao?.numeroLote ?? "",
      dataPlantio: toInputDate(producao?.dataPlantio),
      dataColheita: toInputDate(producao?.dataColheita),
    },
  })

  function onSubmit(data: ProducaoInput) {
    startTransition(async () => {
      try {
        if (producao) {
          await updateProducao(producao.id, data)
          toast.success("Lote atualizado com sucesso")
          router.push(`/producoes/${producao.id}`)
        } else {
          const novo = await createProducao(data)
          toast.success("Lote criado com sucesso")
          router.push(`/producoes/${novo.id}`)
        }
        router.refresh()
      } catch {
        toast.error("Não foi possível salvar o lote")
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="produtoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto *</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={String(produto.id)}>
                          {produto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numeroLote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do lote *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: LT-2026-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dataPlantio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de plantio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataColheita"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de colheita</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/producoes")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
