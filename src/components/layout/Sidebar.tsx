import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Users, MessageCircle, LucideIcon, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'hidden h-screen flex-shrink-0 border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex md:flex-col',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <span className="text-lg font-bold text-sidebar-foreground">OrçaZap</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', active && 'stroke-[2.5]')} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">
            MVP v1.0 • Pronto para API
          </p>
        </div>
      )}
    </aside>
  );
}
