import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  CheckSquare,
  Users,
  ArrowLeftRight,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  FileStack,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard' },
  { label: 'Invoices', icon: FileText, href: '/app/invoices', permission: 'invoices.view' },
  { label: 'Payables', icon: CreditCard, href: '/app/payables', permission: 'payables.view' },
  { label: 'Payment Runs', icon: FileStack, href: '/app/payment-runs', permission: 'payables.view' },
  { label: 'Projection', icon: TrendingUp, href: '/app/payment-projection', permission: 'payables.view' },
  { label: 'Approvals', icon: CheckSquare, href: '/app/approvals', permission: 'invoices.approve' },
  { label: 'Vendors', icon: Users, href: '/app/vendors', permission: 'vendors.view' },
  { label: 'Reconciliation', icon: ArrowLeftRight, href: '/app/reconciliation', permission: 'reconciliation.view' },
  { label: 'Reports', icon: BarChart3, href: '/app/reports', permission: 'reports.view' },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: Settings, href: '/app/settings', permission: 'settings.view' },
];

export function AppSidebar() {
  const { user, company, logout, hasPermission } = useAuth();
  const location = useLocation();

  const visibleNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const visibleBottomItems = bottomNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside className="w-64 flex flex-col h-screen fixed left-0 top-0 z-50" 
      style={{
        background: 'linear-gradient(180deg, hsl(220 25% 8% / 0.95) 0%, hsl(220 25% 6% / 0.98) 100%)',
        backdropFilter: 'blur(20px) saturate(150%)',
        borderRight: '1px solid hsl(220 20% 15% / 0.5)',
        boxShadow: '4px 0 30px hsl(220 20% 4% / 0.5)'
      }}
    >
      {/* Company Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(200 100% 60%) 0%, hsl(260 100% 70%) 100%)',
              boxShadow: '0 0 20px hsl(200 100% 60% / 0.3)'
            }}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate gradient-text">
              {company?.name || 'PayFlow'}
            </h2>
            <p className="text-xs text-sidebar-foreground/60">
              {company?.baseCurrency || 'USD'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/app/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group',
                isActive
                  ? 'text-white'
                  : 'text-sidebar-foreground hover:text-white'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, hsl(200 100% 50% / 0.2) 0%, hsl(260 100% 60% / 0.15) 100%)',
                border: '1px solid hsl(200 100% 60% / 0.3)',
                boxShadow: '0 0 20px hsl(200 100% 60% / 0.15), inset 0 1px 0 hsl(200 100% 80% / 0.1)'
              } : {}}
            >
              {/* Hover glow effect */}
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                !isActive && "bg-gradient-to-r from-transparent via-white/5 to-transparent"
              )} />
              
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 relative z-10 transition-all duration-300",
                isActive && "drop-shadow-[0_0_8px_hsl(200_100%_60%_/_0.5)]"
              )} />
              <span className="relative z-10">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
                  style={{
                    background: 'linear-gradient(180deg, hsl(200 100% 60%) 0%, hsl(260 100% 70%) 100%)',
                    boxShadow: '0 0 10px hsl(200 100% 60% / 0.5)'
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {visibleBottomItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group',
                isActive
                  ? 'text-white'
                  : 'text-sidebar-foreground hover:text-white'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, hsl(200 100% 50% / 0.2) 0%, hsl(260 100% 60% / 0.15) 100%)',
                border: '1px solid hsl(200 100% 60% / 0.3)',
                boxShadow: '0 0 20px hsl(200 100% 60% / 0.15)'
              } : {}}
            >
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                !isActive && "bg-gradient-to-r from-transparent via-white/5 to-transparent"
              )} />
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 relative z-10",
                isActive && "drop-shadow-[0_0_8px_hsl(200_100%_60%_/_0.5)]"
              )} />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, hsl(200 100% 50% / 0.3) 0%, hsl(260 100% 60% / 0.3) 100%)',
              border: '1px solid hsl(200 100% 60% / 0.3)',
              boxShadow: '0 0 15px hsl(200 100% 60% / 0.2)'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-white/5 text-sidebar-foreground hover:text-destructive transition-all duration-300 relative overflow-hidden group"
            title="Sign out"
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-destructive/10" />
            <LogOut className="w-4 h-4 relative z-10" />
          </button>
        </div>
      </div>
    </aside>
  );
}
