import { create } from 'zustand';
import { WhatsAppInstance } from '@/types';
import { whatsappInstances as initialInstances } from '@/data/mockData';

interface WhatsAppStore {
  instances: WhatsAppInstance[];
  
  // Actions
  addInstance: (name: string) => WhatsAppInstance;
  connectInstance: (id: string, phoneNumber: string) => void;
  disconnectInstance: (id: string) => void;
  deleteInstance: (id: string) => void;
  getConnectedInstances: () => WhatsAppInstance[];
}

export const useWhatsAppStore = create<WhatsAppStore>((set, get) => ({
  instances: initialInstances,

  addInstance: (name) => {
    const newInstance: WhatsAppInstance = {
      id: Date.now().toString(),
      name,
      status: 'disconnected',
    };

    set(state => ({
      instances: [...state.instances, newInstance],
    }));

    return newInstance;
  },

  connectInstance: (id, phoneNumber) => {
    set(state => ({
      instances: state.instances.map(i =>
        i.id === id
          ? { ...i, status: 'connected' as const, phoneNumber, connectedAt: new Date() }
          : i
      ),
    }));
  },

  disconnectInstance: (id) => {
    set(state => ({
      instances: state.instances.map(i =>
        i.id === id
          ? { ...i, status: 'disconnected' as const, phoneNumber: undefined, connectedAt: undefined }
          : i
      ),
    }));
  },

  deleteInstance: (id) => {
    set(state => ({
      instances: state.instances.filter(i => i.id !== id),
    }));
  },

  getConnectedInstances: () => {
    return get().instances.filter(i => i.status === 'connected');
  },
}));
