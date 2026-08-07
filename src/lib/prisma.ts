import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// node-postgres ignores a `?schema=` query param, so it must be extracted
// and passed explicitly — otherwise every connection silently falls back to
// the role's default search_path ("public") regardless of the URL.
const connectionString = process.env.DATABASE_URL!
const schema = new URL(connectionString).searchParams.get("schema") ?? undefined

const adapter = new PrismaPg({ connectionString }, schema ? { schema } : undefined)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
