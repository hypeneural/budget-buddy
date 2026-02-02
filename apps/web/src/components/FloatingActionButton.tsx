import { cn } from '@/lib/utils';
import { Plus, LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  icon?: LucideIcon;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  icon: Icon = Plus,
  onClick,
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-4 z-40 flex items-center justify-center gap-2',
        'rounded-full bg-fab px-4 py-3.5 text-fab-foreground shadow-soft-xl',
        'transition-all duration-200 hover:bg-fab-hover hover:shadow-soft-xl',
        'active:scale-95 tap-none',
        'md:bottom-6 md:right-6',
        label ? 'pr-5' : 'h-14 w-14 p-0',
        className
      )}
    >
      <Icon className="h-6 w-6" />
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
}
