"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/lib/auth"

export type LoginActionState = { error?: string } | undefined

export async function authenticate(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      senha: formData.get("senha"),
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Email ou senha inválidos." }
      }
      return { error: "Não foi possível fazer login. Tente novamente." }
    }
    throw error
  }
}
