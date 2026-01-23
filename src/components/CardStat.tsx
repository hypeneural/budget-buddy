import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CardStatProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function CardStat({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
  onClick,
}: CardStatProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card p-4 shadow-soft-md transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-soft-lg active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% vs ontem
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            iconClassName || 'bg-primary-light'
          )}
        >
          <Icon className={cn('h-5 w-5', iconClassName ? 'text-current' : 'text-primary')} />
        </div>
      </div>
    </div>
  );
}
