import { create } from 'zustand';
import { Quote, SupplierQuote, SupplierQuoteStatus } from '@/types';
import { quotes as initialQuotes, suppliers } from '@/data/mockData';

interface QuoteStore {
  quotes: Quote[];
  
  // Actions
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'status' | 'suppliers'> & { supplierIds: string[] }) => Quote;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  updateSupplierQuote: (quoteId: string, supplierId: string, updates: Partial<SupplierQuote>) => void;
  closeQuote: (quoteId: string, winnerId: string) => void;
  getQuoteById: (id: string) => Quote | undefined;
  getOpenQuotes: () => Quote[];
  getClosedQuotes: () => Quote[];
}

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  quotes: initialQuotes,

  addQuote: (quoteData) => {
    const newQuote: Quote = {
      id: Date.now().toString(),
      title: quoteData.title,
      category: quoteData.category,
      cities: quoteData.cities,
      message: quoteData.message,
      generalNotes: quoteData.generalNotes,
      status: 'open',
      suppliers: quoteData.supplierIds.map(supplierId => {
        const supplier = suppliers.find(s => s.id === supplierId)!;
        return {
          supplierId,
          supplier,
          status: 'waiting' as SupplierQuoteStatus,
        };
      }),
      createdAt: new Date(),
    };

    set(state => ({
      quotes: [newQuote, ...state.quotes],
    }));

    return newQuote;
  },

  updateQuote: (id, updates) => {
    set(state => ({
      quotes: state.quotes.map(q =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
  },

  updateSupplierQuote: (quoteId, supplierId, updates) => {
    set(state => ({
      quotes: state.quotes.map(q => {
        if (q.id !== quoteId) return q;
        return {
          ...q,
          suppliers: q.suppliers.map(sq =>
            sq.supplierId === supplierId
              ? { ...sq, ...updates, respondedAt: updates.value ? new Date() : sq.respondedAt }
              : sq
          ),
        };
      }),
    }));
  },

  closeQuote: (quoteId, winnerId) => {
    set(state => ({
      quotes: state.quotes.map(q => {
        if (q.id !== quoteId) return q;
        return {
          ...q,
          status: 'closed',
          closedAt: new Date(),
          winnerId,
          suppliers: q.suppliers.map(sq => ({
            ...sq,
            status: sq.supplierId === winnerId ? 'winner' : sq.status,
          })),
        };
      }),
    }));
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
