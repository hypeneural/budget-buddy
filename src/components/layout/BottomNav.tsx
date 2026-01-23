import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Users, MessageCircle, LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/quotes', label: 'Orçamentos', icon: FileText },
  { path: '/suppliers', label: 'Fornecedores', icon: Users },
  { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bottom-nav safe-bottom md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 pt-3 transition-colors tap-none',
                active ? 'text-bottom-nav-active' : 'text-bottom-nav-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className={cn('text-[10px]', active && 'font-medium')}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 h-0.5 w-12 rounded-full bg-bottom-nav-active" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
