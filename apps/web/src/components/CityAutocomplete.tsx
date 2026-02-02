import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { citiesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface CityOption {
    id: number;
    name: string;
    uf: string;
    display_name: string;
}

interface CityAutocompleteProps {
    value?: number | null;
    initialCity?: CityOption | null;
    onSelect: (city: CityOption | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CityAutocomplete({
    value,
    initialCity,
    onSelect,
    placeholder = 'Buscar cidade...',
    className,
    disabled,
}: CityAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CityOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<CityOption | null>(initialCity || null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Update selected city when initialCity changes
    useEffect(() => {
        if (initialCity) {
            setSelectedCity(initialCity);
            setQuery('');
        }
    }, [initialCity]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchCities = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await citiesApi.getAll({ search: searchQuery, limit: 15 });
            setResults(response.data.data || []);
        } catch (error) {
            console.error('Failed to search cities:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        setIsOpen(true);

        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            searchCities(newQuery);
        }, 300);
    };

    const handleSelect = (city: CityOption) => {
        setSelectedCity(city);
        setQuery('');
        setIsOpen(false);
        onSelect(city);
    };

    const handleClear = () => {
        setSelectedCity(null);
        setQuery('');
        setResults([]);
        onSelect(null);
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {selectedCity ? (
                /* Selected city display */
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="flex-1 truncate text-sm">
                        {selectedCity.name} - {selectedCity.uf}
                    </span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ) : (
                /* Search input */
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => query.length >= 2 && setIsOpen(true)}
                        placeholder={placeholder}
                        className="pl-10 pr-10"
                        disabled={disabled}
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}

            {/* Dropdown results */}
            {isOpen && !selectedCity && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
                    <ul className="max-h-60 overflow-auto py-1">
                        {results.map((city) => (
                            <li key={city.id}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(city)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                                >
                                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium">{city.name}</span>
                                    <span className="text-muted-foreground">- {city.uf}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* No results message */}
            {isOpen && !selectedCity && query.length >= 2 && !isLoading && results.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-3">
                    <p className="text-sm text-muted-foreground text-center">
                        Nenhuma cidade encontrada
                    </p>
                </div>
            )}
        </div>
    );
}
