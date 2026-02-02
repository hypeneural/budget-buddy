import { create } from 'zustand';
import { quotesApi } from '@/lib/api';

// API response types
export interface ApiSupplier {
  id: number;
  name: string;
  whatsapp: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  category_id: number;
  city_id: number;
  category?: { id: number; name: string; icon?: string };
  city?: { id: number; name: string; state: string };
  pivot?: {
    status: 'waiting' | 'responded' | 'winner';
    value?: string;
    notes?: string;
    responded_at?: string;
  };
}

export interface ApiQuote {
  id: number;
  title: string;
  message: string;
  general_notes?: string;
  status: 'open' | 'closed';
  created_at: string;
  closed_at?: string;
  winner_supplier_id?: number;
  user?: { id: number; name: string; email: string };
  cities?: { id: number; name: string; state: string }[];
  suppliers?: ApiSupplier[];
  winner_supplier?: ApiSupplier;
}

interface QuoteStore {
  quotes: ApiQuote[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchQuotes: (status?: 'open' | 'closed') => Promise<void>;
  fetchQuoteById: (id: number) => Promise<ApiQuote | null>;
  createQuote: (data: {
    title: string;
    message: string;
    general_notes?: string;
    city_ids: number[];
    supplier_ids: number[];
  }) => Promise<ApiQuote>;
  updateQuote: (id: number, data: { title?: string; message?: string; general_notes?: string }) => Promise<void>;
  deleteQuote: (id: number) => Promise<void>;
  closeQuote: (id: number, winnerId: number) => Promise<void>;
  updateSupplierQuote: (quoteId: number, supplierId: number, data: { status?: string; value?: string; notes?: string }) => Promise<void>;
  broadcastQuote: (quoteId: number, instanceId: number, supplierIds?: number[], customMessage?: string) => Promise<{ queued: number; total: number }>;

  // Getters
  getQuoteById: (id: number) => ApiQuote | undefined;
  getOpenQuotes: () => ApiQuote[];
  getClosedQuotes: () => ApiQuote[];
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  quotes: [],
  loading: false,
  error: null,

  fetchQuotes: async (status) => {
    set({ loading: true, error: null });
    try {
      const response = await quotesApi.getAll(status ? { status } : undefined);
      set({ quotes: response.data.data || [], loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch quotes';
      set({ error: message, loading: false });
    }
  },

  fetchQuoteById: async (id) => {
    try {
      const response = await quotesApi.get(id);
      const quote = response.data.data;

      // Update in store
      set(state => ({
        quotes: state.quotes.some(q => q.id === id)
          ? state.quotes.map(q => q.id === id ? quote : q)
          : [...state.quotes, quote],
      }));

      return quote;
    } catch {
      return null;
    }
  },

  createQuote: async (data) => {
    const response = await quotesApi.create(data);
    const newQuote = response.data.data;

    set(state => ({
      quotes: [newQuote, ...state.quotes],
    }));

    return newQuote;
  },

  updateQuote: async (id, data) => {
    await quotesApi.update(id, data);

    set(state => ({
      quotes: state.quotes.map(q =>
        q.id === id ? { ...q, ...data } : q
      ),
    }));
  },

  deleteQuote: async (id) => {
    await quotesApi.delete(id);

    set(state => ({
      quotes: state.quotes.filter(q => q.id !== id),
    }));
  },

  closeQuote: async (id, winnerId) => {
    const response = await quotesApi.close(id, winnerId);
    const updatedQuote = response.data.data;

    set(state => ({
      quotes: state.quotes.map(q =>
        q.id === id ? updatedQuote : q
      ),
    }));
  },

  updateSupplierQuote: async (quoteId, supplierId, data) => {
    const response = await quotesApi.updateSupplier(quoteId, supplierId, data);
    const updatedQuote = response.data.data;

    set(state => ({
      quotes: state.quotes.map(q =>
        q.id === quoteId ? updatedQuote : q
      ),
    }));
  },

  broadcastQuote: async (quoteId, instanceId, supplierIds, customMessage) => {
    const response = await quotesApi.broadcast(quoteId, {
      whatsapp_instance_id: instanceId,
      supplier_ids: supplierIds,
      custom_message: customMessage,
    });
    return response.data.data;
  },

  getQuoteById: (id) => {
    return get().quotes.find(q => q.id === id);
  },

  getOpenQuotes: () => {
    return get().quotes.filter(q => q.status === 'open');
  },

  getClosedQuotes: () => {
    return get().quotes.filter(q => q.status === 'closed');
  },
}));
