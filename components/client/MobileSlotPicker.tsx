"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, ChevronLeft, Info, CheckCircle2 } from "lucide-react"
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
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Agrupar slots por hora → { "09:00": [{ court, slot }, ...] }
  const slotsByTime = new Map<string, Array<{ court: Professional; slot: TimeSlot }>>()
  courtSlots.forEach(({ court, slots }) => {
    slots.filter(s => s.available).forEach(slot => {
      if (!slotsByTime.has(slot.time)) slotsByTime.set(slot.time, [])
      slotsByTime.get(slot.time)!.push({ court, slot })
    })
  })
  const sortedTimes = Array.from(slotsByTime.keys()).sort()

  const courtsForSelectedTime = selectedTime ? (slotsByTime.get(selectedTime) ?? []) : []

  if (sortedTimes.length === 0) {
    return (
      <Card className="border-dashed mx-4">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No hay horarios disponibles</p>
          <p className="text-sm text-gray-400 mt-1">Intenta con otra fecha</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="pb-6">
      {/* Header fecha */}
      <div className="sticky top-0 bg-gradient-to-r from-[#0a4d8c] to-[#1a6fc2] text-white px-4 py-3 shadow-md z-10 mb-4">
        <div className="text-sm font-medium capitalize">
          {format(date, "EEEE d 'de' MMMM", { locale: es })}
        </div>
        {!selectedTime ? (
          <div className="text-xs opacity-70 mt-0.5">
            {sortedTimes.length} horarios disponibles · Elegí uno para ver canchas
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={() => setSelectedTime(null)}
              className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100 active:opacity-60 transition-opacity"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Cambiar horario
            </button>
            <span className="text-xs opacity-40">·</span>
            <span className="text-xs font-semibold text-[#ccff00]">{selectedTime}</span>
          </div>
        )}
      </div>

      {!selectedTime ? (
        /* PASO 1: Grilla de horarios */
        <div className="px-4">
          <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-3">
            Seleccioná un horario
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {sortedTimes.map((time) => {
              const count = slotsByTime.get(time)!.length
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "flex flex-col items-center justify-center py-3.5 px-2 rounded-xl",
                    "bg-white/10 border border-white/20 backdrop-blur-sm",
                    "active:scale-95 transition-all duration-150",
                    "hover:bg-white/20 hover:border-white/40"
                  )}
                >
                  <span className="text-xl font-bold text-white tabular-nums">{time}</span>
                  <span className="text-[10px] text-white/60 mt-0.5">
                    {count} {count === 1 ? 'cancha' : 'canchas'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* PASO 2: Canchas disponibles para el horario seleccionado */
        <div className="px-4 space-y-3">
          <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">
            Canchas disponibles a las {selectedTime}
          </p>

          {courtsForSelectedTime.map(({ court, slot }) => {
            const isSelected =
              selectedSlot?.courtId === court.id &&
              selectedSlot?.time === slot.time

            return (
              <button
                key={court.id}
                onClick={() => onSelectSlot(court, slot)}
                className={cn(
                  "w-full text-left rounded-2xl overflow-hidden transition-all duration-200",
                  "active:scale-[0.98]",
                  isSelected
                    ? "ring-2 ring-[#ccff00] shadow-lg shadow-[#ccff00]/20"
                    : "shadow-md hover:shadow-xl"
                )}
              >
                <div className={cn(
                  "p-4 flex items-center justify-between gap-4 bg-white",
                  isSelected && "bg-[#ccff00]/10"
                )}>
                  {/* Info de la cancha */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#0a4d8c]/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-[#0a4d8c]">
                          {court.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#0a4d8c] text-base truncate leading-tight">
                          {court.firstName}
                          {court.lastName ? ` ${court.lastName}` : ""}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{slot.service.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5 ml-12">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {slot.duration} min
                      </span>
                      <span className="text-xs text-gray-400">
                        {slot.time} → {slot.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Precio + CTA */}
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-[#0a4d8c] tabular-nums leading-tight">
                      ${Number(slot.price).toLocaleString('es-AR')}
                    </div>
                    {isSelected ? (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-semibold text-green-600">Seleccionada</span>
                      </div>
                    ) : (
                      <div className="mt-1 bg-[#0a4d8c] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Reservar
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
