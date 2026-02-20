"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Appointment, AppointmentStatus } from "@/lib/api/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, User, Mail, Phone, MapPin, DollarSign, CheckCircle, XCircle } from "lucide-react"
import { useUpdateAppointment } from "@/lib/api/hooks"
import { toast } from "sonner"
import { useState } from "react"
import { PaymentModal } from "./PaymentModal"

interface AppointmentDetailModalProps {
  appointment: Appointment | null
  open: boolean
  onClose: () => void
}

export function AppointmentDetailModal({
  appointment,
  open,
  onClose,
}: AppointmentDetailModalProps) {
  const updateAppointment = useUpdateAppointment()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  if (!appointment) return null

  const startDate = new Date(appointment.startTime)
  const endDate = new Date(appointment.endTime)

  const getStatusBadge = (status: AppointmentStatus) => {
    const variants = {
      CONFIRMED: { variant: "default" as const, label: "Confirmado", color: "bg-green-500" },
      PENDING: { variant: "secondary" as const, label: "Pendiente", color: "bg-yellow-500" },
      CANCELLED: { variant: "destructive" as const, label: "Cancelado", color: "bg-red-500" },
      COMPLETED: { variant: "default" as const, label: "Completado", color: "bg-gray-500" },
      NO_SHOW: { variant: "destructive" as const, label: "No asistió", color: "bg-orange-500" },
    }
    const config = variants[status]
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const handleConfirm = async () => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: { status: AppointmentStatus.CONFIRMED, isConfirmed: true },
      })
      toast.success("Turno confirmado")
      onClose()
    } catch (error: any) {
      toast.error(error?.message || "Error al confirmar turno")
    }
  }

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de cancelar este turno?")) return

    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelledAt: new Date().toISOString(),
          cancelledBy: "admin",
        },
      })
      toast.success("Turno cancelado")
      onClose()
    } catch (error: any) {
      toast.error(error?.message || "Error al cancelar turno")
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalle del Turno</span>
              {getStatusBadge(appointment.status)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cliente */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">Cliente</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>
                    {appointment.customer.firstName} {appointment.customer.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{appointment.customer.email}</span>
                </div>
                {appointment.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{appointment.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancha y Servicio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-gray-700">Cancha</h3>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{appointment.professional.fullName}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-700">Servicio</h3>
                <div>
                  <p className="font-medium">{appointment.service.name}</p>
                  <p className="text-sm text-gray-600">
                    {appointment.service.duration} min - ${appointment.service.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-gray-700">Fecha</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{format(startDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-700">Horario</h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de Pago */}
            {appointment.isPaid && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700">PAGADO</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    ${Number(appointment.totalAmount || 0).toLocaleString("es-AR")}
                  </span>
                </div>
                {appointment.paymentMethod && (
                  <p className="text-sm text-green-600 mt-2">
                    Método: {appointment.paymentMethod}
                  </p>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-4 border-t">
              {appointment.status === "PENDING" && (
                <Button onClick={handleConfirm} className="flex-1 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </Button>
              )}
              {!appointment.isPaid && appointment.status !== "CANCELLED" && (
                <Button
                  onClick={() => {
                    onClose()
                    setPaymentModalOpen(true)
                  }}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <DollarSign className="w-4 h-4" />
                  Cobrar
                </Button>
              )}
              {appointment.status !== "CANCELLED" && (
                <Button onClick={handleCancel} variant="destructive" className="flex-1 gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </Button>
              )}
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        appointment={appointment}
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false)
          onClose()
        }}
        onSuccess={() => {
          setPaymentModalOpen(false)
          onClose()
          window.location.reload()
        }}
      />
    </>
  )
}
