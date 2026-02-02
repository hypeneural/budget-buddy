import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CardStat } from '@/components/CardStat';
import { StatusBadge } from '@/components/StatusBadge';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ListItemClickable } from '@/components/ListItemClickable';
import { EmptyState } from '@/components/EmptyState';
import { useQuoteStore } from '@/stores/quoteStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { quotes, getOpenQuotes, getClosedQuotes } = useQuoteStore();
  
  const openQuotes = getOpenQuotes();
  const closedToday = getClosedQuotes().filter(q => {
    if (!q.closedAt) return false;
    const today = new Date();
    return q.closedAt.toDateString() === today.toDateString();
  });
  
  const waitingResponse = openQuotes.reduce((acc, q) => {
    return acc + q.suppliers.filter(s => s.status === 'waiting').length;
  }, 0);

  return (
    <AppLayout title="Dashboard">
      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          <CardStat
            title="Em aberto"
            value={openQuotes.length}
            icon={FileText}
            onClick={() => navigate('/quotes')}
          />
          <CardStat
            title="Aguardando resposta"
            value={waitingResponse}
            icon={Clock}
            iconClassName="bg-warning-light text-warning"
          />
          <CardStat
            title="Fechados hoje"
            value={closedToday.length}
            icon={CheckCircle2}
            iconClassName="bg-success-light text-success"
            className="col-span-2 md:col-span-1"
          />
        </div>

        {/* Open Quotes List */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Orçamentos em aberto
            </h2>
            {openQuotes.length > 0 && (
              <button
                onClick={() => navigate('/quotes')}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Ver todos
              </button>
            )}
          </div>

          {openQuotes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum orçamento em aberto"
              description="Crie um novo orçamento para começar"
              action={{
                label: 'Novo orçamento',
                onClick: () => navigate('/quotes/new'),
              }}
            />
          ) : (
            <div className="space-y-3">
              {openQuotes.slice(0, 5).map((quote) => {
                const responded = quote.suppliers.filter(s => s.status !== 'waiting').length;
                const total = quote.suppliers.length;
                
                return (
                  <ListItemClickable
                    key={quote.id}
                    onClick={() => navigate(`/quotes/${quote.id}`)}
                    rightContent={
                      <StatusBadge status={quote.status} size="sm" />
                    }
                    showChevron
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{quote.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{quote.category}</span>
                        <span>•</span>
                        <span>{quote.cities.join(', ')}</span>
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
          )}
        </section>
      </div>

      {/* FAB */}
      <FloatingActionButton
        onClick={() => navigate('/quotes/new')}
        label="Novo orçamento"
      />
    </AppLayout>
  );
}
