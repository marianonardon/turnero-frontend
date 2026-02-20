"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCustomers, useProfessionals, useServices, useCreateAppointment } from "@/lib/api/hooks"
import { toast } from "sonner"
import { format } from "date-fns"
import { AppointmentStatus } from "@/lib/api/types"

interface CreateAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAppointmentModal({ open, onOpenChange }: CreateAppointmentModalProps) {
  const { data: customers } = useCustomers()
  const { data: professionals } = useProfessionals()
  const { data: services } = useServices()
  const createAppointment = useCreateAppointment()

  const [formData, setFormData] = useState({
    customerId: "",
    professionalId: "",
    serviceId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    status: AppointmentStatus.CONFIRMED,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId || !formData.professionalId || !formData.serviceId || !formData.date || !formData.time) {
      toast.error("Por favor complete todos los campos obligatorios")
      return
    }

    try {
      // Construir fecha y hora en UTC
      const [hours, minutes] = formData.time.split(':').map(Number)
      const [year, month, day] = formData.date.split('-').map(Number)
      const startTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0))

      // Obtener customer data
      const customer = customers?.find(c => c.id === formData.customerId)
      if (!customer) {
        toast.error("Cliente no encontrado")
        return
      }

      await createAppointment.mutateAsync({
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        serviceId: formData.serviceId,
        professionalId: formData.professionalId,
        startTime: startTime.toISOString(),
        status: formData.status,
      })

      toast.success("Turno creado exitosamente")
      onOpenChange(false)

      // Reset form
      setFormData({
        customerId: "",
        professionalId: "",
        serviceId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        status: AppointmentStatus.CONFIRMED,
      })
    } catch (error: any) {
      console.error("Error creating appointment:", error)
      toast.error(error.message || "Error al crear el turno")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Turno Manual</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente *</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData({ ...formData, customerId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cancha */}
          <div className="space-y-2">
            <Label htmlFor="professional">Cancha *</Label>
            <Select
              value={formData.professionalId}
              onValueChange={(value) => setFormData({ ...formData, professionalId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cancha" />
              </SelectTrigger>
              <SelectContent>
                {professionals?.filter((p) => p.isActive).map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Turno */}
          <div className="space-y-2">
            <Label htmlFor="service">Tipo de Turno *</Label>
            <Select
              value={formData.serviceId}
              onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de turno" />
              </SelectTrigger>
              <SelectContent>
                {services?.filter((s) => s.isActive).map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.duration} min) - ${service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as AppointmentStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmado</SelectItem>
                <SelectItem value={AppointmentStatus.PENDING}>Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createAppointment.isPending}>
              {createAppointment.isPending ? "Creando..." : "Crear Turno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
