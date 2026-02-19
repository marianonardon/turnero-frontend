"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Users, CreditCard, Receipt, CheckCircle2, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Appointment, AppointmentExtra } from "@/lib/api/types"
import { appointmentsApi } from "@/lib/api/endpoints"
import { toast } from "sonner"

interface PaymentModalProps {
  appointment: Appointment | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Extra {
  name: string
  unitPrice: number
  dividedAmong: number
}

export function PaymentModal({ appointment, open, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [extras, setExtras] = useState<Extra[]>([])
  const [newExtra, setNewExtra] = useState<Extra>({ name: "", unitPrice: 0, dividedAmong: 0 })
  const [playerCount, setPlayerCount] = useState(4)
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia" | "qr">("efectivo")
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipt, setReceipt] = useState<{ total: number; perPlayer: number } | null>(null)

  useEffect(() => {
    if (open && appointment) {
      // Reset state cuando se abre el modal
      setStep(1)
      setExtras(appointment.extras?.map(e => ({
        name: e.name,
        unitPrice: Number(e.unitPrice),
        dividedAmong: e.dividedAmong
      })) || [])
      setPlayerCount(appointment.playerCount || 4)
      setPaymentMethod("efectivo")
      setReceipt(null)
    }
  }, [open, appointment])

  if (!appointment) return null

  const servicePrice = Number(appointment.service.price) || 0

  const calculateTotal = () => {
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.unitPrice, 0)
    return servicePrice + extrasTotal
  }

  const calculatePerPlayer = () => {
    const total = calculateTotal()
    return total / playerCount
  }

  const handleAddExtra = () => {
    if (!newExtra.name || newExtra.unitPrice <= 0) {
      toast.error("Ingresa nombre y precio del extra")
      return
    }

    setExtras([...extras, newExtra])
    setNewExtra({ name: "", unitPrice: 0, dividedAmong: 0 })
  }

  const handleRemoveExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      handleProcessPayment()
    }
  }

  const handleProcessPayment = async () => {
    setIsProcessing(true)

    try {
      // 1. Agregar extras al appointment (si hay)
      for (const extra of extras) {
        // Solo agregar si no existía previamente
        const existsInAppointment = appointment.extras?.find(
          e => e.name === extra.name && Number(e.unitPrice) === extra.unitPrice
        )

        if (!existsInAppointment) {
          await appointmentsApi.addExtra(appointment.id, {
            name: extra.name,
            unitPrice: extra.unitPrice,
            dividedAmong: extra.dividedAmong,
          })
        }
      }

      // 2. Marcar como pagado
      await appointmentsApi.pay(appointment.id, {
        playerCount,
        paymentMethod,
      })

      // 3. Calcular recibo
      const total = calculateTotal()
      const perPlayer = calculatePerPlayer()

      setReceipt({ total, perPlayer })
      setStep(3)

      toast.success("Pago registrado exitosamente")
    } catch (error: any) {
      console.error("Error processing payment:", error)
      toast.error(error.message || "Error al procesar el pago")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (step === 3) {
      onSuccess()
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Cobrar Turno
          </DialogTitle>
        </DialogHeader>

        {/* Info del turno */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <p className="font-semibold">{appointment.customer.firstName} {appointment.customer.lastName}</p>
              </div>
              <div>
                <span className="text-gray-600">Cancha:</span>
                <p className="font-semibold">{appointment.professional.fullName}</p>
              </div>
              <div>
                <span className="text-gray-600">Fecha:</span>
                <p className="font-semibold capitalize">
                  {format(new Date(appointment.startTime), "EEEE d/MM", { locale: es })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Horario:</span>
                <p className="font-semibold">
                  {format(new Date(appointment.startTime), "HH:mm")} - {format(new Date(appointment.endTime), "HH:mm")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paso 1: Extras */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Extras (opcional)
              </h3>

              {/* Lista de extras */}
              {extras.length > 0 && (
                <div className="space-y-2 mb-4">
                  {extras.map((extra, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{extra.name}</p>
                        <p className="text-sm text-gray-600">
                          ${extra.unitPrice.toLocaleString("es-AR")}
                          {extra.dividedAmong > 0 && ` (dividido entre ${extra.dividedAmong})`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExtra(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar nuevo extra */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Ej: Pelotas"
                      value={newExtra.name}
                      onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Precio</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newExtra.unitPrice || ""}
                      onChange={(e) => setNewExtra({ ...newExtra, unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Dividir entre (0 = todos los jugadores)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newExtra.dividedAmong || ""}
                    onChange={(e) => setNewExtra({ ...newExtra, dividedAmong: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddExtra}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Extra
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: Resumen + Jugadores + Método de pago */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Resumen del Cobro</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Turno ({appointment.service.name})</span>
                  <span className="font-semibold">${servicePrice.toLocaleString("es-AR")}</span>
                </div>

                {extras.map((extra, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>+ {extra.name}</span>
                    <span className="font-semibold">${extra.unitPrice.toLocaleString("es-AR")}</span>
                  </div>
                ))}

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>TOTAL</span>
                  <span>${calculateTotal().toLocaleString("es-AR")}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Cantidad de jugadores
              </Label>
              <Input
                type="number"
                min="1"
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Por jugador: ${calculatePerPlayer().toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Método de pago</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="efectivo" id="efectivo" />
                  <Label htmlFor="efectivo" className="flex-1 cursor-pointer">Efectivo</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="transferencia" id="transferencia" />
                  <Label htmlFor="transferencia" className="flex-1 cursor-pointer">Transferencia</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="qr" id="qr" />
                  <Label htmlFor="qr" className="flex-1 cursor-pointer">QR / MercadoPago</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Atrás
              </Button>
              <Button
                onClick={handleNext}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Procesando..." : "Confirmar Pago"}
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Ticket */}
        {step === 3 && receipt && (
          <div className="space-y-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-1">¡Pago Registrado!</h3>
              <p className="text-gray-600">El turno fue marcado como pagado</p>
            </div>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total cobrado:</span>
                    <span className="font-bold text-lg">${receipt.total.toLocaleString("es-AR")}</span>
                  </div>

                  <div className="flex justify-between text-sm border-t pt-3">
                    <span>{playerCount} jugadores:</span>
                    <span className="font-semibold">
                      ${receipt.perPlayer.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Método:</span>
                    <span className="font-semibold capitalize">{paymentMethod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleClose} className="w-full bg-green-600 hover:bg-green-700">
              <Receipt className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
