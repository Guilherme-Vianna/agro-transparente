import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const connectionString = process.env.DATABASE_URL!
const schema = new URL(connectionString).searchParams.get("schema") ?? undefined
const adapter = new PrismaPg({ connectionString }, schema ? { schema } : undefined)
const prisma = new PrismaClient({ adapter })

async function main() {
  const senhaHash = await bcrypt.hash("admin", 10)

  await prisma.usuario.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      senha: senhaHash,
      isAdmin: true,
    },
  })

  console.log("Usuário admin seedado: admin@admin.com / admin")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
