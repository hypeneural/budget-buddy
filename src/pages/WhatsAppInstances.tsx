import { useState } from 'react';
import { Smartphone, Wifi, WifiOff, Plus, QrCode, X, Power } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWhatsAppStore } from '@/stores/whatsappStore';
import { WhatsAppInstance } from '@/types';
import { toast } from 'sonner';

export default function WhatsAppInstances() {
  const { instances, addInstance, connectInstance, disconnectInstance, deleteInstance } = useWhatsAppStore();

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [newInstanceModalOpen, setNewInstanceModalOpen] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');

  const handleConnect = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setQrModalOpen(true);
    
    // Simulate connection after 3 seconds
    setTimeout(() => {
      connectInstance(instance.id, '+55 11 99999-' + Math.floor(1000 + Math.random() * 9000));
      setQrModalOpen(false);
      toast.success('WhatsApp conectado com sucesso!');
    }, 3000);
  };

  const handleDisconnect = () => {
    if (selectedInstance) {
      disconnectInstance(selectedInstance.id);
      setDisconnectModalOpen(false);
      toast.success('WhatsApp desconectado');
    }
  };

  const handleCreateInstance = () => {
    if (!newInstanceName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }
    addInstance(newInstanceName.trim());
    setNewInstanceName('');
    setNewInstanceModalOpen(false);
    toast.success('Instância criada');
  };

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
              <p className="font-medium">Conecte seu WhatsApp</p>
              <p className="text-sm opacity-80">
                Escaneie o QR Code com o WhatsApp do seu celular para conectar
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
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      instance.status === 'connected'
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
                      {instance.phoneNumber ? (
                        <p className="text-sm text-muted-foreground">{instance.phoneNumber}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Não conectado</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={instance.status} size="sm" />
                </div>

                <div className="mt-4 flex gap-2">
                  {instance.status === 'disconnected' ? (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleConnect(instance)}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Conectar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedInstance(instance);
                        setDisconnectModalOpen(true);
                      }}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      Desconectar
                    </Button>
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
            
            {/* Mock QR Code */}
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl bg-muted">
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-6 w-6 rounded-sm ${
                      Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Aguardando leitura...
            </div>
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
    </AppLayout>
  );
}
