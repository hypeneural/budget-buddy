import { create } from 'zustand';
import { suppliersApi, categoriesApi, citiesApi, whatsappApi } from '@/lib/api';

export interface ApiCategory {
  id: number;
  name: string;
  icon?: string;
}

export interface ApiCity {
  id: number;
  name: string;
  state: string;
  uf?: string;
  display_name?: string;
}

export interface ApiSupplier {
  id: number;
  name: string;
  whatsapp: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  category_id: number;
  city_id: number;
  category?: ApiCategory;
  city?: ApiCity;
  created_at?: string;
}

// Filter options with count
export interface FilterOption {
  id: number;
  name: string;
  uf?: string;
  count: number;
}

// WhatsApp instance
export interface WhatsAppInstance {
  id: number;
  name: string;
  status: string;
  phone_number?: string;
}

interface SupplierStore {
  suppliers: ApiSupplier[];
  categories: ApiCategory[];
  cities: ApiCity[];
  filterCategories: FilterOption[];
  filterCities: FilterOption[];
  whatsappInstances: WhatsAppInstance[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchSuppliers: (params?: { category_id?: number; city_id?: number; is_active?: boolean; search?: string }) => Promise<void>;
  fetchCategoriesAndCities: () => Promise<void>;
  fetchFilters: () => Promise<void>;
  fetchWhatsappInstances: () => Promise<void>;
  createSupplier: (data: {
    name: string;
    category_id: number;
    city_id: number;
    address?: string;
    whatsapp: string;
    notes?: string;
    is_active?: boolean;
  }) => Promise<ApiSupplier>;
  updateSupplier: (id: number, data: Partial<ApiSupplier>) => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;

  // Getters
  getSupplierById: (id: number) => ApiSupplier | undefined;
  getSuppliersByCategory: (categoryId: number) => ApiSupplier[];
  getSuppliersByCity: (cityId: number) => ApiSupplier[];
  getActiveSuppliers: () => ApiSupplier[];
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  suppliers: [],
  categories: [],
  cities: [],
  filterCategories: [],
  filterCities: [],
  whatsappInstances: [],
  loading: false,
  error: null,

  fetchSuppliers: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await suppliersApi.getAll(params);
      set({ suppliers: response.data.data || [], loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch suppliers';
      set({ error: message, loading: false });
    }
  },

  fetchCategoriesAndCities: async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        categoriesApi.getAll(),
        citiesApi.getAll(),
      ]);
      set({
        categories: categoriesRes.data.data || [],
        cities: citiesRes.data.data || [],
      });
    } catch (error) {
      console.error('Failed to fetch categories/cities:', error);
    }
  },

  fetchFilters: async () => {
    try {
      const response = await suppliersApi.getFilters();
      const data = response.data.data;
      set({
        filterCategories: data.categories || [],
        filterCities: data.cities || [],
      });
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  },

  fetchWhatsappInstances: async () => {
    try {
      const response = await whatsappApi.getAll();
      set({ whatsappInstances: response.data.data || [] });
    } catch (error) {
      console.error('Failed to fetch WhatsApp instances:', error);
    }
  },

  createSupplier: async (data) => {
    const response = await suppliersApi.create(data);
    const newSupplier = response.data.data;

    set(state => ({
      suppliers: [...state.suppliers, newSupplier],
    }));

    return newSupplier;
  },

  updateSupplier: async (id, data) => {
    await suppliersApi.update(id, data);

    set(state => ({
      suppliers: state.suppliers.map(s =>
        s.id === id ? { ...s, ...data } : s
      ),
    }));
  },

  deleteSupplier: async (id) => {
    await suppliersApi.delete(id);

    set(state => ({
      suppliers: state.suppliers.filter(s => s.id !== id),
    }));
  },

  getSupplierById: (id) => {
    return get().suppliers.find(s => s.id === id);
  },

  getSuppliersByCategory: (categoryId) => {
    return get().suppliers.filter(s => s.category_id === categoryId);
  },

  getSuppliersByCity: (cityId) => {
    return get().suppliers.filter(s => s.city_id === cityId);
  },

  getActiveSuppliers: () => {
    return get().suppliers.filter(s => s.is_active);
  },
}));
