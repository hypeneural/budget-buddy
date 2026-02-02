import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ListItemClickable } from '@/components/ListItemClickable';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuoteStore } from '@/stores/quoteStore';
import { categories, cities } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function QuotesList() {
  const navigate = useNavigate();
  const { getOpenQuotes, getClosedQuotes } = useQuoteStore();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const openQuotes = getOpenQuotes();
  const closedQuotes = getClosedQuotes();

  const filterQuotes = (quotes: typeof openQuotes) => {
    return quotes.filter((q) => {
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      if (cityFilter !== 'all' && !q.cities.includes(cityFilter)) return false;
      return true;
    });
  };

  const renderQuoteList = (quotes: typeof openQuotes, emptyMessage: string) => {
    const filtered = filterQuotes(quotes);

    if (filtered.length === 0) {
      return (
        <EmptyState
          title={emptyMessage}
          description="Ajuste os filtros ou crie um novo orçamento"
          action={{
            label: 'Novo orçamento',
            onClick: () => navigate('/quotes/new'),
          }}
        />
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((quote) => {
          const responded = quote.suppliers.filter((s) => s.status !== 'waiting').length;
          const total = quote.suppliers.length;

          return (
            <ListItemClickable
              key={quote.id}
              onClick={() => navigate(`/quotes/${quote.id}`)}
              rightContent={<StatusBadge status={quote.status} size="sm" />}
              showChevron
            >
              <div className="space-y-1">
                <h3 className="font-medium text-foreground">{quote.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{quote.category}</span>
                  <span>•</span>
                  <span className="truncate">{quote.cities.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 max-w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(responded / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {responded}/{total} responderam
                  </span>
                </div>
              </div>
            </ListItemClickable>
          );
        })}
      </div>
    );
  };

  return (
    <AppLayout
      title="Orçamentos"
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
        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 rounded-xl bg-card p-4 shadow-soft-sm animate-slide-up">
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="open">
              Em orçamento ({openQuotes.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Fechados ({closedQuotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-4">
            {renderQuoteList(openQuotes, 'Nenhum orçamento em aberto')}
          </TabsContent>

          <TabsContent value="closed" className="mt-4">
            {renderQuoteList(closedQuotes, 'Nenhum orçamento fechado')}
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={() => navigate('/quotes/new')} />
    </AppLayout>
  );
}
