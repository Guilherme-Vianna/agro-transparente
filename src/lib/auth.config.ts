import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isOnAppArea =
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/rastreio") &&
        !request.nextUrl.pathname.startsWith("/api/qrcode")

      if (isOnAppArea) {
        if (isLoggedIn) return true
        return false
      }

      if (isLoggedIn && request.nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/dashboard", request.nextUrl))
      }

      return true
    },
  },
  providers: [],
}
