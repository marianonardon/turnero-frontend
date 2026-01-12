// Cliente API para comunicarse con el backend NestJS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;
  private tenantId: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setTenantId(tenantId: string | null) {
    this.tenantId = tenantId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar tenant ID si está disponible
    if (this.tenantId) {
      (headers as Record<string, string>)['x-tenant-id'] = this.tenantId;
      console.log('[API Client] Sending request with tenantId:', this.tenantId, 'to:', endpoint);
    } else {
      console.warn('[API Client] No tenantId set for request to:', endpoint);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      // NestJS validation errors tienen este formato
      if (errorData.message && Array.isArray(errorData.message)) {
        errorData.message = errorData.message.join(', ');
      }

      const error: ApiError = {
        message: errorData.message || response.statusText,
        statusCode: response.status,
      };
      throw error;
    }

    // Si la respuesta está vacía (204 No Content), retornar null
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // GET
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

