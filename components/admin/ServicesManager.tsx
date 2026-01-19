"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  useServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService 
} from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import { Plus, Edit, Trash2, Clock, DollarSign, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CreateServiceDto, UpdateServiceDto } from "@/lib/api/types"

export function ServicesManager() {
  const { data: services, isLoading } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateServiceDto>({
    name: '',
    description: '',
    duration: 30,
    price: undefined,
    isActive: true,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.duration) {
      toast.error('Nombre y duración son requeridos')
      return
    }

    try {
      await createService.mutateAsync(formData)
      toast.success('Servicio creado exitosamente')
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: undefined,
        isActive: true,
      })
      setIsCreating(false)
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear servicio')
    }
  }

  const handleUpdate = async (id: string, data: UpdateServiceDto) => {
    try {
      await updateService.mutateAsync({ id, data })
      toast.success('Servicio actualizado exitosamente')
      setEditingId(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar servicio')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return

    try {
      await deleteService.mutateAsync(id)
      toast.success('Servicio eliminado exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar servicio')
    }
  }

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
          <h2 className="text-2xl font-bold">Servicios</h2>
          <p className="text-gray-600">Gestiona los servicios disponibles</p>
        </div>
        {!isCreating && (
          <Button className="gap-2" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Nuevo Servicio
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <Card className="border" style={{ borderColor: '#6E52FF40', backgroundColor: '#6E52FF20' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Nuevo Servicio</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Consulta Médica"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del servicio"
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duración (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createService.isPending}>
                {createService.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Servicio'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de servicios */}
      {!services || services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No hay servicios creados aún</p>
            <Button className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {!service.isActive && (
                      <Badge variant="secondary" className="mt-2">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingId(service.id)
                        setFormData({
                          name: service.name,
                          description: service.description || '',
                          duration: service.duration,
                          price: service.price ? Number(service.price) : undefined,
                          isActive: service.isActive,
                        })
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  {service.price && (
                    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#6E52FF' }}>
                      <DollarSign className="w-4 h-4" />
                      <span>${Number(service.price).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Editar Servicio</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-duration">Duración (minutos) *</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Precio</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateService.isPending}
                >
                  {updateService.isPending ? (
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
