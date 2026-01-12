"use client"

import { useState } from "react"
import { ServiceSelection } from "./ServiceSelection"
import { ProfessionalSelection } from "./ProfessionalSelection"
import { DateTimeSelection } from "./DateTimeSelection"
import { ClientInfoForm } from "./ClientInfoForm"
import { BookingConfirmation } from "./BookingConfirmation"
import { Progress } from "@/components/ui/progress"
import type { Service, Professional } from "@/lib/api/types"

export type BookingStep =
  | "service"
  | "professional"
  | "datetime"
  | "info"
  | "confirmation"

export interface BookingData {
  service?: Service
  professional?: Professional
  date?: Date
  time?: string
  clientName?: string
  clientLastName?: string
  clientEmail?: string
}

export function ClientBooking() {
  const [step, setStep] = useState<BookingStep>("service")
  const [bookingData, setBookingData] = useState<BookingData>({})

  const steps: BookingStep[] = [
    "service",
    "professional",
    "datetime",
    "info",
    "confirmation",
  ]
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const updateBooking = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const previousStep = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const resetBooking = () => {
    setBookingData({})
    setStep("service")
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Reserva tu Turno
          </h1>
          <p className="text-lg text-gray-600">
            Completa los pasos para agendar tu cita
          </p>
        </div>

        {/* Progress Bar */}
        {step !== "confirmation" && (
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">
                Paso {currentStepIndex + 1} de {steps.length}
              </span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {step === "service" && (
            <ServiceSelection
              onSelect={(service) => {
                updateBooking({ service })
                nextStep()
              }}
            />
          )}

          {step === "professional" && bookingData.service && (
            <ProfessionalSelection
              service={bookingData.service}
              onSelect={(professional) => {
                updateBooking({ professional })
                nextStep()
              }}
              onBack={previousStep}
            />
          )}

          {step === "datetime" && bookingData.service && bookingData.professional && (
            <DateTimeSelection
              service={bookingData.service}
              professional={bookingData.professional}
              onSelect={(date, time) => {
                updateBooking({ date, time })
                nextStep()
              }}
              onBack={previousStep}
            />
          )}

          {step === "info" && (
            <ClientInfoForm
              onSubmit={(name, lastName, email) => {
                updateBooking({
                  clientName: name,
                  clientLastName: lastName,
                  clientEmail: email,
                })
                nextStep()
              }}
              onBack={previousStep}
            />
          )}

          {step === "confirmation" && (
            <BookingConfirmation
              bookingData={bookingData as Required<BookingData>}
              onNewBooking={resetBooking}
            />
          )}
        </div>
      </div>
    </div>
  )
}

