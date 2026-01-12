// Tipos TypeScript para las entidades del backend

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily?: string;
  timezone: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  slug: string;
  name: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  timezone?: string;
  locale?: string;
}

export interface UpdateTenantDto {
  name?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  timezone?: string;
  locale?: string;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  duration: number; // minutos
  price?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  isActive?: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

export interface Professional {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfessionalDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  isActive?: boolean;
  serviceIds?: string[];
}

export interface UpdateProfessionalDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  isActive?: boolean;
  serviceIds?: string[];
}

export interface Schedule {
  id: string;
  tenantId?: string;
  professionalId?: string;
  professional?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  dayOfWeek: number; // 0-6 (Domingo-Sábado)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breaks?: Array<{ start: string; end: string }>;
  isException: boolean;
  exceptionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDto {
  professionalId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breaks?: Array<{ start: string; end: string }>;
  isException?: boolean;
  exceptionDate?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  customer: Customer;
  serviceId: string;
  service: Service;
  professionalId: string;
  professional: Professional;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  isConfirmed: boolean;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  reminderSentAt?: string;
  confirmationSentAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export interface CreateAppointmentDto {
  // Datos del cliente (si no existe, se crea automáticamente)
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  // Datos del turno
  serviceId: string;
  professionalId: string;
  startTime: string; // ISO string
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentDto {
  status?: AppointmentStatus;
  isConfirmed?: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  notes?: string;
}

export interface AvailabilityQuery {
  professionalId: string;
  serviceId: string;
  date: string; // ISO date string (yyyy-MM-dd)
}

export interface TimeSlot {
  time: string; // Formato "HH:mm"
  available: boolean;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
}

export interface LoginDto {
  email: string;
}

export interface VerifyTokenDto {
  token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    tenantId: string;
    tenant?: Tenant;
  };
  jwt?: string;
}

