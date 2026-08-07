"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  criarUsuarioSchema,
  atualizarUsuarioSchema,
  type CriarUsuarioInput,
  type AtualizarUsuarioInput,
} from "@/schemas/usuario.schema"
import { createUsuario, updateUsuario } from "@/actions/usuario.actions"

type Empresa = { id: number; razaoSocial: string; nomeFantasia: string | null }

type FormValues = CriarUsuarioInput | AtualizarUsuarioInput

export function UsuarioForm({
  empresas,
  usuario,
}: {
  empresas: Empresa[]
  usuario?: {
    id: number
    email: string
    isAdmin: boolean
    empresaIds: number[]
  }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(usuario ? atualizarUsuarioSchema : criarUsuarioSchema),
    defaultValues: {
      email: usuario?.email ?? "",
      senha: "",
      isAdmin: usuario?.isAdmin ?? false,
      empresaIds: usuario?.empresaIds ?? [],
    },
  })

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      try {
        if (usuario) {
          await updateUsuario(usuario.id, data)
          toast.success("Usuário atualizado com sucesso")
        } else {
          await createUsuario(data as CriarUsuarioInput)
          toast.success("Usuário criado com sucesso")
        }
        router.push("/usuarios")
        router.refresh()
      } catch {
        toast.error("Não foi possível salvar o usuário")
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{usuario ? "Nova senha" : "Senha *"}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  {usuario && (
                    <FormDescription>Deixe em branco para manter a senha atual.</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Administrador</FormLabel>
                    <FormDescription>
                      Administradores têm acesso a todas as empresas e podem gerenciar usuários.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="empresaIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresas vinculadas</FormLabel>
                  <FormDescription>
                    Selecione as empresas que este usuário pode acessar.
                  </FormDescription>
                  <div className="flex flex-col gap-2 rounded-lg border p-3">
                    {empresas.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma empresa cadastrada ainda.
                      </p>
                    )}
                    {empresas.map((empresa) => {
                      const checked = field.value.includes(empresa.id)
                      return (
                        <div key={empresa.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`empresa-${empresa.id}`}
                            checked={checked}
                            onCheckedChange={(value) => {
                              if (value) {
                                field.onChange([...field.value, empresa.id])
                              } else {
                                field.onChange(field.value.filter((id) => id !== empresa.id))
                              }
                            }}
                          />
                          <label htmlFor={`empresa-${empresa.id}`} className="text-sm">
                            {empresa.nomeFantasia || empresa.razaoSocial}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/usuarios")}>
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
