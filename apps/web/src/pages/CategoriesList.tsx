import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { toast } from 'sonner';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { categoriesApi } from '@/lib/api';

interface Category {
    id: number;
    name: string;
    icon: string | null;
    created_at: string;
}

export const CategoriesList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ name: '', icon: '' });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoriesApi.getAll();
            setCategories(response.data.data || []);
        } catch (error) {
            toast.error('Erro ao carregar categorias');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreateDialog = () => {
        setEditingCategory(null);
        setFormData({ name: '', icon: '' });
        setIsFormOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, icon: category.icon || '' });
        setIsFormOpen(true);
    };

    const openDeleteDialog = (category: Category) => {
        setDeletingCategory(category);
        setIsDeleteOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Nome é obrigatório');
            return;
        }

        try {
            setSaving(true);
            if (editingCategory) {
                await categoriesApi.update(editingCategory.id, formData);
                toast.success('Categoria atualizada!');
            } else {
                await categoriesApi.create(formData);
                toast.success('Categoria criada!');
            }
            setIsFormOpen(false);
            fetchCategories();
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao salvar categoria';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory) return;

        try {
            setSaving(true);
            await categoriesApi.delete(deletingCategory.id);
            toast.success('Categoria excluída!');
            setIsDeleteOpen(false);
            setDeletingCategory(null);
            fetchCategories();
        } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao excluir categoria';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout
            title="Categorias"
            headerActions={
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            }
        >
            <div className="p-6">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar categorias..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Categories List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Nenhuma categoria encontrada</h3>
                        <p className="text-muted-foreground">
                            {searchQuery ? 'Tente outro termo de busca' : 'Crie sua primeira categoria'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCategories.map((category) => (
                            <div
                                key={category.id}
                                className="group relative rounded-xl border bg-card p-4 shadow-soft-sm transition-shadow hover:shadow-soft-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                                        {category.icon ? (
                                            <span className="text-xl">{category.icon}</span>
                                        ) : (
                                            <Package className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{category.name}</h3>
                                    </div>
                                </div>

                                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEditDialog(category)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => openDeleteDialog(category)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Ex: Materiais de Construção"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon">Ícone (emoji)</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) =>
                                        setFormData({ ...formData, icon: e.target.value })
                                    }
                                    placeholder="Ex: 🧱"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Salvando...' : editingCategory ? 'Salvar' : 'Criar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {saving ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};
