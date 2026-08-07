"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { produtoSchema, type ProdutoInput } from "@/schemas/produto.schema"
import { createProduto, updateProduto } from "@/actions/produto.actions"

export function ProdutoForm({
  empresaId,
  produto,
}: {
  empresaId: number
  produto?: ProdutoInput & { id: number }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProdutoInput>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: produto?.nome ?? "",
      categoria: produto?.categoria ?? "",
      descricao: produto?.descricao ?? "",
    },
  })

  function onSubmit(data: ProdutoInput) {
    startTransition(async () => {
      try {
        if (produto) {
          await updateProduto(produto.id, data)
          toast.success("Produto atualizado com sucesso")
        } else {
          await createProduto(empresaId, data)
          toast.success("Produto criado com sucesso")
        }
        router.push("/produtos")
        router.refresh()
      } catch {
        toast.error("Não foi possível salvar o produto")
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
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/produtos")}>
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
