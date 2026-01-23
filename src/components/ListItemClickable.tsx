import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface ListItemClickableProps {
  children: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
  rightContent?: ReactNode;
}

export function ListItemClickable({
  children,
  onClick,
  showChevron = true,
  className,
  rightContent,
}: ListItemClickableProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-xl bg-card p-4 shadow-soft-sm',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-soft-md active:scale-[0.99] tap-none',
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {rightContent}
      {showChevron && onClick && (
        <ChevronRight className="ml-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
      )}
    </div>
  );
}
