"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCustomers, useProfessionals, useServices, useCreateRecurringSeries } from "@/lib/api/hooks"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
]

interface RecurringFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecurringForm({ open, onOpenChange }: RecurringFormProps) {
  const { data: customers } = useCustomers()
  const { data: professionals } = useProfessionals()
  const { data: services } = useServices()
  const createSeries = useCreateRecurringSeries()

  const [formData, setFormData] = useState({
    customerId: "",
    professionalId: "",
    serviceId: "",
    dayOfWeek: "",
    startTime: "",
    weeksAhead: "8",
    seriesStart: format(new Date(), "yyyy-MM-dd"),
    seriesEnd: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId || !formData.professionalId || !formData.serviceId || !formData.dayOfWeek || !formData.startTime) {
      toast.error("Por favor complete todos los campos obligatorios")
      return
    }

    try {
      const result = await createSeries.mutateAsync({
        customerId: formData.customerId,
        professionalId: formData.professionalId,
        serviceId: formData.serviceId,
        dayOfWeek: parseInt(formData.dayOfWeek),
        startTime: formData.startTime,
        weeksAhead: parseInt(formData.weeksAhead),
        seriesStart: formData.seriesStart,
        seriesEnd: formData.seriesEnd || undefined,
      })

      toast.success(`Serie creada: ${result.appointmentsCreated} turnos generados`)
      onOpenChange(false)

      // Reset form
      setFormData({
        customerId: "",
        professionalId: "",
        serviceId: "",
        dayOfWeek: "",
        startTime: "",
        weeksAhead: "8",
        seriesStart: format(new Date(), "yyyy-MM-dd"),
        seriesEnd: "",
      })
    } catch (error: any) {
      console.error("Error creating recurring series:", error)
      toast.error(error.message || "Error al crear la serie recurrente")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Turno Fijo (Recurrente)</DialogTitle>
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

          {/* Día de la semana */}
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Día de la Semana *</Label>
            <Select
              value={formData.dayOfWeek}
              onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar día" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Hora *</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          {/* Semanas adelante */}
          <div className="space-y-2">
            <Label htmlFor="weeksAhead">Cuántas semanas generar adelante *</Label>
            <Input
              id="weeksAhead"
              type="number"
              min="1"
              max="52"
              value={formData.weeksAhead}
              onChange={(e) => setFormData({ ...formData, weeksAhead: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              Se generarán turnos para las próximas {formData.weeksAhead} semanas
            </p>
          </div>

          {/* Fecha de inicio */}
          <div className="space-y-2">
            <Label htmlFor="seriesStart">Fecha de inicio de la serie *</Label>
            <Input
              id="seriesStart"
              type="date"
              value={formData.seriesStart}
              onChange={(e) => setFormData({ ...formData, seriesStart: e.target.value })}
              required
            />
          </div>

          {/* Fecha de fin (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="seriesEnd">Fecha de fin (opcional)</Label>
            <Input
              id="seriesEnd"
              type="date"
              value={formData.seriesEnd}
              onChange={(e) => setFormData({ ...formData, seriesEnd: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Si no se especifica, la serie será indefinida
            </p>
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
            <Button type="submit" disabled={createSeries.isPending}>
              {createSeries.isPending ? "Creando..." : "Crear Serie"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
