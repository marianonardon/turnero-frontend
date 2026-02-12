/**
 * Paleta de colores consistente para estados de appointments
 *
 * Estos colores se usan en TODOS los componentes para mantener
 * consistencia visual en toda la aplicación.
 */

import { AppointmentStatus } from '../api/types'

export const APPOINTMENT_STATUS_COLORS = {
  [AppointmentStatus.CONFIRMED]: {
    bg: 'bg-green-500',
    bgHover: 'bg-green-600',
    bgLight: 'bg-green-100',
    border: 'border-green-600',
    text: 'text-green-900',
    textLight: 'text-green-700',
    hex: '#10b981',
    label: 'Confirmado'
  },
  [AppointmentStatus.PENDING]: {
    bg: 'bg-amber-500',
    bgHover: 'bg-amber-600',
    bgLight: 'bg-amber-100',
    border: 'border-amber-600',
    text: 'text-amber-900',
    textLight: 'text-amber-700',
    hex: '#f59e0b',
    label: 'Pendiente'
  },
  [AppointmentStatus.CANCELLED]: {
    bg: 'bg-red-500',
    bgHover: 'bg-red-600',
    bgLight: 'bg-red-100',
    border: 'border-red-600',
    text: 'text-red-900',
    textLight: 'text-red-700',
    hex: '#ef4444',
    label: 'Cancelado'
  },
  [AppointmentStatus.COMPLETED]: {
    bg: 'bg-blue-500',
    bgHover: 'bg-blue-600',
    bgLight: 'bg-blue-100',
    border: 'border-blue-600',
    text: 'text-blue-900',
    textLight: 'text-blue-700',
    hex: '#3b82f6',
    label: 'Completado'
  },
  [AppointmentStatus.NO_SHOW]: {
    bg: 'bg-gray-500',
    bgHover: 'bg-gray-600',
    bgLight: 'bg-gray-100',
    border: 'border-gray-600',
    text: 'text-gray-900',
    textLight: 'text-gray-700',
    hex: '#6b7280',
    label: 'No asistió'
  }
} as const

/**
 * Helper para obtener colores de un status
 */
export const getStatusColors = (status: AppointmentStatus) => {
  return APPOINTMENT_STATUS_COLORS[status] || APPOINTMENT_STATUS_COLORS[AppointmentStatus.PENDING]
}

/**
 * Helper para obtener clase de Tailwind según status
 */
export const getStatusClassName = (
  status: AppointmentStatus,
  variant: 'bg' | 'text' | 'border' = 'bg'
) => {
  const colors = getStatusColors(status)
  return colors[variant]
}
