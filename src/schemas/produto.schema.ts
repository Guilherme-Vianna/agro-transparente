import { z } from "zod"

export const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.string().optional().or(z.literal("")),
  descricao: z.string().optional().or(z.literal("")),
})

export type ProdutoInput = z.infer<typeof produtoSchema>
