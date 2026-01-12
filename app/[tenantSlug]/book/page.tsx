"use client"

import { ClientBooking } from "@/components/client/ClientBooking"
import { TenantProvider } from "@/lib/context/TenantContext"
import { useParams } from "next/navigation"
import { useTenantBySlug } from "@/lib/api/hooks"
import { useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import { Loader2 } from "lucide-react"

function BookPageContent() {
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string
  const { data: tenant, isLoading } = useTenantBySlug(tenantSlug || '')

  // Configurar tenantId cuando se carga el tenant
  useEffect(() => {
    if (tenant?.id) {
      apiClient.setTenantId(tenant.id)
    }
  }, [tenant])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Negocio no encontrado</h1>
          <p className="text-gray-600">El link que estás buscando no existe</p>
        </div>
      </div>
    )
  }

  return (
    <TenantProvider initialTenantId={tenant.id}>
      <ClientBooking />
    </TenantProvider>
  )
}

export default function BookPage() {
  return <BookPageContent />
}

