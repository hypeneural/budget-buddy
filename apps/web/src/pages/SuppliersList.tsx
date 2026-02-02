import { useState } from 'react';
import { Search, Plus, Filter, MessageCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { QuickDrawer } from '@/components/QuickDrawer';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupplierStore } from '@/stores/supplierStore';
import { categories, cities } from '@/data/mockData';
import { Supplier } from '@/types';
import { toast } from 'sonner';

export default function SuppliersList() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, searchSuppliers } = useSupplierStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredSuppliers = () => {
    let result = searchQuery ? searchSuppliers(searchQuery) : suppliers;

    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter);
    }
    if (cityFilter !== 'all') {
      result = result.filter((s) => s.city === cityFilter);
    }

    return result;
  };

  const openNewDrawer = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormCategory('');
    setFormCity('');
    setFormAddress('');
    setFormWhatsapp('');
    setFormNotes('');
    setDrawerOpen(true);
  };

  const openEditDrawer = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormName(supplier.name);
    setFormCategory(supplier.category);
    setFormCity(supplier.city);
    setFormAddress(supplier.address || '');
    setFormWhatsapp(supplier.whatsapp);
    setFormNotes(supplier.notes || '');
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formCategory) {
      toast.error('Categoria é obrigatória');
      return;
    }
    if (!formCity) {
      toast.error('Cidade é obrigatória');
      return;
    }
    if (!formWhatsapp.trim()) {
      toast.error('WhatsApp é obrigatório');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: formName.trim(),
        category: formCategory,
        city: formCity,
        address: formAddress.trim() || undefined,
        whatsapp: formWhatsapp.trim(),
        notes: formNotes.trim() || undefined,
      });
      toast.success('Fornecedor atualizado');
    } else {
      addSupplier({
        name: formName.trim(),
        category: formCategory,
        city: formCity,
        address: formAddress.trim() || undefined,
        whatsapp: formWhatsapp.trim(),
        notes: formNotes.trim() || undefined,
      });
      toast.success('Fornecedor cadastrado');
    }

    setDrawerOpen(false);
  };

  const handleDelete = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      toast.success('Fornecedor excluído');
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  const openWhatsApp = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${formattedPhone}`, '_blank');
  };

  const filtered = filteredSuppliers();

  return (
    <AppLayout
      title="Fornecedores"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-primary-light text-primary' : ''}
        >
          <Filter className="h-5 w-5" />
        </Button>
      }
    >
      <div className="p-4 md:p-6 space-y-4 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou WhatsApp..."
            className="pl-10 h-11"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-card p-4 shadow-soft-sm animate-slide-up">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas cidades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhum fornecedor encontrado"
            description="Cadastre novos fornecedores para começar"
            action={{
              label: 'Novo fornecedor',
              onClick: openNewDrawer,
            }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((supplier) => (
              <div
                key={supplier.id}
                onClick={() => openEditDrawer(supplier)}
                className="flex items-center justify-between rounded-xl bg-card p-4 shadow-soft-sm cursor-pointer transition-all hover:shadow-soft-md active:scale-[0.99] tap-none"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-medium text-foreground truncate">{supplier.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                      {supplier.category}
                    </span>
                    <span>{supplier.city}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => openWhatsApp(supplier.whatsapp, e)}
                  className="ml-2 flex h-10 w-10 items-center justify-center rounded-lg bg-success-light text-success transition-colors hover:bg-success hover:text-success-foreground"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {filtered.length} fornecedor{filtered.length !== 1 && 'es'}
        </p>
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={openNewDrawer} />

      {/* Drawer */}
      <QuickDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingSupplier ? 'Editar fornecedor' : 'Novo fornecedor'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Nome do fornecedor"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={formCategory} onValueChange={setFormCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cidade *</Label>
            <Select value={formCity} onValueChange={setFormCity}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Endereço completo"
            />
          </div>

          <div className="space-y-2">
            <Label>WhatsApp *</Label>
            <Input
              value={formWhatsapp}
              onChange={(e) => setFormWhatsapp(e.target.value)}
              placeholder="11999998888"
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Anotações sobre o fornecedor..."
              className="min-h-20"
            />
          </div>

          <div className="space-y-2 pt-4">
            <Button className="w-full" onClick={handleSave}>
              {editingSupplier ? 'Salvar alterações' : 'Cadastrar fornecedor'}
            </Button>

            {editingSupplier && (
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive-light"
                onClick={() => {
                  setSupplierToDelete(editingSupplier);
                  setDeleteModalOpen(true);
                }}
              >
                Excluir fornecedor
              </Button>
            )}
          </div>
        </div>
      </QuickDrawer>

      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Excluir fornecedor"
        description={`Tem certeza que deseja excluir "${supplierToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
