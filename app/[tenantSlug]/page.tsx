"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Phone, Mail, ArrowRight, Loader2 } from "lucide-react"
import { useTenantBySlug } from "@/lib/api/hooks"
import Link from "next/link"

export default function TenantLandingPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params?.tenantSlug as string
  const { data: tenant, isLoading } = useTenantBySlug(tenantSlug || '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Negocio no encontrado</h1>
          <p className="text-gray-600">El link que estás buscando no existe</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: tenant.primaryColor + '20' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {tenant.logoUrl && (
              <img src={tenant.logoUrl} alt={tenant.name} className="h-12 w-auto" />
            )}
            <div>
              <h1 className="text-3xl font-bold" style={{ color: tenant.primaryColor }}>
                {tenant.name}
              </h1>
              {tenant.email && (
                <p className="text-gray-600 mt-1">{tenant.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: tenant.primaryColor + '20' }}
          >
            <Calendar
              className="w-12 h-12"
              style={{ color: tenant.primaryColor }}
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Reserva tu Turno Online
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Agenda tu cita de forma rápida y sencilla. Disponible 24/7.
          </p>
          <Link href={`/${tenantSlug}/book`}>
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              style={{
                backgroundColor: tenant.primaryColor,
                color: 'white',
              }}
            >
              Reservar Turno Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Info Cards */}
      {tenant.phone && (
        <section className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tenant.phone && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Phone
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: tenant.primaryColor }}
                  />
                  <h3 className="font-semibold mb-2">Teléfono</h3>
                  <p className="text-sm text-gray-600">{tenant.phone}</p>
                </CardContent>
              </Card>
            )}

            {tenant.email && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Mail
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: tenant.primaryColor }}
                  />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-sm text-gray-600">{tenant.email}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
