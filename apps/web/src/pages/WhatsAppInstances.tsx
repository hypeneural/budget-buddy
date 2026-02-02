import { useEffect, useState } from 'react';
import { Smartphone, Wifi, WifiOff, Plus, QrCode, Power, Loader2, Settings2, Send, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWhatsAppStore, type ApiWhatsAppInstance } from '@/stores/whatsappStore';
import { toast } from 'sonner';

export default function WhatsAppInstances() {
  const {
    instances,
    loading,
    error,
    currentQrCode,
    qrLoading,
    fetchInstances,
    createInstance,
    deleteInstance,
    checkStatus,
    getQrCode,
    disconnect,
    updateCredentials,
    sendTestMessage,
    clearQrCode,
  } = useWhatsAppStore();

  const [initialized, setInitialized] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<ApiWhatsAppInstance | null>(null);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [newInstanceModalOpen, setNewInstanceModalOpen] = useState(false);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [testMessageModalOpen, setTestMessageModalOpen] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [credentials, setCredentials] = useState({ instance_id: '', instance_token: '', client_token: '' });
  const [testMessage, setTestMessage] = useState({ phone: '', message: '' });
  const [qrRefreshCount, setQrRefreshCount] = useState(0);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchInstances().then(() => setInitialized(true));
    }
  }, [initialized, fetchInstances]);

  // QR Code auto-refresh (every 15s, max 3 times)
  useEffect(() => {
    if (!qrModalOpen || !selectedInstance || qrRefreshCount >= 3) return;

    const interval = setInterval(async () => {
      if (qrRefreshCount < 3) {
        try {
          await getQrCode(selectedInstance.id);
          setQrRefreshCount(prev => prev + 1);

          // Check status after QR refresh
          const status = await checkStatus(selectedInstance.id);
          if (status.connected) {
            setQrModalOpen(false);
            toast.success('WhatsApp conectado com sucesso!');
          }
        } catch (error) {
          console.error('Failed to refresh QR:', error);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [qrModalOpen, selectedInstance, qrRefreshCount, getQrCode, checkStatus]);

  const handleConnect = async (instance: ApiWhatsAppInstance) => {
    setSelectedInstance(instance);
    setQrRefreshCount(0);
    clearQrCode();

    try {
      await getQrCode(instance.id);
      setQrModalOpen(true);
    } catch {
      toast.error('Erro ao obter QR Code. Configure as credenciais Z-API primeiro.');
      setSelectedInstance(instance);
      setCredentialsModalOpen(true);
    }
  };

  const handleRefreshQr = async () => {
    if (!selectedInstance || isRefreshingQr) return;

    setIsRefreshingQr(true);
    try {
      await getQrCode(selectedInstance.id);
      setQrRefreshCount(0);
      toast.success('QR Code atualizado');
    } catch {
      toast.error('Erro ao atualizar QR Code');
    } finally {
      setIsRefreshingQr(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedInstance) return;

    try {
      await disconnect(selectedInstance.id);
      setDisconnectModalOpen(false);
      toast.success('WhatsApp desconectado');
    } catch {
      toast.error('Erro ao desconectar');
    }
  };

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }

    try {
      await createInstance(newInstanceName.trim());
      setNewInstanceName('');
      setNewInstanceModalOpen(false);
      toast.success('Instância criada');
    } catch {
      toast.error('Erro ao criar instância');
    }
  };

  const handleSaveCredentials = async () => {
    if (!selectedInstance) return;
    if (!credentials.instance_id || !credentials.instance_token || !credentials.client_token) {
      toast.error('Preencha todas as credenciais');
      return;
    }

    try {
      await updateCredentials(selectedInstance.id, credentials);
      setCredentialsModalOpen(false);
      setCredentials({ instance_id: '', instance_token: '', client_token: '' });
      toast.success('Credenciais salvas');
    } catch {
      toast.error('Erro ao salvar credenciais');
    }
  };

  const handleSendTestMessage = async () => {
    if (!selectedInstance) return;
    if (!testMessage.phone || !testMessage.message) {
      toast.error('Preencha telefone e mensagem');
      return;
    }

    try {
      await sendTestMessage(selectedInstance.id, testMessage.phone, testMessage.message);
      toast.success('Mensagem enviada para fila');
      setTestMessageModalOpen(false);
      setTestMessage({ phone: '', message: '' });
    } catch {
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleCheckStatus = async (instance: ApiWhatsAppInstance) => {
    try {
      const status = await checkStatus(instance.id);
      if (status.connected) {
        toast.success('Conectado!');
      } else {
        toast.info(status.error || 'Desconectado');
      }
    } catch {
      toast.error('Erro ao verificar status');
    }
  };

  if (loading && !initialized) {
    return (
      <AppLayout title="WhatsApp">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="WhatsApp"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNewInstanceModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      }
    >
      <div className="p-4 md:p-6 space-y-4 animate-fade-in">
        {/* Info */}
        <div className="rounded-xl bg-info-light p-4 text-info">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Conecte seu WhatsApp via Z-API</p>
              <p className="text-sm opacity-80">
                Configure as credenciais e escaneie o QR Code para conectar
              </p>
            </div>
          </div>
        </div>

        {/* Instances List */}
        {instances.length === 0 ? (
          <EmptyState
            icon={Smartphone}
            title="Nenhuma instância"
            description="Crie uma instância para conectar seu WhatsApp"
            action={{
              label: 'Nova instância',
              onClick: () => setNewInstanceModalOpen(true),
            }}
          />
        ) : (
          <div className="space-y-3">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className="rounded-xl bg-card p-4 shadow-soft-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${instance.status === 'connected'
                        ? 'bg-success-light text-success'
                        : 'bg-muted text-muted-foreground'
                      }`}>
                      {instance.status === 'connected' ? (
                        <Wifi className="h-5 w-5" />
                      ) : (
                        <WifiOff className="h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{instance.name}</h3>
                      {instance.phone_number ? (
                        <p className="text-sm text-muted-foreground">{instance.phone_number}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Não conectado</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={instance.status} size="sm" />
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  {instance.status === 'disconnected' ? (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConnect(instance)}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Conectar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInstance(instance);
                          setCredentialsModalOpen(true);
                        }}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInstance(instance);
                          setTestMessageModalOpen(true);
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Testar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckStatus(instance)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInstance(instance);
                          setDisconnectModalOpen(true);
                        }}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Escaneie o QR Code abaixo com a câmera do WhatsApp
            </p>

            {/* QR Code */}
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl bg-muted overflow-hidden">
              {qrLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : currentQrCode?.imageBase64 ? (
                <img
                  src={`data:image/png;base64,${currentQrCode.imageBase64}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            {qrRefreshCount >= 3 ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  QR Code expirou
                </p>
                <Button size="sm" variant="outline" onClick={handleRefreshQr} disabled={isRefreshingQr}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshingQr ? 'animate-spin' : ''}`} />
                  Atualizar QR
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Aguardando leitura... ({qrRefreshCount + 1}/3)
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disconnect Modal */}
      <ConfirmModal
        open={disconnectModalOpen}
        onOpenChange={setDisconnectModalOpen}
        title="Desconectar WhatsApp"
        description={`Tem certeza que deseja desconectar "${selectedInstance?.name}"?`}
        confirmLabel="Desconectar"
        onConfirm={handleDisconnect}
        variant="destructive"
      />

      {/* New Instance Modal */}
      <Dialog open={newInstanceModalOpen} onOpenChange={setNewInstanceModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova instância</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da instância</Label>
              <Input
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
                placeholder="Ex: Comercial, Suporte..."
              />
            </div>
            <Button className="w-full" onClick={handleCreateInstance}>
              Criar instância
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={credentialsModalOpen} onOpenChange={setCredentialsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Z-API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Insira as credenciais da sua instância Z-API
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Instance ID</Label>
                <Input
                  value={credentials.instance_id}
                  onChange={(e) => setCredentials(c => ({ ...c, instance_id: e.target.value }))}
                  placeholder="SUA_INSTANCIA"
                />
              </div>
              <div className="space-y-2">
                <Label>Instance Token</Label>
                <Input
                  type="password"
                  value={credentials.instance_token}
                  onChange={(e) => setCredentials(c => ({ ...c, instance_token: e.target.value }))}
                  placeholder="SEU_TOKEN"
                />
              </div>
              <div className="space-y-2">
                <Label>Client Token</Label>
                <Input
                  type="password"
                  value={credentials.client_token}
                  onChange={(e) => setCredentials(c => ({ ...c, client_token: e.target.value }))}
                  placeholder="TOKEN DE SEGURANÇA"
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleSaveCredentials}>
              Salvar credenciais
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Message Modal */}
      <Dialog open={testMessageModalOpen} onOpenChange={setTestMessageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar mensagem de teste</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Telefone (com DDI)</Label>
              <Input
                value={testMessage.phone}
                onChange={(e) => setTestMessage(t => ({ ...t, phone: e.target.value }))}
                placeholder="5511999999999"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={testMessage.message}
                onChange={(e) => setTestMessage(t => ({ ...t, message: e.target.value }))}
                placeholder="Olá, esta é uma mensagem de teste..."
                rows={4}
              />
            </div>
            <Button className="w-full" onClick={handleSendTestMessage}>
              <Send className="mr-2 h-4 w-4" />
              Enviar mensagem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
