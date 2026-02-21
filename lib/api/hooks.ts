// React Query hooks para usar el API

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantContext } from '../context/TenantContext';
import {
  tenantsApi,
  servicesApi,
  professionalsApi,
  schedulesApi,
  customersApi,
  appointmentsApi,
  authApi,
} from './endpoints';
import type {
  CreateTenantDto,
  UpdateTenantDto,
  CreateServiceDto,
  UpdateServiceDto,
  CreateProfessionalDto,
  UpdateProfessionalDto,
  CreateScheduleDto,
  CreateCustomerDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AvailabilityQuery,
  LoginDto,
  VerifyTokenDto,
  CreateRecurringSeriesDto,
} from './types';

// ============================================
// TENANTS
// ============================================

export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsApi.getAll(),
  });
};

export const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: () => tenantsApi.getById(id),
    enabled: !!id,
  });
};

export const useTenantBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['tenants', 'slug', slug],
    queryFn: () => tenantsApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantDto) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantDto }) =>
      tenantsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenants', variables.id] });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

// ============================================
// SERVICES
// ============================================

export const useServices = () => {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['services', tenantId],
    queryFn: async () => {
      console.log('[useServices] Fetching services with tenantId:', tenantId);
      const result = await servicesApi.getAll();
      console.log('[useServices] Services received:', result);
      return result;
    },
    enabled: !!tenantId,
    retry: 1,
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceDto) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
      servicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', variables.id] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// ============================================
// PROFESSIONALS
// ============================================

export const useProfessionals = () => {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['professionals', tenantId],
    queryFn: async () => {
      console.log('[useProfessionals] Fetching professionals with tenantId:', tenantId);
      const result = await professionalsApi.getAll();
      console.log('[useProfessionals] Professionals received:', result);
      return result;
    },
    enabled: !!tenantId,
    retry: 1,
  });
};

export const useProfessional = (id: string) => {
  return useQuery({
    queryKey: ['professionals', id],
    queryFn: () => professionalsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProfessional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProfessionalDto) =>
      professionalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
};

export const useUpdateProfessional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProfessionalDto;
    }) => professionalsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      queryClient.invalidateQueries({
        queryKey: ['professionals', variables.id],
      });
    },
  });
};

export const useDeleteProfessional = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => professionalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
};

// ============================================
// SCHEDULES
// ============================================

export const useSchedules = () => {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['schedules', tenantId],
    queryFn: () => schedulesApi.getAll(),
    enabled: !!tenantId,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleDto) => schedulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateScheduleDto>;
    }) => schedulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

// ============================================
// CUSTOMERS
// ============================================

export const useCustomers = () => {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['customers', tenantId],
    queryFn: () => customersApi.getAll(),
    enabled: !!tenantId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// ============================================
// APPOINTMENTS
// ============================================

export const useAppointments = () => {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['appointments', tenantId],
    queryFn: () => appointmentsApi.getAll(),
    enabled: !!tenantId,
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentDto) =>
      appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAppointmentDto;
    }) => appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useAvailability = (tenantSlug: string | null, query: AvailabilityQuery | null) => {
  return useQuery({
    queryKey: ['availability', tenantSlug, query],
    queryFn: () => appointmentsApi.getAvailability(tenantSlug!, query!),
    enabled: !!tenantSlug && !!query,
    staleTime: 0, // Siempre considerar los datos como stale para forzar refetch
    gcTime: 0, // No cachear (gcTime reemplaza a cacheTime en React Query v5)
  });
};

export const useDayAppointments = (tenantSlug: string | null, date: string | null) => {
  return useQuery({
    queryKey: ['appointmentsByDay', tenantSlug, date],
    queryFn: () => appointmentsApi.getDayAppointments(tenantSlug!, date!),
    enabled: !!tenantSlug && !!date,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useMetrics = (params?: { startDate?: string; endDate?: string }) => {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['metrics', tenantId, params],
    queryFn: () => appointmentsApi.getMetrics(params),
    enabled: !!tenantId,
    staleTime: 30000, // 30 segundos
  });
};

// ============================================
// RECURRING SERIES
// ============================================

export const useCreateRecurringSeries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecurringSeriesDto) =>
      appointmentsApi.createRecurringSeries(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelRecurringSeries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seriesId: string) =>
      appointmentsApi.cancelRecurringSeries(seriesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelRecurringSeriesFrom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, fromDate }: { seriesId: string; fromDate: string }) =>
      appointmentsApi.cancelRecurringSeriesFrom(seriesId, fromDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// ============================================
// AUTH
// ============================================

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
  });
};

export const useVerifyToken = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyToken(token),
  });
};

