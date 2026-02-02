import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Trophy,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuickDrawer } from '@/components/QuickDrawer';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuoteStore, type ApiSupplier, type ApiQuote } from '@/stores/quoteStore';
import { useSupplierStore } from '@/stores/supplierStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SupplierQuoteStatus = 'waiting' | 'responded' | 'winner';

// Message status badge component
function MessageStatusBadge({ status }: { status: string }) {
  const config = {
    pending: { icon: Clock, label: 'Pendente', className: 'bg-muted text-muted-foreground' },
    queued: { icon: RefreshCw, label: 'Na fila', className: 'bg-blue-100 text-blue-700' },
    sent: { icon: CheckCircle2, label: 'Enviado', className: 'bg-green-100 text-green-700' },
    failed: { icon: AlertCircle, label: 'Erro', className: 'bg-red-100 text-red-700' },
  }[status] || { icon: Clock, label: status, className: 'bg-muted text-muted-foreground' };

  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      config.className
    )}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// Response status badge component  
function ResponseStatusBadge({ status }: { status: string }) {
  const config = {
    waiting: { label: 'Aguardando', className: 'bg-muted text-muted-foreground' },
    responded: { label: 'Respondeu', className: 'bg-primary-light text-primary' },
    winner: { label: 'Vencedor', className: 'bg-warning/20 text-warning' },
  }[status] || { label: status, className: 'bg-muted text-muted-foreground' };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      config.className
    )}>
      {status === 'winner' && <Trophy className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchQuoteById, updateQuote, updateSupplierQuote, closeQuote, broadcastQuote, getQuoteById } = useQuoteStore();
  const { whatsappInstances, fetchWhatsappInstances } = useSupplierStore();

  const [quote, setQuote] = useState<ApiQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showMessage, setShowMessage] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ApiSupplier | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');

  // Drawer form state
  const [drawerValue, setDrawerValue] = useState('');
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerStatus, setDrawerStatus] = useState<SupplierQuoteStatus>('waiting');

  // Load quote from API
  useEffect(() => {
    const loadQuote = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const quoteData = await fetchQuoteById(Number(id));
        if (quoteData) {
          setQuote(quoteData);
          setGeneralNotes(quoteData.general_notes || '');
        } else {
          setError('Orçamento não encontrado');
        }
      } catch {
        setError('Erro ao carregar orçamento');
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
    fetchWhatsappInstances();
  }, [id, fetchQuoteById, fetchWhatsappInstances]);

  // Sync with store updates
  useEffect(() => {
    if (id) {
      const storeQuote = getQuoteById(Number(id));
      if (storeQuote) {
        setQuote(storeQuote);
      }
    }
  }, [id, getQuoteById]);

  const handleRefresh = async () => {
    if (!id) return;
    setLoading(true);
    const quoteData = await fetchQuoteById(Number(id));
    if (quoteData) {
      setQuote(quoteData);
    }
    setLoading(false);
  };

  const handleOpenDrawer = (supplier: ApiSupplier) => {
    setSelectedSupplier(supplier);
    setDrawerValue(supplier.pivot?.value || '');
    setDrawerNotes(supplier.pivot?.notes || '');
    setDrawerStatus((supplier.pivot?.status || 'waiting') as SupplierQuoteStatus);
  };

  const handleSaveSupplier = async () => {
    if (!selectedSupplier || !quote) return;

    try {
      await updateSupplierQuote(quote.id, selectedSupplier.id, {
        value: drawerValue || undefined,
        notes: drawerNotes || undefined,
        status: drawerStatus,
      });

      // Refresh quote data
      const updatedQuote = await fetchQuoteById(quote.id);
      if (updatedQuote) setQuote(updatedQuote);

      toast.success('Fornecedor atualizado');
      setSelectedSupplier(null);
    } catch {
      toast.error('Erro ao atualizar fornecedor');
    }
  };

  const handleSaveNotes = async () => {
    if (!quote) return;

    try {
      await updateQuote(quote.id, { general_notes: generalNotes });
      setEditingNotes(false);
      toast.success('Observações salvas');
    } catch {
      toast.error('Erro ao salvar observações');
    }
  };

  const handleCloseQuote = async () => {
    if (!quote || !selectedWinner) {
      toast.error('Selecione um vencedor');
      return;
    }

    try {
      await closeQuote(quote.id, Number(selectedWinner));
      const updatedQuote = await fetchQuoteById(quote.id);
      if (updatedQuote) setQuote(updatedQuote);

      setShowCloseModal(false);
      toast.success('Orçamento fechado com sucesso!');
    } catch {
      toast.error('Erro ao fechar orçamento');
    }
  };

  const handleBroadcast = async () => {
    if (!quote || !selectedInstanceId) {
      toast.error('Selecione uma instância WhatsApp');
      return;
    }

    // Get suppliers with pending message status
    const pendingSuppliers = quote.suppliers?.filter(s =>
      s.pivot?.message_status === 'pending'
    ) || [];

    if (pendingSuppliers.length === 0) {
      toast.error('Nenhum fornecedor pendente para enviar');
      return;
    }

    setIsBroadcasting(true);
    try {
      const result = await broadcastQuote(
        quote.id,
        Number(selectedInstanceId),
        pendingSuppliers.map(s => s.id)
      );

      toast.success(`${result.queued} mensagens adicionadas à fila`);
      setShowBroadcastModal(false);

      // Refresh to see updated status
      setTimeout(handleRefresh, 1000);
    } catch {
      toast.error('Erro ao enviar mensagens');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${formattedPhone}`, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <AppLayout title="Orçamento">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <AppLayout title="Orçamento">
        <div className="p-4">
          <EmptyState
            title={error || "Orçamento não encontrado"}
            action={{ label: 'Voltar', onClick: () => navigate('/quotes') }}
          />
        </div>
      </AppLayout>
    );
  }

  const pendingCount = quote.suppliers?.filter(s => s.pivot?.message_status === 'pending').length || 0;
  const queuedCount = quote.suppliers?.filter(s => s.pivot?.message_status === 'queued').length || 0;
  const sentCount = quote.suppliers?.filter(s => s.pivot?.message_status === 'sent').length || 0;
  const failedCount = quote.suppliers?.filter(s => s.pivot?.message_status === 'failed').length || 0;
  const respondedSuppliers = quote.suppliers?.filter(s => s.pivot?.status !== 'waiting') || [];

  return (
    <AppLayout
      title=""
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/quotes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      }
    >
      <div className="p-4 md:p-6 space-y-4 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">{quote.title}</h1>
              <p className="text-sm text-muted-foreground">
                {quote.cities?.map(c => c.name).join(', ')}
              </p>
            </div>
            <span className={cn(
              'inline-flex rounded-full px-3 py-1 text-sm font-medium',
              quote.status === 'open'
                ? 'bg-green-100 text-green-700'
                : 'bg-muted text-muted-foreground'
            )}>
              {quote.status === 'open' ? 'Em andamento' : 'Fechado'}
            </span>
          </div>
        </div>

        {/* Message Status Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-muted p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{queuedCount}</p>
            <p className="text-xs text-blue-600">Na fila</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{sentCount}</p>
            <p className="text-xs text-green-600">Enviado</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
            <p className="text-xs text-red-600">Erro</p>
          </div>
        </div>

        {/* Send Button - Only if pending */}
        {quote.status === 'open' && pendingCount > 0 && (
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowBroadcastModal(true)}
          >
            <Send className="mr-2 h-5 w-5" />
            Enviar para {pendingCount} fornecedor{pendingCount !== 1 && 'es'}
          </Button>
        )}

        {/* Message (Collapsible) */}
        <div className="rounded-xl bg-card p-4 shadow-soft-sm">
          <button
            onClick={() => setShowMessage(!showMessage)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="font-medium text-foreground">Mensagem do orçamento</span>
            {showMessage ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {showMessage && (
            <div className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground border-t border-border pt-3">
              {quote.message}
            </div>
          )}
        </div>

        {/* General Notes */}
        <div className="rounded-xl bg-card p-4 shadow-soft-sm">
          <div className="flex items-center justify-between mb-2">
            <Label className="font-medium">Observação geral</Label>
            {!editingNotes && quote.status === 'open' && (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-sm text-primary hover:text-primary-hover"
              >
                Editar
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Adicione observações sobre este orçamento..."
                className="min-h-20"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNotes}>
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setGeneralNotes(quote.general_notes || '');
                    setEditingNotes(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {quote.general_notes || 'Nenhuma observação'}
            </p>
          )}
        </div>

        {/* Suppliers List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">
            Fornecedores ({quote.suppliers?.length || 0})
          </h2>

          {quote.suppliers?.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => handleOpenDrawer(supplier)}
              className="rounded-xl bg-card p-4 shadow-soft-sm cursor-pointer transition-all hover:shadow-soft-md active:scale-[0.99] tap-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {supplier.name}
                    </span>
                    {supplier.pivot?.status === 'winner' && (
                      <Trophy className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {supplier.city?.name}
                  </p>
                  {supplier.pivot?.value && (
                    <p className="text-sm font-semibold text-primary">{supplier.pivot.value}</p>
                  )}
                  {supplier.pivot?.sent_at && (
                    <p className="text-xs text-muted-foreground">
                      Enviado em {new Date(supplier.pivot.sent_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                  {supplier.pivot?.error_message && (
                    <p className="text-xs text-red-500">{supplier.pivot.error_message}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <MessageStatusBadge status={supplier.pivot?.message_status || 'pending'} />
                  <ResponseStatusBadge status={supplier.pivot?.status || 'waiting'} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Close Quote Button */}
        {quote.status === 'open' && respondedSuppliers.length > 0 && (
          <div className="pt-4">
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() => setShowCloseModal(true)}
            >
              Encerrar orçamento
            </Button>
          </div>
        )}
      </div>

      {/* Supplier Drawer */}
      <QuickDrawer
        open={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        title={selectedSupplier?.name || ''}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              value={drawerValue}
              onChange={(e) => setDrawerValue(e.target.value)}
              placeholder="Ex: R$ 1.500,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Status da resposta</Label>
            <Select value={drawerStatus} onValueChange={(v) => setDrawerStatus(v as SupplierQuoteStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting">Aguardando</SelectItem>
                <SelectItem value="responded">Respondeu</SelectItem>
                <SelectItem value="winner">Vencedor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea
              value={drawerNotes}
              onChange={(e) => setDrawerNotes(e.target.value)}
              placeholder="Ex: Melhor preço, entrega rápida..."
              className="min-h-24"
            />
          </div>

          <div className="space-y-2 pt-4">
            <Button
              className="w-full"
              onClick={handleSaveSupplier}
            >
              Salvar alterações
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => selectedSupplier && openWhatsApp(selectedSupplier.whatsapp)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </QuickDrawer>

      {/* Broadcast Modal */}
      <ConfirmModal
        open={showBroadcastModal}
        onOpenChange={setShowBroadcastModal}
        title="Enviar mensagens"
        description={`Enviar a mensagem do orçamento para ${pendingCount} fornecedor${pendingCount !== 1 ? 'es' : ''} pendente${pendingCount !== 1 ? 's' : ''}.`}
        confirmLabel={isBroadcasting ? "Enviando..." : "Enviar"}
        onConfirm={handleBroadcast}
      >
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Instância WhatsApp</Label>
            <Select value={selectedInstanceId} onValueChange={setSelectedInstanceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a instância" />
              </SelectTrigger>
              <SelectContent>
                {whatsappInstances.map((instance) => (
                  <SelectItem key={instance.id} value={String(instance.id)}>
                    {instance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ConfirmModal>

      {/* Close Quote Modal */}
      <ConfirmModal
        open={showCloseModal}
        onOpenChange={setShowCloseModal}
        title="Encerrar orçamento"
        description="Selecione o fornecedor vencedor para encerrar este orçamento."
        confirmLabel="Confirmar"
        onConfirm={handleCloseQuote}
      >
        <div className="py-4">
          <Select value={selectedWinner} onValueChange={setSelectedWinner}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o vencedor" />
            </SelectTrigger>
            <SelectContent>
              {respondedSuppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={String(supplier.id)}>
                  {supplier.name} {supplier.pivot?.value && `- ${supplier.pivot.value}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ConfirmModal>
    </AppLayout>
  );
}
