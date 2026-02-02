// Core domain types

export type QuoteStatus = 'open' | 'closed';
export type SupplierQuoteStatus = 'waiting' | 'responded' | 'winner';
export type WhatsAppInstanceStatus = 'connected' | 'disconnected';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  city: string;
  address?: string;
  whatsapp: string;
  notes?: string;
  createdAt: Date;
}

export interface SupplierQuote {
  supplierId: string;
  supplier: Supplier;
  status: SupplierQuoteStatus;
  value?: string;
  notes?: string;
  respondedAt?: Date;
}

export interface Quote {
  id: string;
  title: string;
  category: string;
  cities: string[];
  message: string;
  generalNotes?: string;
  status: QuoteStatus;
  suppliers: SupplierQuote[];
  createdAt: Date;
  closedAt?: Date;
  winnerId?: string;
}

export interface WhatsAppInstance {
  id: string;
  name: string;
  status: WhatsAppInstanceStatus;
  phoneNumber?: string;
  connectedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
}
