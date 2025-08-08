// client/components/Layout.tsx
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Package,
  BookOpen,
  ShoppingCart,
  Warehouse,
  Shield,
  Activity,
  Settings as SettingsIcon,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Zap
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Package,
    description: 'Overview and statistics'
  },
  {
    name: 'Enhanced Dashboard',
    href: '/admin/enhanced',
    icon: Zap,
    description: 'Advanced metrics & real-time monitoring',
    badge: 'New'
  },
  {
    name: 'Product Catalog',
    href: '/admin/catalog',
    icon: BookOpen,
    description: 'Manage catalogs',
    permission: 'tmf620:read'
  },
  {
    name: 'Product Ordering',
    href: '/admin/ordering',
    icon: ShoppingCart,
    description: 'Order management',
    permission: 'tmf622:read'
  },
  {
    name: 'Product Inventory',
    href: '/admin/inventory',
    icon: Warehouse,
    description: 'Inventory tracking',
    permission: 'tmf637:read'
  },
  {
    name: 'Product Qualification',
    href: '/admin/qualification',
    icon: Shield,
    description: 'Validation & qualification',
    permission: 'tmf679:read'
  },
  {
    name: 'Event Management',
    href: '/admin/events',
    icon: Activity,
    description: 'Events & monitoring',
    permission: 'tmf688:read'
  },
  {
    name: 'Product Configuration',
    href: '/admin/configuration',
    icon: SettingsIcon,
    description: 'Configuration management',
    permission: 'tmf760:read'
  }
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isActivePath = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link to="/admin" className="flex items-center space-x-2 ml-2 lg:ml-0">
                <div className="flex items-center justify-center w-10 h-8 bg-white rounded-lg p-1 shadow-sm">
                  <img 
                    src="/images/slt-mobitel-logo.png" 
                    alt="SLT Mobitel Logo" 
                    className="h-10 w-30"
                  />
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">
                  SLT_Prodigy Hub
                </span>
              </Link>
            </div>

            {/* Center - Search */}
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-start max-w-lg">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search APIs, orders, events..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 pt-0 transform transition-transform duration-200 ease-in-out lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.department}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    user?.role === 'admin' ? 'border-red-200 text-red-700' : 'border-blue-200 text-blue-700'
                  }`}
                >
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;