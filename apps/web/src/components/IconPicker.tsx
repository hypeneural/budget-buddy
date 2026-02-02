import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Package,
    Utensils,
    Camera,
    Music,
    Cake,
    PartyPopper,
    Flower2,
    Truck,
    Paintbrush,
    Lightbulb,
    Shirt,
    Gift,
    Sparkles,
    Speaker,
    Video,
    Mic2,
    Heart,
    Star,
    Crown,
    Gem,
    Coffee,
    Wine,
    Pizza,
    ChefHat,
    Tent,
    Sofa,
    Armchair,
    Lamp,
    Palette,
    Scissors,
    Hammer,
    Wrench,
    Building2,
    Car,
    Plane,
    Bus,
    Hotel,
    MapPin,
    TreePine,
    Umbrella,
    Sun,
    Moon,
    Baby,
    Dog,
    Cat,
    type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

// Curated icons for categories
const CATEGORY_ICONS: { name: string; icon: LucideIcon }[] = [
    { name: 'Package', icon: Package },
    { name: 'Utensils', icon: Utensils },
    { name: 'Camera', icon: Camera },
    { name: 'Music', icon: Music },
    { name: 'Cake', icon: Cake },
    { name: 'PartyPopper', icon: PartyPopper },
    { name: 'Flower2', icon: Flower2 },
    { name: 'Truck', icon: Truck },
    { name: 'Paintbrush', icon: Paintbrush },
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'Shirt', icon: Shirt },
    { name: 'Gift', icon: Gift },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Speaker', icon: Speaker },
    { name: 'Video', icon: Video },
    { name: 'Mic2', icon: Mic2 },
    { name: 'Heart', icon: Heart },
    { name: 'Star', icon: Star },
    { name: 'Crown', icon: Crown },
    { name: 'Gem', icon: Gem },
    { name: 'Coffee', icon: Coffee },
    { name: 'Wine', icon: Wine },
    { name: 'Pizza', icon: Pizza },
    { name: 'ChefHat', icon: ChefHat },
    { name: 'Tent', icon: Tent },
    { name: 'Sofa', icon: Sofa },
    { name: 'Armchair', icon: Armchair },
    { name: 'Lamp', icon: Lamp },
    { name: 'Palette', icon: Palette },
    { name: 'Scissors', icon: Scissors },
    { name: 'Hammer', icon: Hammer },
    { name: 'Wrench', icon: Wrench },
    { name: 'Building2', icon: Building2 },
    { name: 'Car', icon: Car },
    { name: 'Plane', icon: Plane },
    { name: 'Bus', icon: Bus },
    { name: 'Hotel', icon: Hotel },
    { name: 'MapPin', icon: MapPin },
    { name: 'TreePine', icon: TreePine },
    { name: 'Umbrella', icon: Umbrella },
    { name: 'Sun', icon: Sun },
    { name: 'Moon', icon: Moon },
    { name: 'Baby', icon: Baby },
    { name: 'Dog', icon: Dog },
    { name: 'Cat', icon: Cat },
];

interface IconPickerProps {
    value?: string;
    onChange: (iconName: string) => void;
    className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredIcons = CATEGORY_ICONS.filter(({ name }) =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedIcon = CATEGORY_ICONS.find(({ name }) => name === value);
    const SelectedIconComponent = selectedIcon?.icon || Package;

    const handleSelect = (iconName: string) => {
        onChange(iconName);
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-start gap-2', className)}
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-light">
                        <SelectedIconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <span className="flex-1 text-left">
                        {value || 'Selecionar ícone...'}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
                <Input
                    placeholder="Buscar ícone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-3"
                />
                <div className="grid max-h-60 grid-cols-6 gap-1 overflow-auto">
                    {filteredIcons.map(({ name, icon: Icon }) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => handleSelect(name)}
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                                value === name
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                            )}
                            title={name}
                        >
                            <Icon className="h-5 w-5" />
                        </button>
                    ))}
                </div>
                {filteredIcons.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                        Nenhum ícone encontrado
                    </p>
                )}
            </PopoverContent>
        </Popover>
    );
}

// Helper to render icon by name
export function CategoryIcon({
    name,
    className,
}: {
    name?: string | null;
    className?: string;
}) {
    const iconConfig = CATEGORY_ICONS.find((i) => i.name === name);
    const IconComponent = iconConfig?.icon || Package;
    return <IconComponent className={className} />;
}
