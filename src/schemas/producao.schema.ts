import { z } from "zod"

export const producaoSchema = z
  .object({
    produtoId: z.number().int().positive("Selecione um produto"),
    numeroLote: z.string().min(1, "Número do lote é obrigatório"),
    dataPlantio: z.string().optional().or(z.literal("")),
    dataColheita: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.dataPlantio || !data.dataColheita) return true
      return new Date(data.dataColheita) >= new Date(data.dataPlantio)
    },
    {
      message: "A data de colheita não pode ser anterior à data de plantio",
      path: ["dataColheita"],
    }
  )

export type ProducaoInput = z.infer<typeof producaoSchema>
