"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  useProfessionals, 
  useCreateProfessional, 
  useUpdateProfessional, 
  useDeleteProfessional 
} from "@/lib/api/hooks"
import { useServices } from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CreateProfessionalDto, UpdateProfessionalDto } from "@/lib/api/types"

export function ProfessionalsManager() {
  const { data: professionals, isLoading: loadingProfessionals } = useProfessionals()
  const { data: services, isLoading: loadingServices } = useServices()
  const createProfessional = useCreateProfessional()
  const updateProfessional = useUpdateProfessional()
  const deleteProfessional = useDeleteProfessional()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateProfessionalDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    isActive: true,
    serviceIds: [],
  })

  const handleCreate = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('Nombre y apellido son requeridos')
      return
    }

    try {
      await createProfessional.mutateAsync(formData)
      toast.success('Profesional creado exitosamente')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        isActive: true,
        serviceIds: [],
      })
      setIsCreating(false)
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear profesional')
    }
  }

  const handleUpdate = async (id: string, data: UpdateProfessionalDto) => {
    try {
      await updateProfessional.mutateAsync({ id, data })
      toast.success('Profesional actualizado exitosamente')
      setEditingId(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar profesional')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este profesional?')) return

    try {
      await deleteProfessional.mutateAsync(id)
      toast.success('Profesional eliminado exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar profesional')
    }
  }

  const toggleService = (serviceId: string) => {
    const currentIds = formData.serviceIds || []
    if (currentIds.includes(serviceId)) {
      setFormData({
        ...formData,
        serviceIds: currentIds.filter(id => id !== serviceId)
      })
    } else {
      setFormData({
        ...formData,
        serviceIds: [...currentIds, serviceId]
      })
    }
  }

  if (loadingProfessionals || loadingServices) {
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
          <h2 className="text-2xl font-bold">Profesionales</h2>
          <p className="text-gray-600">Administra tu equipo de trabajo</p>
        </div>
        {!isCreating && (
          <Button className="gap-2" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Nuevo Profesional
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <Card className="border" style={{ borderColor: '#6E52FF40', backgroundColor: '#6E52FF20' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Nuevo Profesional</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Carlos"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Mendoza"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="carlos@ejemplo.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Biografía / Especialidad</Label>
              <Input
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Descripción del profesional"
                className="mt-2"
              />
            </div>
            {services && services.length > 0 && (
              <div>
                <Label>Servicios asignados</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge
                      key={service.id}
                      variant={(formData.serviceIds || []).includes(service.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleService(service.id)}
                    >
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createProfessional.isPending}>
                {createProfessional.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Profesional'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de profesionales */}
      {!professionals || professionals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No hay profesionales creados aún</p>
            <Button className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Profesional
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professionals.map((professional) => {
            // Obtener servicios asignados (esto requeriría una relación en el backend)
            // Por ahora, mostramos solo el nombre
            const initials = `${professional.firstName[0]}${professional.lastName[0]}`.toUpperCase()
            
            return (
              <Card key={professional.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={professional.photoUrl || undefined} alt={professional.fullName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{professional.fullName}</CardTitle>
                      {professional.bio && (
                        <p className="text-sm text-gray-600">{professional.bio}</p>
                      )}
                      {!professional.isActive && (
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
                          setEditingId(professional.id)
                          setFormData({
                            firstName: professional.firstName,
                            lastName: professional.lastName,
                            email: professional.email || '',
                            phone: professional.phone || '',
                            bio: professional.bio || '',
                            isActive: professional.isActive,
                            serviceIds: [], // TODO: Obtener servicios asignados
                          })
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(professional.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {professional.email && (
                    <p className="text-sm text-gray-600 mb-2">📧 {professional.email}</p>
                  )}
                  {professional.phone && (
                    <p className="text-sm text-gray-600 mb-2">📞 {professional.phone}</p>
                  )}
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
                <CardTitle>Editar Profesional</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">Nombre *</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Apellido *</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-bio">Biografía</Label>
                <Input
                  id="edit-bio"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-2"
                />
              </div>
              {services && services.length > 0 && (
                <div>
                  <Label>Servicios asignados</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {services.map((service) => (
                      <Badge
                        key={service.id}
                        variant={(formData.serviceIds || []).includes(service.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleService(service.id)}
                      >
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateProfessional.isPending}
                >
                  {updateProfessional.isPending ? (
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
