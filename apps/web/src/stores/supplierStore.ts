import { create } from 'zustand';
import { Supplier } from '@/types';
import { suppliers as initialSuppliers } from '@/data/mockData';

interface SupplierStore {
  suppliers: Supplier[];
  
  // Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  getSuppliersByCategory: (category: string) => Supplier[];
  getSuppliersByCity: (city: string) => Supplier[];
  getSuppliersByCategoryAndCities: (category: string, cities: string[]) => Supplier[];
  searchSuppliers: (query: string) => Supplier[];
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  suppliers: initialSuppliers,

  addSupplier: (supplierData) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    set(state => ({
      suppliers: [...state.suppliers, newSupplier],
    }));

    return newSupplier;
  },

  updateSupplier: (id, updates) => {
    set(state => ({
      suppliers: state.suppliers.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },

  deleteSupplier: (id) => {
    set(state => ({
      suppliers: state.suppliers.filter(s => s.id !== id),
    }));
  },

  getSupplierById: (id) => {
    return get().suppliers.find(s => s.id === id);
  },

  getSuppliersByCategory: (category) => {
    return get().suppliers.filter(s => s.category === category);
  },

  getSuppliersByCity: (city) => {
    return get().suppliers.filter(s => s.city === city);
  },

  getSuppliersByCategoryAndCities: (category, cities) => {
    return get().suppliers.filter(
      s => s.category === category && cities.includes(s.city)
    );
  },

  searchSuppliers: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().suppliers.filter(
      s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.whatsapp.includes(query)
    );
  },
}));
