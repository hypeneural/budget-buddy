import { create } from 'zustand';
import { whatsappApi, zapiApi } from '@/lib/api';

export interface ApiWhatsAppInstance {
  id: number;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  phone_number?: string;
  connected_at?: string;
  smartphone_connected?: boolean;
  last_status_error?: string;
  last_status_at?: string;
  has_credentials?: boolean;
}

export interface QrCodeData {
  imageBase64: string;
  refreshedAt: string;
}

export interface ConnectionStatus {
  connected: boolean;
  smartphoneConnected: boolean;
  error?: string;
  checkedAt: string;
}

interface WhatsAppStore {
  instances: ApiWhatsAppInstance[];
  loading: boolean;
  error: string | null;

  // QR Code state
  currentQrCode: QrCodeData | null;
  qrLoading: boolean;

  // Actions
  fetchInstances: () => Promise<void>;
  createInstance: (name: string) => Promise<ApiWhatsAppInstance>;
  updateInstance: (id: number, data: Partial<ApiWhatsAppInstance>) => Promise<void>;
  deleteInstance: (id: number) => Promise<void>;

  // Z-API Actions
  checkStatus: (id: number) => Promise<ConnectionStatus>;
  getQrCode: (id: number) => Promise<QrCodeData>;
  getPhoneCode: (id: number, phone: string) => Promise<{ code: string; generatedAt: string }>;
  disconnect: (id: number) => Promise<void>;
  updateCredentials: (id: number, data: { instance_id: string; instance_token: string; client_token: string }) => Promise<void>;
  sendTestMessage: (instanceId: number, phone: string, message: string) => Promise<{ message_id: number; status: string }>;

  // Getters
  getConnectedInstances: () => ApiWhatsAppInstance[];
  getInstanceById: (id: number) => ApiWhatsAppInstance | undefined;

  // QR Code helpers
  clearQrCode: () => void;
}

export const useWhatsAppStore = create<WhatsAppStore>((set, get) => ({
  instances: [],
  loading: false,
  error: null,
  currentQrCode: null,
  qrLoading: false,

  fetchInstances: async () => {
    set({ loading: true, error: null });
    try {
      const response = await whatsappApi.getAll();
      set({ instances: response.data.data || [], loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch instances';
      set({ error: message, loading: false });
    }
  },

  createInstance: async (name) => {
    const response = await whatsappApi.create({ name });
    const newInstance = response.data.data;

    set(state => ({
      instances: [...state.instances, newInstance],
    }));

    return newInstance;
  },

  updateInstance: async (id, data) => {
    await whatsappApi.update(id, data);

    set(state => ({
      instances: state.instances.map(i =>
        i.id === id ? { ...i, ...data } : i
      ),
    }));
  },

  deleteInstance: async (id) => {
    await whatsappApi.delete(id);

    set(state => ({
      instances: state.instances.filter(i => i.id !== id),
    }));
  },

  checkStatus: async (id) => {
    const response = await zapiApi.getStatus(id);
    const status = response.data.data;

    // Update instance in store
    set(state => ({
      instances: state.instances.map(i =>
        i.id === id
          ? {
            ...i,
            status: status.connected ? 'connected' : 'disconnected',
            smartphone_connected: status.smartphoneConnected,
            last_status_error: status.error,
            last_status_at: status.checkedAt,
          }
          : i
      ),
    }));

    return status;
  },

  getQrCode: async (id) => {
    set({ qrLoading: true });
    try {
      const response = await zapiApi.getQrCode(id);
      const qrData = response.data.data;
      set({ currentQrCode: qrData, qrLoading: false });
      return qrData;
    } catch (error) {
      set({ qrLoading: false });
      throw error;
    }
  },

  getPhoneCode: async (id, phone) => {
    const response = await zapiApi.getPhoneCode(id, phone);
    return response.data.data;
  },

  disconnect: async (id) => {
    await zapiApi.disconnect(id);

    set(state => ({
      instances: state.instances.map(i =>
        i.id === id
          ? { ...i, status: 'disconnected' as const, phone_number: undefined, connected_at: undefined }
          : i
      ),
    }));
  },

  updateCredentials: async (id, data) => {
    await zapiApi.updateCredentials(id, data);

    set(state => ({
      instances: state.instances.map(i =>
        i.id === id ? { ...i, has_credentials: true } : i
      ),
    }));
  },

  sendTestMessage: async (instanceId, phone, message) => {
    const response = await zapiApi.sendText({
      whatsapp_instance_id: instanceId,
      phone,
      message,
    });
    return response.data.data;
  },

  getConnectedInstances: () => {
    return get().instances.filter(i => i.status === 'connected');
  },

  getInstanceById: (id) => {
    return get().instances.find(i => i.id === id);
  },

  clearQrCode: () => {
    set({ currentQrCode: null });
  },
}));
