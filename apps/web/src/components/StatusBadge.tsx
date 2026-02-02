import { cn } from '@/lib/utils';
import { SupplierQuoteStatus, QuoteStatus, WhatsAppInstanceStatus } from '@/types';

type StatusType = SupplierQuoteStatus | QuoteStatus | WhatsAppInstanceStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Supplier Quote Status
  waiting: {
    label: 'Aguardando',
    className: 'bg-warning-light text-warning',
  },
  responded: {
    label: 'Respondeu',
    className: 'bg-info-light text-info',
  },
  winner: {
    label: 'Vencedor',
    className: 'bg-success-light text-success',
  },
  // Quote Status
  open: {
    label: 'Em Orçamento',
    className: 'bg-primary-light text-primary',
  },
  closed: {
    label: 'Fechado',
    className: 'bg-muted text-muted-foreground',
  },
  // WhatsApp Instance Status
  connected: {
    label: 'Conectado',
    className: 'bg-success-light text-success',
  },
  disconnected: {
    label: 'Desconectado',
    className: 'bg-destructive-light text-destructive',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm font-medium',
};

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
