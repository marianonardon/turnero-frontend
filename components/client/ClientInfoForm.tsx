"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle } from "lucide-react"
import type { Tenant } from "@/lib/api/types"

// Zod schema para validación robusta
const clientInfoSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),
  lastName: z.string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras"),
  email: z.string()
    .email("Ingresa un email válido (ej: nombre@ejemplo.com)")
    .min(1, "El email es requerido"),
})

type ClientInfo = z.infer<typeof clientInfoSchema>

interface ClientInfoFormProps {
  tenant?: Tenant | null
  onSubmit: (name: string, lastName: string, email: string) => void
  onBack: () => void
}

export function ClientInfoForm({ tenant, onSubmit, onBack }: ClientInfoFormProps) {
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Partial<Record<keyof ClientInfo, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ClientInfo, boolean>>>({})

  const validateField = (field: keyof ClientInfo, value: string) => {
    try {
      clientInfoSchema.shape[field].parse(value)
      setErrors(prev => ({ ...prev, [field]: undefined }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }))
      }
      return false
    }
  }

  const handleBlur = (field: keyof ClientInfo) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const values = { name, lastName, email }
    validateField(field, values[field])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos los campos como touched
    setTouched({ name: true, lastName: true, email: true })

    // Validar todos los campos
    const result = clientInfoSchema.safeParse({ name, lastName, email })

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ClientInfo, string>> = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ClientInfo] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    onSubmit(name.trim(), lastName.trim(), email.trim())
  }

  const showError = (field: keyof ClientInfo) => touched[field] && errors[field]

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4 gap-2"
        style={{
          color: tenant?.primaryColor || '#22c55e',
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      <h2 className="text-2xl font-bold mb-2">👤 Tus Datos</h2>
      <p className="text-gray-600 mb-6">
        Completa tus datos para confirmar la reserva de cancha
      </p>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (touched.name) validateField('name', e.target.value)
            }}
            onBlur={() => handleBlur('name')}
            className={showError('name') ? 'border-red-500' : ''}
            required
          />
          {showError('name') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Tu apellido"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
              if (touched.lastName) validateField('lastName', e.target.value)
            }}
            onBlur={() => handleBlur('lastName')}
            className={showError('lastName') ? 'border-red-500' : ''}
            required
          />
          {showError('lastName') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.lastName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (touched.email) validateField('email', e.target.value)
            }}
            onBlur={() => handleBlur('email')}
            className={showError('email') ? 'border-red-500' : ''}
            required
          />
          {showError('email') ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Te enviaremos la confirmación a este correo
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          style={{
            backgroundColor: tenant?.primaryColor || '#22c55e',
            color: 'white',
          }}
        >
          🎾 Confirmar Reserva
        </Button>
      </form>
    </div>
  )
}


