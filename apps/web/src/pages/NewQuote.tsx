import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MultiSelect } from '@/components/MultiSelect';
import { Button } from '@/components/ui/button';
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
import { useSupplierStore } from '@/stores/supplierStore';
import { categories, cities } from '@/data/mockData';
import { toast } from 'sonner';

type Step = 1 | 2;

const defaultMessage = `Olá! Estamos solicitando orçamento para os seguintes itens:

[Descreva os itens aqui]

Por favor, informe:
- Preço unitário
- Prazo de entrega
- Condições de pagamento

Aguardamos retorno.
Obrigado!`;

export default function NewQuote() {
  const navigate = useNavigate();
  const { addQuote } = useQuoteStore();
  const { getSuppliersByCategoryAndCities } = useSupplierStore();

  const [step, setStep] = useState<Step>(1);
  
  // Step 1
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  
  // Step 2
  const [message, setMessage] = useState(defaultMessage);
  const [title, setTitle] = useState('');

  const matchingSuppliers = selectedCategory && selectedCities.length > 0
    ? getSuppliersByCategoryAndCities(selectedCategory, selectedCities)
    : [];

  const cityOptions = cities.map(c => ({ value: c.name, label: c.name }));

  const handleContinue = () => {
    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return;
    }
    if (selectedCities.length === 0) {
      toast.error('Selecione pelo menos uma cidade');
      return;
    }
    if (matchingSuppliers.length === 0) {
      toast.error('Nenhum fornecedor encontrado para esta seleção');
      return;
    }
    setStep(2);
  };

  const handleSend = () => {
    if (!title.trim()) {
      toast.error('Dê um título para o orçamento');
      return;
    }
    if (!message.trim()) {
      toast.error('Escreva a mensagem do orçamento');
      return;
    }

    const newQuote = addQuote({
      title: title.trim(),
      category: selectedCategory,
      cities: selectedCities,
      message: message.trim(),
      supplierIds: matchingSuppliers.map(s => s.id),
    });

    toast.success('Orçamento criado com sucesso!');
    navigate(`/quotes/${newQuote.id}`);
  };

  return (
    <AppLayout
      title="Novo orçamento"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <div className="p-4 md:p-6 animate-fade-in">
        {/* Progress indicator */}
        <div className="mb-6 flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`h-1 flex-1 rounded-full ${
            step >= 2 ? 'bg-primary' : 'bg-muted'
          }`} />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Segmentação</h2>
              <p className="text-sm text-muted-foreground">
                Escolha a categoria e as cidades para encontrar fornecedores
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a categoria" />
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
                <Label>Cidades</Label>
                <MultiSelect
                  options={cityOptions}
                  value={selectedCities}
                  onChange={setSelectedCities}
                  placeholder="Selecione as cidades"
                />
              </div>
            </div>

            {/* Matching suppliers count */}
            {selectedCategory && selectedCities.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-primary-light p-4 text-primary">
                <Users className="h-5 w-5" />
                <span className="font-medium">
                  {matchingSuppliers.length} fornecedor{matchingSuppliers.length !== 1 && 'es'} encontrado{matchingSuppliers.length !== 1 && 's'}
                </span>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleContinue}
              disabled={!selectedCategory || selectedCities.length === 0}
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Mensagem</h2>
              <p className="text-sm text-muted-foreground">
                Escreva a mensagem que será enviada para os fornecedores
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título do orçamento</Label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Cimento e Areia"
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem..."
                  className="min-h-[300px] text-base"
                />
              </div>
            </div>

            {/* Info bar */}
            <div className="flex items-center gap-2 rounded-xl bg-info-light p-4 text-info">
              <Send className="h-5 w-5" />
              <span className="font-medium">
                Será enviado para {matchingSuppliers.length} fornecedor{matchingSuppliers.length !== 1 && 'es'}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleSend}
              >
                <Send className="mr-2 h-4 w-4" />
                Disparar orçamento
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
