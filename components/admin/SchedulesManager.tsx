"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  useSchedules, 
  useCreateSchedule, 
  useUpdateSchedule, 
  useDeleteSchedule 
} from "@/lib/api/hooks"
import { useProfessionals } from "@/lib/api/hooks"
import { Plus, Edit, Trash2, X, Loader2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CreateScheduleDto } from "@/lib/api/types"

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
]

export function SchedulesManager() {
  const { data: schedules, isLoading } = useSchedules()
  const { data: professionals } = useProfessionals()
  const createSchedule = useCreateSchedule()
  const updateSchedule = useUpdateSchedule()
  const deleteSchedule = useDeleteSchedule()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateScheduleDto>({
    professionalId: undefined,
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    isException: false,
  })

  const handleCreate = async () => {
    if (!formData.startTime || !formData.endTime) {
      toast.error('Hora de inicio y fin son requeridas')
      return
    }

    try {
      await createSchedule.mutateAsync(formData)
      toast.success('Horario creado exitosamente')
      setFormData({
        professionalId: undefined,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        isException: false,
      })
      setIsCreating(false)
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear horario')
    }
  }

  const handleUpdate = async (id: string, data: Partial<CreateScheduleDto>) => {
    try {
      await updateSchedule.mutateAsync({ id, data })
      toast.success('Horario actualizado exitosamente')
      setEditingId(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar horario')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return

    try {
      await deleteSchedule.mutateAsync(id)
      toast.success('Horario eliminado exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar horario')
    }
  }

  // Agrupar horarios por día de la semana
  const schedulesByDay = DAYS_OF_WEEK.map(day => ({
    day,
    schedules: schedules?.filter(s => s.dayOfWeek === day.value) || [],
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Horarios de Atención</h2>
          <p className="text-gray-600">Configura los horarios disponibles para reservas</p>
        </div>
        {!isCreating && (
          <Button className="gap-2" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Nuevo Horario
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Nuevo Horario</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="professional">Profesional (opcional)</Label>
                <select
                  id="professional"
                  value={formData.professionalId || ''}
                  onChange={(e) => setFormData({ ...formData, professionalId: e.target.value || undefined })}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Horario Global (todos los profesionales)</option>
                  {professionals?.filter(p => p.isActive).map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.fullName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Si no seleccionas, será un horario global para todos
                </p>
              </div>
              <div>
                <Label htmlFor="dayOfWeek">Día de la Semana *</Label>
                <select
                  id="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Hora de Inicio *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora de Fin *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createSchedule.isPending}>
                {createSchedule.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Horario'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de horarios por día */}
      {!schedules || schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay horarios configurados</p>
            <p className="text-sm text-gray-400 mb-4">
              Los clientes necesitan horarios disponibles para poder reservar turnos
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Horario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedulesByDay.map(({ day, schedules: daySchedules }) => {
            if (daySchedules.length === 0) return null

            return (
              <Card key={day.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{day.label}</span>
                    <Badge variant="secondary">{daySchedules.length} horario(s)</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => {
                      // Usar professional del schedule si viene del backend, sino buscarlo en la lista
                      const scheduleProfessional = schedule.professional || 
                        professionals?.find(p => p.id === schedule.professionalId)
                      
                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            {scheduleProfessional ? (
                              <Badge variant="outline">
                                {scheduleProfessional.fullName}
                              </Badge>
                            ) : (
                              <Badge variant="default">Global</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingId(schedule.id)
                                setFormData({
                                  professionalId: schedule.professionalId || undefined,
                                  dayOfWeek: schedule.dayOfWeek,
                                  startTime: schedule.startTime,
                                  endTime: schedule.endTime,
                                  isException: schedule.isException,
                                })
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de edición */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Editar Horario</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-professional">Profesional</Label>
                  <select
                    id="edit-professional"
                    value={formData.professionalId || ''}
                    onChange={(e) => setFormData({ ...formData, professionalId: e.target.value || undefined })}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Horario Global</option>
                    {professionals?.filter(p => p.isActive).map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-dayOfWeek">Día</Label>
                  <select
                    id="edit-dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startTime">Hora Inicio</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endTime">Hora Fin</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateSchedule.isPending}
                >
                  {updateSchedule.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

