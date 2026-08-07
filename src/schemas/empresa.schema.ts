import { z } from "zod"

export const empresaSchema = z.object({
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  inscricaoEstadual: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  logradouro: z.string().optional().or(z.literal("")),
  numero: z.string().optional().or(z.literal("")),
  bairro: z.string().optional().or(z.literal("")),
  municipio: z.string().min(1, "Município é obrigatório"),
  estado: z.string().length(2, "UF deve ter 2 letras"),
  ativo: z.boolean(),
})

export type EmpresaInput = z.infer<typeof empresaSchema>
