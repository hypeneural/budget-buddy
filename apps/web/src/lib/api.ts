import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; password_confirmation: string; company_id: number }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  get: (id: number) => api.get(`/categories/${id}`),
  create: (data: { name: string; icon?: string }) => api.post('/categories', data),
  update: (id: number, data: { name?: string; icon?: string }) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// States API (Brazilian states from IBGE)
export const statesApi = {
  getAll: (params?: { region?: string; search?: string }) =>
    api.get('/states', { params }),
  get: (id: number) => api.get(`/states/${id}`),
};

// Cities API (Brazilian municipalities from IBGE)
export const citiesApi = {
  getAll: (params?: {
    state_id?: number;
    uf?: string;
    ddd?: number;
    capitals?: boolean;
    search?: string;
    limit?: number;
  }) => api.get('/cities', { params }),
  get: (id: number) => api.get(`/cities/${id}`),
};

// Suppliers API
export const suppliersApi = {
  getAll: (params?: { category_id?: number; city_id?: number; is_active?: boolean; search?: string }) =>
    api.get('/suppliers', { params }),
  get: (id: number) => api.get(`/suppliers/${id}`),
  getFilters: () => api.get('/suppliers/filters'),
  getCitiesByCategory: (categoryId: number) =>
    api.get('/suppliers/cities-by-category', { params: { category_id: categoryId } }),
  create: (data: {
    name: string;
    category_id: number;
    city_id: number;
    address?: string;
    whatsapp: string;
    notes?: string;
    is_active?: boolean;
  }) => api.post('/suppliers', data),
  update: (id: number, data: Partial<{
    name: string;
    category_id: number;
    city_id: number;
    address: string;
    whatsapp: string;
    notes: string;
    is_active: boolean;
  }>) => api.put(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// Quotes API
export const quotesApi = {
  getAll: (params?: { status?: 'open' | 'closed' }) => api.get('/quotes', { params }),
  get: (id: number) => api.get(`/quotes/${id}`),
  create: (data: {
    title: string;
    message: string;
    general_notes?: string;
    city_ids: number[];
    supplier_ids: number[];
  }) => api.post('/quotes', data),
  update: (id: number, data: { title?: string; message?: string; general_notes?: string }) =>
    api.put(`/quotes/${id}`, data),
  delete: (id: number) => api.delete(`/quotes/${id}`),
  close: (id: number, winnerSupplierId: number) =>
    api.post(`/quotes/${id}/close`, { winner_supplier_id: winnerSupplierId }),
  updateSupplier: (quoteId: number, supplierId: number, data: { status?: string; value?: string; notes?: string }) =>
    api.patch(`/quotes/${quoteId}/suppliers/${supplierId}`, data),
  broadcast: (quoteId: number, data: { whatsapp_instance_id: number; supplier_ids?: number[]; custom_message?: string }) =>
    api.post(`/quotes/${quoteId}/broadcast`, data),
};

// WhatsApp Instances API
export const whatsappApi = {
  getAll: () => api.get('/whatsapp-instances'),
  get: (id: number) => api.get(`/whatsapp-instances/${id}`),
  create: (data: { name: string }) => api.post('/whatsapp-instances', data),
  update: (id: number, data: { name?: string; status?: string; phone_number?: string }) =>
    api.put(`/whatsapp-instances/${id}`, data),
  delete: (id: number) => api.delete(`/whatsapp-instances/${id}`),
};

// Queue Management API
export const queueApi = {
  getStatus: () => api.get('/queue/status'),
  work: (limit?: number) => api.post('/queue/work', { limit }),
  retry: (messageId?: number) => api.post('/queue/retry', { message_id: messageId }),
};

// Z-API WhatsApp Operations
export const zapiApi = {
  // Get instance connection status
  getStatus: (instanceId: number) =>
    api.get(`/whatsapp/instances/${instanceId}/status`),

  // Get QR code for connection
  getQrCode: (instanceId: number) =>
    api.get(`/whatsapp/instances/${instanceId}/qr`),

  // Get device info when connected
  getDeviceInfo: (instanceId: number) =>
    api.get(`/whatsapp/instances/${instanceId}/device`),

  // Get full status: combined status + device info + QR code
  getFullStatus: (instanceId: number) =>
    api.get(`/whatsapp/instances/${instanceId}/full-status`),

  // Get phone code for connection
  getPhoneCode: (instanceId: number, phone: string) =>
    api.get(`/whatsapp/instances/${instanceId}/phone-code/${phone}`),

  // Disconnect instance
  disconnect: (instanceId: number) =>
    api.post(`/whatsapp/instances/${instanceId}/disconnect`),

  // Update instance credentials
  updateCredentials: (instanceId: number, data: { instance_id: string; instance_token: string; client_token: string }) =>
    api.put(`/whatsapp/instances/${instanceId}/credentials`, data),

  // Send text message
  sendText: (data: {
    whatsapp_instance_id: number;
    phone: string;
    message: string;
    delayMessage?: number;
    delayTyping?: number;
    idempotencyKey?: string;
  }) => api.post('/whatsapp/send-text', data),
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: async () => {
    const [quotesRes, suppliersRes] = await Promise.all([
      quotesApi.getAll(),
      suppliersApi.getAll(),
    ]);

    const quotes = quotesRes.data.data || [];
    const suppliers = suppliersRes.data.data || [];

    return {
      totalQuotes: quotes.length,
      openQuotes: quotes.filter((q: { status: string }) => q.status === 'open').length,
      closedQuotes: quotes.filter((q: { status: string }) => q.status === 'closed').length,
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter((s: { is_active: boolean }) => s.is_active).length,
    };
  },
};
