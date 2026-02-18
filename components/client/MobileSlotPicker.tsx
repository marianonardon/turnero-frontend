"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, ChevronLeft, ChevronDown, ChevronUp, Info } from "lucide-react"
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
  const [collapsedCourts, setCollapsedCourts] = useState<Set<string>>(new Set())

  // Agrupar slots por hora → { "09:00": [{ court, slot }, ...] }
  const slotsByTime = new Map<string, Array<{ court: Professional; slot: TimeSlot }>>()
  courtSlots.forEach(({ court, slots }) => {
    slots.filter(s => s.available).forEach(slot => {
      if (!slotsByTime.has(slot.time)) slotsByTime.set(slot.time, [])
      slotsByTime.get(slot.time)!.push({ court, slot })
    })
  })
  const sortedTimes = Array.from(slotsByTime.keys()).sort()

  // Agrupar por cancha para el horario seleccionado
  const courtGroupsForTime = (() => {
    if (!selectedTime) return []
    const entries = slotsByTime.get(selectedTime) ?? []
    const map = new Map<string, { court: Professional; slots: TimeSlot[] }>()
    entries.forEach(({ court, slot }) => {
      if (!map.has(court.id)) map.set(court.id, { court, slots: [] })
      map.get(court.id)!.slots.push(slot)
    })
    // Ordenar slots por duración dentro de cada cancha
    map.forEach(group => group.slots.sort((a, b) => a.duration - b.duration))
    return Array.from(map.values())
  })()

  const toggleCourt = (courtId: string) => {
    setCollapsedCourts(prev => {
      const next = new Set(prev)
      if (next.has(courtId)) next.delete(courtId)
      else next.add(courtId)
      return next
    })
  }

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
        /* PASO 2: Canchas con cards de precio/duración */
        <div className="px-4 space-y-3">
          <p className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1">
            Reservar una cancha
          </p>
          <p className="text-xs text-white/40 -mt-2 mb-3">
            Seleccioná una cancha según duración y/o precio
          </p>

          {courtGroupsForTime.map(({ court, slots }) => {
            const isCollapsed = collapsedCourts.has(court.id)
            const courtDescription = [court.bio].filter(Boolean).join(' | ')

            return (
              <div key={court.id} className="bg-white rounded-2xl overflow-hidden shadow-md">
                {/* Header de la cancha */}
                <button
                  onClick={() => toggleCourt(court.id)}
                  className="w-full flex items-start justify-between p-4 text-left active:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="text-lg font-bold text-gray-900 leading-tight">
                      {court.firstName}{court.lastName ? ` ${court.lastName}` : ""}
                    </div>
                    {courtDescription && (
                      <div className="text-sm text-gray-500 mt-0.5 leading-snug">
                        {courtDescription}
                      </div>
                    )}
                  </div>
                  {isCollapsed
                    ? <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    : <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  }
                </button>

                {/* Cards de opciones de precio/duración */}
                {!isCollapsed && (
                  <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                    {slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.courtId === court.id &&
                        selectedSlot?.time === slot.time
                      return (
                        <button
                          key={slot.duration}
                          onClick={() => onSelectSlot(court, slot)}
                          className={cn(
                            "flex flex-col items-center justify-center py-4 px-3 rounded-xl",
                            "transition-all duration-150 active:scale-95",
                            isSelected
                              ? "bg-[#0a4d8c] text-white shadow-lg ring-2 ring-[#0a4d8c]"
                              : "bg-[#c8f5c8] text-[#1a6b3a] hover:bg-[#b2edb2]"
                          )}
                        >
                          <span className="text-2xl font-bold tabular-nums leading-tight">
                            ${Number(slot.price).toLocaleString('es-AR')}
                          </span>
                          <span className="text-sm font-medium mt-1 opacity-80">
                            {slot.duration} min
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold mt-1.5 bg-white/20 px-2 py-0.5 rounded-full">
                              ✓ Seleccionada
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
