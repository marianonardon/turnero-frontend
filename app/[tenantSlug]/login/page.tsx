"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { CustomerAuthProvider, useCustomerAuth } from "@/lib/context/CustomerAuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle2 } from "lucide-react"

function LoginForm() {
  const { login } = useCustomerAuth()
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(formData.email, formData.firstName, formData.lastName, formData.phone)
      setEmailSent(true)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Error al enviar el email. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle>Revisá tu email</CardTitle>
          <CardDescription>
            Te enviamos un link mágico a <strong>{formData.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-600">
          <p>El link expira en 15 minutos.</p>
          <p className="mt-2">No encontrás el email? Revisá la carpeta de spam.</p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              setEmailSent(false)
              setFormData({ email: "", firstName: "", lastName: "", phone: "" })
            }}
          >
            Volver a intentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Accedé a tus reservas</CardTitle>
        <CardDescription>
          Ingresá tus datos para recibir un link de acceso por email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Juan"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Pérez"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+54 9 11 1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              "Enviando..."
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar link por email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function CustomerLoginPage() {
  return (
    <CustomerAuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </CustomerAuthProvider>
  )
}
