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

// Cities API
export const citiesApi = {
  getAll: () => api.get('/cities'),
  get: (id: number) => api.get(`/cities/${id}`),
  create: (data: { name: string; state: string }) => api.post('/cities', data),
  update: (id: number, data: { name?: string; state?: string }) => api.put(`/cities/${id}`, data),
  delete: (id: number) => api.delete(`/cities/${id}`),
};

// Suppliers API
export const suppliersApi = {
  getAll: (params?: { category_id?: number; city_id?: number; is_active?: boolean; search?: string }) =>
    api.get('/suppliers', { params }),
  get: (id: number) => api.get(`/suppliers/${id}`),
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
