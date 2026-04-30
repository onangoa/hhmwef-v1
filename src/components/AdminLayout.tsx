'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import NotificationsDropdown from '@/components/ui/NotificationsDropdown';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
  UserPlus,
  Upload,
  HeartHandshake,
  Wallet,
  User,
  ChevronDown,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { getUser, removeUser, isAdmin } from '@/lib/auth-client';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin-panel',
    group: 'main',
  },
  {
    id: 'nav-members',
    label: 'All Members',
    icon: Users,
    href: '/admin-panel/members',
    badge: 0,
    group: 'main',
  },
  {
    id: 'nav-pending',
    label: 'Pending Verifications',
    icon: ClipboardCheck,
    href: '/admin-panel/pending-verification',
    badge: 0,
    group: 'main',
  },
  {
    id: 'nav-upload',
    label: 'Upload Members',
    icon: Upload,
    href: '/admin-panel/upload',
    group: 'main',
  },
  {
    id: 'nav-welfare',
    label: 'Welfare Cases',
    icon: HeartHandshake,
    href: '/welfare-cases',
    group: 'main',
  },
  {
    id: 'nav-contributions',
    label: 'Contributions',
    icon: Wallet,
    href: '/admin-panel/contributions',
    group: 'main',
  },
  {
    id: 'nav-reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/admin-panel/reports',
    group: 'analytics',
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin-panel/settings',
    group: 'system',
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/login-screen');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/members?status=INACTIVE&limit=1');
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
  }, []);

  const handleLogout = () => {
    removeUser();
    router.push('/login-screen');
  };

  if (!user || !isAdmin()) {
    return null;
  }

  const navItems = NAV_ITEMS.map((item) =>
    item.id === 'nav-pending' ? { ...item, badge: pendingCount } : item
  );

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-blue-800/40 ${
          collapsed && !isMobile ? 'justify-center px-2' : ''
        }`}
      >
        <div className="flex-shrink-0">
          <AppLogo size={32} />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <span className="font-bold text-white text-lg leading-tight tracking-tight">
              HHS Welfare
            </span>
            <p className="text-blue-300 text-xs font-medium leading-tight">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {/* Main */}
        {(!collapsed || isMobile) && (
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2 px-2">
            Management
          </p>
        )}
        <div className="space-y-1 mb-6">
          {navItems
            .filter((n) => n.group === 'main')
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href.split('#')[0]);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-blue-500/20 text-white'
                      : 'text-blue-200 hover:bg-blue-800/40 hover:text-white'
                  } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${isActive ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'}`}
                  />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && !isMobile && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Analytics */}
        {(!collapsed || isMobile) && (
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2 px-2">
            Analytics
          </p>
        )}
        <div className="space-y-1 mb-6">
          {navItems
            .filter((n) => n.group === 'analytics')
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-500/20 text-white'
                      : 'text-blue-200 hover:bg-blue-800/40 hover:text-white'
                  } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${isActive ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'}`}
                  />
                  {(!collapsed || isMobile) && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
        </div>

        {/* System */}
        {(!collapsed || isMobile) && (
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2 px-2">
            System
          </p>
        )}
        <div className="space-y-1">
          {navItems
            .filter((n) => n.group === 'system')
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-500/20 text-white'
                      : 'text-blue-200 hover:bg-blue-800/40 hover:text-white'
                  } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${isActive ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'}`}
                  />
                  {(!collapsed || isMobile) && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
        </div>
      </nav>

      {/* Register Link */}
      {(!collapsed || isMobile) && (
        <div className="px-3 pb-3">
          <Link
            href="/member-dashboard/profile"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-200 hover:bg-blue-500/30 hover:text-white transition-all duration-150 text-sm font-medium"
          >
            <UserPlus size={16} />
            <span>My Profile</span>
          </Link>
        </div>
      )}

      {/* User Profile */}
      <div
        className={`border-t border-blue-800/40 p-3 ${collapsed && !isMobile ? 'flex justify-center' : ''}`}
      >
        {collapsed && !isMobile ? (
          <button
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            title="Admin User"
          >
            A
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.email}</p>
              <p className="text-blue-300 text-xs truncate">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-blue-400 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gradient-to-b from-blue-900 to-blue-950 shadow-sidebar flex-shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full bg-white border border-border rounded-full w-6 h-6 flex items-center justify-center shadow-card hover:shadow-card-hover transition-all duration-150 z-10"
          style={{ marginLeft: collapsed ? '64px' : '240px', transition: 'margin-left 300ms ease' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={12} className="text-blue-700" />
          ) : (
            <ChevronLeft size={12} className="text-blue-700" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-950 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-blue-300 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <SidebarContent isMobile />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-border px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0 shadow-card">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <NotificationsDropdown memberId={user?.member?.id} />
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-3 border-l border-border hover:bg-muted/50 rounded-lg py-1 px-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {user?.role || 'Administrator'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-card border border-border z-20 animate-slide-up">
                    <div className="p-1">
                      <Link
                        href={`/admin-panel/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        <User size={16} className="text-muted-foreground" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href={`/admin-panel/settings`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        <Settings size={16} className="text-muted-foreground" />
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
