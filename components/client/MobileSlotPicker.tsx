"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Service, Professional } from "@/lib/api/types"

interface TimeSlot {
  time: string
  endTime: string
  duration: number
  price: number
  available: boolean
  service: Service
}

interface CourtSlots {
  court: Professional
  slots: TimeSlot[]
}

interface MobileSlotPickerProps {
  date: Date
  courtSlots: CourtSlots[]
  onSelectSlot: (court: Professional, slot: TimeSlot) => void
  selectedSlot?: { courtId: string; time: string } | null
}

export function MobileSlotPicker({
  date,
  courtSlots,
  onSelectSlot,
  selectedSlot
}: MobileSlotPickerProps) {
  const [expandedCourtId, setExpandedCourtId] = useState<string | null>(
    courtSlots[0]?.court.id || null
  )

  // Agrupar slots por hora para mostrar todas las canchas disponibles a cada hora
  const slotsByTime = new Map<string, Array<{ court: Professional; slot: TimeSlot }>>()

  courtSlots.forEach(({ court, slots }) => {
    slots.filter(s => s.available).forEach(slot => {
      if (!slotsByTime.has(slot.time)) {
        slotsByTime.set(slot.time, [])
      }
      slotsByTime.get(slot.time)!.push({ court, slot })
    })
  })

  const sortedTimes = Array.from(slotsByTime.keys()).sort()

  return (
    <div className="space-y-3 pb-4">
      {/* Header sticky */}
      <div className="sticky top-0 bg-gradient-to-r from-[#0a4d8c] to-[#1a6fc2] text-white px-4 py-3 rounded-lg shadow-md z-10 mb-2">
        <div className="text-sm font-medium opacity-90">
          {format(date, "EEEE d 'de' MMMM", { locale: es })}
        </div>
        <div className="text-xs opacity-70 mt-0.5">
          {sortedTimes.length} horarios disponibles
        </div>
      </div>

      {sortedTimes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No hay horarios disponibles</p>
            <p className="text-sm text-gray-400 mt-1">Intenta con otra fecha</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedTimes.map((time) => {
            const courtsAtTime = slotsByTime.get(time)!
            const isExpanded = expandedCourtId ? courtsAtTime.some(c => c.court.id === expandedCourtId) : false

            return (
              <Card
                key={time}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isExpanded ? "ring-2 ring-[#ccff00] shadow-lg" : "hover:shadow-md"
                )}
              >
                <CardContent className="p-0">
                  {/* Header del horario */}
                  <div className="bg-gradient-to-r from-[#0a4d8c] to-[#1565a8] text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold tabular-nums">{time}</div>
                        <div className="text-xs opacity-80">
                          {courtsAtTime.length} {courtsAtTime.length === 1 ? 'cancha' : 'canchas'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                  </div>

                  {/* Lista de canchas para este horario */}
                  <div className="divide-y divide-gray-100">
                    {courtsAtTime.map(({ court, slot }) => {
                      const isSelected =
                        selectedSlot?.courtId === court.id &&
                        selectedSlot?.time === slot.time

                      return (
                        <button
                          key={court.id}
                          onClick={() => onSelectSlot(court, slot)}
                          className={cn(
                            "w-full text-left p-4 transition-all duration-200",
                            isSelected
                              ? "bg-[#ccff00]/20 border-l-4 border-[#ccff00]"
                              : "hover:bg-gray-50 active:bg-gray-100"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            {/* Info de la cancha */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[#0a4d8c] text-base truncate">
                                {court.firstName}
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {court.lastName || slot.service.name}
                              </div>
                              {court.bio && (
                                <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                  {court.bio}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  {slot.duration} min
                                </span>
                                <span className="text-xs text-gray-400">
                                  hasta {slot.endTime}
                                </span>
                              </div>
                            </div>

                            {/* Precio */}
                            <div className="text-right shrink-0">
                              <div className="text-2xl font-bold text-[#0a4d8c] tabular-nums">
                                ${(slot.price / 100).toLocaleString('es-AR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {isSelected ? (
                                  <span className="text-[#ccff00] font-semibold flex items-center gap-1">
                                    ✓ Seleccionado
                                  </span>
                                ) : (
                                  <span>Tocar para reservar</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
