import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/schemas/usuario.schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        senha: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email },
        })
        if (!usuario) {
          await prisma.auditLog.create({
            data: { acao: "login_falhou", entidade: "auth", detalhes: { email: parsed.data.email } },
          })
          return null
        }

        const senhaValida = await bcrypt.compare(parsed.data.senha, usuario.senha)
        if (!senhaValida) {
          await prisma.auditLog.create({
            data: {
              acao: "login_falhou",
              entidade: "auth",
              usuarioId: usuario.id,
              usuarioEmail: usuario.email,
              detalhes: { email: parsed.data.email },
            },
          })
          return null
        }

        return {
          id: String(usuario.id),
          email: usuario.email,
          isAdmin: usuario.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as { isAdmin: boolean }).isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.auditLog.create({
        data: {
          acao: "login",
          entidade: "auth",
          usuarioId: user.id ? Number(user.id) : null,
          usuarioEmail: user.email,
        },
      })
    },
  },
})
