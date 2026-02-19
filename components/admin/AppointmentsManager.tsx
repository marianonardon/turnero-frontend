"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  useAppointments,
  useUpdateAppointment,
  useDeleteAppointment,
  useCancelRecurringSeries,
  useCancelRecurringSeriesFrom,
} from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  Repeat,
  Plus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AppointmentStatus, Appointment } from "@/lib/api/types"
import { PaymentModal } from "./PaymentModal"
import { RecurringForm } from "./RecurringForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AppointmentsManager() {
  const { data: appointments, isLoading } = useAppointments()
  const updateAppointment = useUpdateAppointment()
  const deleteAppointment = useDeleteAppointment()
  const cancelRecurringSeries = useCancelRecurringSeries()
  const cancelRecurringSeriesFrom = useCancelRecurringSeriesFrom()

  const [searchTerm, setSearchTerm] = useState("")
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [recurringFormOpen, setRecurringFormOpen] = useState(false)
  const [cancelRecurringDialogOpen, setCancelRecurringDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)

  const getStatusBadge = (status: AppointmentStatus) => {
    const variants = {
      CONFIRMED: { variant: "default" as const, label: "Confirmado", icon: CheckCircle },
      PENDING: { variant: "secondary" as const, label: "Pendiente", icon: Clock },
      CANCELLED: { variant: "destructive" as const, label: "Cancelado", icon: XCircle },
      COMPLETED: { variant: "default" as const, label: "Completado", icon: CheckCircle },
      NO_SHOW: { variant: "destructive" as const, label: "No asistió", icon: XCircle },
    }
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleConfirm = async (id: string) => {
    try {
      await updateAppointment.mutateAsync({
        id,
        data: { status: AppointmentStatus.CONFIRMED, isConfirmed: true },
      })
      toast.success('Turno confirmado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al confirmar turno')
    }
  }

  const handleCancel = (appointment: Appointment) => {
    // Si es un turno recurrente, mostrar diálogo de opciones
    if (appointment.recurringSeriesId) {
      setAppointmentToCancel(appointment)
      setCancelRecurringDialogOpen(true)
    } else {
      // Turno normal, cancelar directamente
      handleCancelSingle(appointment.id)
    }
  }

  const handleCancelSingle = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar este turno?')) return

    try {
      await updateAppointment.mutateAsync({
        id,
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelledAt: new Date().toISOString(),
          cancelledBy: 'admin',
        },
      })
      toast.success('Turno cancelado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al cancelar turno')
    }
  }

  const handleCancelRecurringOption = async (option: 'single' | 'all' | 'from') => {
    if (!appointmentToCancel) return

    try {
      if (option === 'single') {
        // Cancelar solo este turno
        await updateAppointment.mutateAsync({
          id: appointmentToCancel.id,
          data: {
            status: AppointmentStatus.CANCELLED,
            cancelledAt: new Date().toISOString(),
            cancelledBy: 'admin',
          },
        })
        toast.success('Turno cancelado')
      } else if (option === 'all') {
        // Cancelar toda la serie
        await cancelRecurringSeries.mutateAsync(appointmentToCancel.recurringSeriesId!)
        toast.success('Serie completa cancelada')
      } else if (option === 'from') {
        // Cancelar desde esta fecha
        const fromDate = format(new Date(appointmentToCancel.startTime), 'yyyy-MM-dd')
        await cancelRecurringSeriesFrom.mutateAsync({
          seriesId: appointmentToCancel.recurringSeriesId!,
          fromDate,
        })
        toast.success('Serie cancelada desde esta fecha')
      }

      setCancelRecurringDialogOpen(false)
      setAppointmentToCancel(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al cancelar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return

    try {
      await deleteAppointment.mutateAsync(id)
      toast.success('Turno eliminado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar turno')
    }
  }

  const handleOpenPayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setPaymentModalOpen(true)
  }

  // Eliminar turnos duplicados basándose en una combinación única de campos
  // Usar un Map para mejor rendimiento y garantizar unicidad
  type AppointmentType = NonNullable<typeof appointments>[number]
  const appointmentsMap = new Map<string, AppointmentType>()
  
  appointments?.forEach((appointment) => {
    // Crear una clave única basada en: customer, service, professional, startTime (redondeado a minuto)
    const startTime = new Date(appointment.startTime)
    const roundedTime = new Date(startTime)
    roundedTime.setSeconds(0, 0) // Redondear a minutos para capturar duplicados cercanos
    
    const uniqueKey = `${appointment.customerId}-${appointment.serviceId}-${appointment.professionalId}-${roundedTime.toISOString()}`
    
    // Si no existe un turno con esta clave, agregarlo
    // Si existe, mantener el primero (más antiguo)
    if (!appointmentsMap.has(uniqueKey)) {
      appointmentsMap.set(uniqueKey, appointment)
    } else {
      // Si ya existe, mantener el que tenga el ID más antiguo (menor)
      const existing = appointmentsMap.get(uniqueKey)!
      if (appointment.id < existing.id) {
        appointmentsMap.set(uniqueKey, appointment)
      }
    }
  })
  
  const uniqueAppointments = Array.from(appointmentsMap.values())

  const filteredAppointments = uniqueAppointments.filter((appointment) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      appointment.customer.firstName.toLowerCase().includes(search) ||
      appointment.customer.lastName.toLowerCase().includes(search) ||
      appointment.service.name.toLowerCase().includes(search) ||
      appointment.professional.fullName.toLowerCase().includes(search)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Turnos</h2>
          <p className="text-gray-600">Administra todos los turnos agendados</p>
        </div>
        <Button onClick={() => setRecurringFormOpen(true)} className="gap-2">
          <Repeat className="w-4 h-4" />
          Crear turno fijo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, servicio, profesional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Turnos ({filteredAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No se encontraron turnos' : 'No hay turnos agendados aún'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const startDate = new Date(appointment.startTime)
                  const endDate = new Date(appointment.endTime)
                  
                  return (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.customer.firstName} {appointment.customer.lastName}
                      </TableCell>
                      <TableCell>{appointment.service.name}</TableCell>
                      <TableCell>{appointment.professional.fullName}</TableCell>
                      <TableCell>
                        {format(startDate, "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(appointment.status)}
                          {appointment.recurringSeriesId && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 gap-1">
                              <Repeat className="w-3 h-3" />
                              FIJO
                            </Badge>
                          )}
                          {appointment.isPaid && (
                            <Badge variant="default" className="bg-green-600 gap-1">
                              <DollarSign className="w-3 h-3" />
                              PAGADO ${Number(appointment.totalAmount || 0).toLocaleString("es-AR")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => handleConfirm(appointment.id)}>
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            {!appointment.isPaid && appointment.status !== 'CANCELLED' && (
                              <DropdownMenuItem onClick={() => handleOpenPayment(appointment)}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Cobrar
                              </DropdownMenuItem>
                            )}
                            {appointment.status !== 'CANCELLED' && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleCancel(appointment)}
                              >
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(appointment.id)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentModal
        appointment={selectedAppointment}
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false)
          setSelectedAppointment(null)
        }}
        onSuccess={() => {
          setPaymentModalOpen(false)
          setSelectedAppointment(null)
          // Refrescar la lista
          window.location.reload()
        }}
      />

      <RecurringForm
        open={recurringFormOpen}
        onOpenChange={setRecurringFormOpen}
      />

      <AlertDialog open={cancelRecurringDialogOpen} onOpenChange={setCancelRecurringDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar turno recurrente</AlertDialogTitle>
            <AlertDialogDescription>
              Este turno pertenece a una serie recurrente. ¿Qué deseas hacer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => {
              setCancelRecurringDialogOpen(false)
              setAppointmentToCancel(null)
            }}>
              Volver
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => handleCancelRecurringOption('single')}
            >
              Solo este turno
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCancelRecurringOption('from')}
            >
              Desde esta fecha
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCancelRecurringOption('all')}
            >
              Toda la serie
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
