"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CustomerAuthProvider, useCustomerAuth } from "@/lib/context/CustomerAuthContext"
import { apiClient } from "@/lib/api/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, MapPin, User, AlertCircle, CheckCircle2, XCircle, LogOut } from "lucide-react"
import { format, isPast, isFuture, differenceInHours } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
  professional: {
    id: string
    firstName: string
    lastName: string
    fullName: string
  }
  createdAt: string
}

function MisReservasContent() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useCustomerAuth()
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [tenant, setTenant] = useState<any>(null)

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${tenantSlug}/login`)
    }
  }, [authLoading, isAuthenticated, router, tenantSlug])

  useEffect(() => {
    const loadAppointments = async () => {
      if (!isAuthenticated) return

      try {
        setIsLoading(true)

        // Cargar tenant info
        const tenantData = await apiClient.get<any>(`/tenants/slug/${tenantSlug}`)
        setTenant(tenantData)

        // Obtener token del localStorage
        const storedUser = localStorage.getItem('customer_user')
        if (!storedUser) {
          router.push(`/${tenantSlug}/login`)
          return
        }

        const userData = JSON.parse(storedUser)

        // Nota: El backend aún no retorna accessToken en el callback,
        // así que por ahora vamos a simular la carga
        // TODO: Implementar JWT en headers una vez que el backend lo soporte

        const data = await apiClient.get<Appointment[]>(`/${tenantSlug}/customer/appointments`)
        setAppointments(data)
      } catch (error: any) {
        console.error("Error loading appointments:", error)
        toast.error("Error al cargar tus reservas")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      loadAppointments()
    }
  }, [isAuthenticated, tenantSlug, router])

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("¿Estás seguro de que querés cancelar esta reserva?")) {
      return
    }

    try {
      setCancelling(appointmentId)
      await apiClient.patch(`/${tenantSlug}/customer/appointments/${appointmentId}/cancel`, {})

      // Actualizar lista local
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: "CANCELLED" as const, cancelledAt: new Date().toISOString() }
            : apt
        )
      )

      toast.success("Reserva cancelada exitosamente")
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      toast.error(error.message || "No se pudo cancelar la reserva")
    } finally {
      setCancelling(null)
    }
  }

  const canCancel = (appointment: Appointment): { can: boolean; reason?: string } => {
    if (appointment.status === "CANCELLED") {
      return { can: false, reason: "Ya fue cancelada" }
    }

    if (appointment.status === "COMPLETED" || appointment.status === "NO_SHOW") {
      return { can: false, reason: "Turno finalizado" }
    }

    const appointmentDate = new Date(appointment.startTime)
    if (isPast(appointmentDate)) {
      return { can: false, reason: "Turno pasado" }
    }

    const hoursUntil = differenceInHours(appointmentDate, new Date())
    const limit = tenant?.cancellationHoursLimit || 24

    if (hoursUntil < limit) {
      return { can: false, reason: `Debe cancelar con ${limit}h de anticipación` }
    }

    return { can: true }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Se redirige en useEffect
  }

  const upcomingAppointments = appointments.filter(
    apt =>
      (apt.status === "CONFIRMED" || apt.status === "PENDING") &&
      isFuture(new Date(apt.startTime))
  )

  const pastAppointments = appointments.filter(
    apt =>
      isPast(new Date(apt.startTime)) ||
      apt.status === "CANCELLED" ||
      apt.status === "COMPLETED" ||
      apt.status === "NO_SHOW"
  )

  const getStatusBadge = (status: Appointment["status"]) => {
    const variants = {
      PENDING: { variant: "secondary" as const, icon: Clock, label: "Pendiente" },
      CONFIRMED: { variant: "default" as const, icon: CheckCircle2, label: "Confirmada", className: "bg-green-500" },
      CANCELLED: { variant: "destructive" as const, icon: XCircle, label: "Cancelada" },
      COMPLETED: { variant: "default" as const, icon: CheckCircle2, label: "Completada", className: "bg-gray-500" },
      NO_SHOW: { variant: "destructive" as const, icon: AlertCircle, label: "No asistió" },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2]">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Mis Reservas</h1>
              <p className="text-sm text-white/60 mt-1">
                Hola, {user?.name || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${tenantSlug}/book`)}
                className="text-white hover:bg-white/10"
              >
                Nueva reserva
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Próximas reservas */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximas Reservas
          </h2>

          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No tenés reservas próximas</p>
                <Button
                  onClick={() => router.push(`/${tenantSlug}/book`)}
                  className="mt-4 bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c]"
                >
                  Reservar ahora
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map(apt => {
                const cancelCheck = canCancel(apt)
                return (
                  <Card key={apt.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-[#0a4d8c]">
                              {apt.service.name}
                            </h3>
                            {getStatusBadge(apt.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{apt.professional.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="capitalize">
                                {format(new Date(apt.startTime), "EEEE d 'de' MMMM", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {format(new Date(apt.startTime), "HH:mm")} -{" "}
                                {format(new Date(apt.endTime), "HH:mm")} ({apt.service.duration} min)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#0a4d8c]">
                            ${Number(apt.service.price).toLocaleString("es-AR")}
                          </div>
                        </div>
                      </div>

                      {cancelCheck.can ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(apt.id)}
                          disabled={cancelling === apt.id}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {cancelling === apt.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar reserva
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="text-xs text-gray-500 text-center py-2">
                          {cancelCheck.reason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Historial */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historial
            </h2>

            <div className="space-y-3">
              {pastAppointments.map(apt => (
                <Card key={apt.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {apt.service.name}
                          </h3>
                          {getStatusBadge(apt.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span className="capitalize">
                              {format(new Date(apt.startTime), "EEEE d 'de' MMMM", {
                                locale: es,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(apt.startTime), "HH:mm")} -{" "}
                              {format(new Date(apt.endTime), "HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-sm font-semibold text-gray-700">
                        ${Number(apt.service.price).toLocaleString("es-AR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MisReservasPage() {
  return (
    <CustomerAuthProvider>
      <MisReservasContent />
    </CustomerAuthProvider>
  )
}
