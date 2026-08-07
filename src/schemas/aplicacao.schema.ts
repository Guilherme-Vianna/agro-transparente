import { z } from "zod"

export const aplicacaoSchema = z.object({
  tipo: z.string().min(1, "Tipo é obrigatório"),
  produtoUtilizado: z.string().optional().or(z.literal("")),
  dose: z.string().optional().or(z.literal("")),
  dataAplicacao: z.string().optional().or(z.literal("")),
  periodoCarenciaDias: z.string().optional().or(z.literal("")),
})

export type AplicacaoInput = z.infer<typeof aplicacaoSchema>
