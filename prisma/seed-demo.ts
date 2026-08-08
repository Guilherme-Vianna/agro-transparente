import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { customAlphabet } from "nanoid"
import { PrismaClient } from "../src/generated/prisma/client"

const connectionString = process.env.DATABASE_URL!
const schema = new URL(connectionString).searchParams.get("schema") ?? undefined
const adapter = new PrismaPg({ connectionString }, schema ? { schema } : undefined)
const prisma = new PrismaClient({ adapter })

const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"
const gerarToken = customAlphabet(alphabet, 12)

const TOTAL_PRODUTOS = 100
const TOTAL_LOTES = 1000

const CATEGORIAS = ["Grãos", "Frutas", "Hortaliças", "Café", "Cana-de-açúcar", "Laticínios", "Legumes"]
const NOMES_BASE = [
  "Soja", "Milho", "Café Arábica", "Café Robusta", "Cana-de-açúcar", "Trigo", "Arroz",
  "Feijão", "Algodão", "Laranja", "Uva", "Maçã", "Banana", "Manga", "Abacaxi",
  "Tomate", "Cebola", "Batata", "Cenoura", "Alface", "Mandioca", "Sorgo", "Aveia",
  "Cacau", "Girassol",
]

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysAgoMax: number) {
  const daysAgo = Math.floor(Math.random() * daysAgoMax)
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - daysAgo)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

async function main() {
  let empresa = await prisma.empresa.findFirst({ orderBy: { id: "asc" } })
  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        razaoSocial: "Fazenda Boa Vista Ltda",
        nomeFantasia: "Fazenda Boa Vista",
        municipio: "Ribeirão Preto",
        estado: "SP",
        ativo: true,
      },
    })
    console.log(`Empresa criada: ${empresa.razaoSocial} (#${empresa.id})`)
  } else {
    console.log(`Usando empresa existente: ${empresa.razaoSocial} (#${empresa.id})`)
  }

  console.log(`Criando ${TOTAL_PRODUTOS} produtos...`)
  const produtosData = Array.from({ length: TOTAL_PRODUTOS }).map((_, i) => ({
    empresaId: empresa.id,
    nome: `${pick(NOMES_BASE)} — Lote ${i + 1}`,
    categoria: pick(CATEGORIAS),
    descricao: "Produto gerado para carga de teste.",
  }))
  await prisma.produto.createMany({ data: produtosData })

  const produtos = await prisma.produto.findMany({
    where: { empresaId: empresa.id },
    orderBy: { id: "desc" },
    take: TOTAL_PRODUTOS,
    select: { id: true },
  })

  console.log(`Criando ${TOTAL_LOTES} lotes de produção...`)
  const timestamp = Date.now().toString(36).toUpperCase()
  const lotesData = Array.from({ length: TOTAL_LOTES }).map((_, i) => {
    const token = gerarToken()
    const dataPlantio = randomDate(365)
    const dataColheita = Math.random() > 0.3 ? randomDate(180) : null
    return {
      produtoId: pick(produtos).id,
      numeroLote: `LT-CARGA-${timestamp}-${String(i + 1).padStart(4, "0")}`,
      dataPlantio,
      dataColheita,
      qrCodeToken: token,
    }
  })

  const BATCH_SIZE = 200
  for (let i = 0; i < lotesData.length; i += BATCH_SIZE) {
    const batch = lotesData.slice(i, i + BATCH_SIZE)
    await prisma.producao.createMany({ data: batch })
    console.log(`  ${Math.min(i + BATCH_SIZE, lotesData.length)}/${lotesData.length} lotes criados`)
  }

  console.log("Carga de dados concluída.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
