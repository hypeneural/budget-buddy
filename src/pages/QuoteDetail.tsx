import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, Trophy } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
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
import { useQuoteStore } from '@/stores/quoteStore';
import { SupplierQuote, SupplierQuoteStatus } from '@/types';
import { toast } from 'sonner';

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuoteById, updateQuote, updateSupplierQuote, closeQuote } = useQuoteStore();

  const quote = getQuoteById(id!);
  
  const [showMessage, setShowMessage] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierQuote | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [generalNotes, setGeneralNotes] = useState(quote?.generalNotes || '');

  // Drawer form state
  const [drawerValue, setDrawerValue] = useState('');
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerStatus, setDrawerStatus] = useState<SupplierQuoteStatus>('waiting');

  if (!quote) {
    return (
      <AppLayout title="Orçamento">
        <div className="p-4">
          <EmptyState
            title="Orçamento não encontrado"
            action={{ label: 'Voltar', onClick: () => navigate('/quotes') }}
          />
        </div>
      </AppLayout>
    );
  }

  const handleOpenDrawer = (supplierQuote: SupplierQuote) => {
    setSelectedSupplier(supplierQuote);
    setDrawerValue(supplierQuote.value || '');
    setDrawerNotes(supplierQuote.notes || '');
    setDrawerStatus(supplierQuote.status);
  };

  const handleSaveSupplier = () => {
    if (!selectedSupplier) return;

    updateSupplierQuote(quote.id, selectedSupplier.supplierId, {
      value: drawerValue || undefined,
      notes: drawerNotes || undefined,
      status: drawerStatus,
    });

    toast.success('Fornecedor atualizado');
    setSelectedSupplier(null);
  };

  const handleSaveNotes = () => {
    updateQuote(quote.id, { generalNotes });
    setEditingNotes(false);
    toast.success('Observações salvas');
  };

  const handleCloseQuote = () => {
    if (!selectedWinner) {
      toast.error('Selecione um vencedor');
      return;
    }
    closeQuote(quote.id, selectedWinner);
    setShowCloseModal(false);
    toast.success('Orçamento fechado com sucesso!');
  };

  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${formattedPhone}`, '_blank');
  };

  const respondedSuppliers = quote.suppliers.filter(s => s.status !== 'waiting');

  return (
    <AppLayout
      title=""
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/quotes')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <div className="p-4 md:p-6 space-y-4 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">{quote.title}</h1>
              <p className="text-sm text-muted-foreground">
                {quote.category} • {quote.cities.join(', ')}
              </p>
            </div>
            <StatusBadge status={quote.status} size="lg" />
          </div>
        </div>

        {/* Message (Collapsible) */}
        <div className="rounded-xl bg-card p-4 shadow-soft-sm">
          <button
            onClick={() => setShowMessage(!showMessage)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="font-medium text-foreground">Mensagem enviada</span>
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
                    setGeneralNotes(quote.generalNotes || '');
                    setEditingNotes(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {quote.generalNotes || 'Nenhuma observação'}
            </p>
          )}
        </div>

        {/* Suppliers List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">
            Fornecedores ({quote.suppliers.length})
          </h2>

          {quote.suppliers.map((sq) => (
            <div
              key={sq.supplierId}
              onClick={() => handleOpenDrawer(sq)}
              className="flex items-center justify-between rounded-xl bg-card p-4 shadow-soft-sm cursor-pointer transition-all hover:shadow-soft-md active:scale-[0.99] tap-none"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {sq.supplier.name}
                  </span>
                  {sq.status === 'winner' && (
                    <Trophy className="h-4 w-4 text-warning" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{sq.supplier.city}</p>
                {sq.value && (
                  <p className="text-sm font-semibold text-primary">{sq.value}</p>
                )}
                {sq.notes && (
                  <p className="text-xs text-muted-foreground truncate">{sq.notes}</p>
                )}
              </div>
              <StatusBadge status={sq.status} size="sm" />
            </div>
          ))}
        </div>

        {/* Close Quote Button */}
        {quote.status === 'open' && (
          <div className="fixed bottom-20 left-4 right-4 md:static md:mt-6">
            <Button
              className="w-full"
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
        title={selectedSupplier?.supplier.name || ''}
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
            <Label>Status</Label>
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
              onClick={() => selectedSupplier && openWhatsApp(selectedSupplier.supplier.whatsapp)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </QuickDrawer>

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
              {respondedSuppliers.map((sq) => (
                <SelectItem key={sq.supplierId} value={sq.supplierId}>
                  {sq.supplier.name} {sq.value && `- ${sq.value}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ConfirmModal>
    </AppLayout>
  );
}
