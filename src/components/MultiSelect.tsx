import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedLabels = options
    .filter(o => value.includes(o.value))
    .map(o => o.label);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex min-h-[44px] cursor-pointer flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2',
          'transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isOpen && 'border-primary ring-2 ring-ring ring-offset-2'
        )}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((label, index) => (
            <span
              key={value[index]}
              className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2 py-0.5 text-sm text-primary"
            >
              {label}
              <button
                onClick={(e) => removeOption(value[index], e)}
                className="ml-0.5 rounded hover:bg-primary/10"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-soft-lg animate-fade-in">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-3 py-2.5 transition-colors',
                    isSelected ? 'bg-primary-light' : 'hover:bg-muted'
                  )}
                >
                  <span className={cn(isSelected && 'font-medium text-primary')}>
                    {option.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
