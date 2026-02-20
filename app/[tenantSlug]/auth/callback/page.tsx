"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CustomerAuthProvider, useCustomerAuth } from "@/lib/context/CustomerAuthContext"
import { apiClient } from "@/lib/api/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

function CallbackContent() {
  const { setUser } = useCustomerAuth()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantSlug = params.tenantSlug as string
  const token = searchParams?.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("No se proporcionó un token válido")
      return
    }

    const verifyToken = async () => {
      try {
        console.log("🔐 Verificando token de customer...")

        const response = await apiClient.get<{
          accessToken: string
          user: {
            id: string
            email: string
            name: string
            tenantId: string
            tenant: any
          }
        }>(`/${tenantSlug}/customer/auth/callback?token=${token}`)

        console.log("✅ Token verificado exitosamente")

        // Guardar accessToken en localStorage
        localStorage.setItem('customer_access_token', response.accessToken)

        // Guardar usuario en contexto y localStorage
        setUser(response.user)

        setStatus("success")

        // Redirigir a "Mis reservas" después de 1 segundo
        setTimeout(() => {
          router.push(`/${tenantSlug}/mis-reservas`)
        }, 1000)
      } catch (error: any) {
        console.error("❌ Error verificando token:", error)
        setStatus("error")
        setErrorMessage(
          error.message || "El link expiró o ya fue usado. Solicitá uno nuevo."
        )
      }
    }

    verifyToken()
  }, [token, tenantSlug, setUser, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Verificando acceso...</CardTitle>
              <CardDescription>Espera un momento</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle>¡Acceso confirmado!</CardTitle>
              <CardDescription>Redirigiendo a tus reservas...</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle>Error al verificar</CardTitle>
              <CardDescription className="text-red-600">
                {errorMessage}
              </CardDescription>
            </>
          )}
        </CardHeader>

        {status === "error" && (
          <CardContent className="text-center">
            <Button
              onClick={() => router.push(`/${tenantSlug}/login`)}
              className="w-full"
            >
              Solicitar nuevo link
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default function CustomerAuthCallbackPage() {
  return (
    <CustomerAuthProvider>
      <CallbackContent />
    </CustomerAuthProvider>
  )
}
