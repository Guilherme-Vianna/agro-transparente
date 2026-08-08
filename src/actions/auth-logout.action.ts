"use server"

import { signOut } from "@/lib/auth"
import { registrarLog } from "@/lib/audit"

export async function logout() {
  await registrarLog({ acao: "logout", entidade: "auth" })
  await signOut({ redirectTo: "/login" })
}
