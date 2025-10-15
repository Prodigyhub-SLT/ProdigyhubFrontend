// client/components/Layout.tsx
import { ReactNode, useState, useEffect } from 'react';
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
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { productOrderingApi } from '@/lib/api';

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

interface OrderEvent {
  id: string;
  orderId: string;
  productName: string;
  eventType: string;
  previousState?: string;
  currentState: string;
  timestamp: string;
  priority: string;
  description: string;
  orderInfo?: {
    totalPrice?: number;
    currency?: string;
    customerName?: string;
    items?: any[];
  };
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [lifecycleEvents, setLifecycleEvents] = useState<OrderEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Product Catalog tabs for search
  const catalogTabs = [
    { name: 'Offerings', tab: 'offerings', icon: Package, description: 'Product offerings management' },
    { name: 'Specs', tab: 'specs', icon: BookOpen, description: 'Product specifications' },
    { name: 'Prices', tab: 'prices', icon: ShoppingCart, description: 'Offers pricing' },
    { name: 'Categories', tab: 'categories', icon: SettingsIcon, description: 'Category management' },
    { name: 'Overview', tab: 'overview', icon: Activity, description: 'Catalog overview' }
  ];

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

  // Search functionality
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { pages: [], tabs: [] };

    const query = searchQuery.toLowerCase();
    
    // Search through navigation items
    const matchingPages = filteredNavItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );

    // Search through catalog tabs
    const matchingTabs = catalogTabs.filter(tab =>
      tab.name.toLowerCase().includes(query) ||
      tab.description.toLowerCase().includes(query)
    );

    return { pages: matchingPages, tabs: matchingTabs };
  };

  const handleSearchResultClick = (type: 'page' | 'tab', item: any) => {
    if (type === 'page') {
      navigate(item.href);
    } else if (type === 'tab') {
      // Navigate to Product Catalog and set the tab
      navigate(`/admin/catalog?tab=${item.tab}`);
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const searchResults = getSearchResults();
  const hasSearchResults = searchResults.pages.length > 0 || searchResults.tabs.length > 0;

  const generateLifecycleEvents = (orders: any[]): OrderEvent[] => {
    const events: OrderEvent[] = [];
    
    orders.forEach((order) => {
      const productName = order.productOrderItem?.[0]?.productOffering?.name || 'Unknown Product';
      const baseEventData = {
        orderId: order.id,
        productName,
        timestamp: order.orderDate || new Date().toISOString(),
        orderInfo: {
          totalPrice: order.orderTotalPrice?.[0]?.price?.taxIncludedAmount?.value,
          currency: order.orderTotalPrice?.[0]?.price?.taxIncludedAmount?.unit || 'USD',
          customerName: order.relatedParty?.[0]?.name || 'Unknown Customer',
          items: order.productOrderItem || []
        }
      };

      // Generate events based on current state and create lifecycle progression
      switch (order.state?.toLowerCase()) {
        case 'acknowledged':
          events.push({
            id: `${order.id}-acknowledged`,
            ...baseEventData,
            eventType: 'Order Acknowledged',
            currentState: 'acknowledged',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... has been acknowledged and is ready for processing`
          });
          break;

        case 'inprogress':
          // Add acknowledged event first
          events.push({
            id: `${order.id}-acknowledged`,
            ...baseEventData,
            eventType: 'Order Acknowledged',
            currentState: 'acknowledged',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... was acknowledged`,
            timestamp: new Date(new Date(baseEventData.timestamp).getTime() - 30 * 60000).toISOString() // 30 min ago
          });
          
          // Add in progress event
          events.push({
            id: `${order.id}-inprogress`,
            ...baseEventData,
            eventType: 'Order In Progress',
            previousState: 'acknowledged',
            currentState: 'inprogress',
            priority: 'High',
            description: `Order ${order.id.slice(0, 7)}... is now being processed and fulfilled`
          });
          break;

        case 'completed':
          // Add all previous states
          events.push({
            id: `${order.id}-acknowledged`,
            ...baseEventData,
            eventType: 'Order Acknowledged',
            currentState: 'acknowledged',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... was acknowledged`,
            timestamp: new Date(new Date(baseEventData.timestamp).getTime() - 120 * 60000).toISOString() // 2 hours ago
          });
          
          events.push({
            id: `${order.id}-inprogress`,
            ...baseEventData,
            eventType: 'Order In Progress',
            previousState: 'acknowledged',
            currentState: 'inprogress',
            priority: 'High',
            description: `Order ${order.id.slice(0, 7)}... was being processed`,
            timestamp: new Date(new Date(baseEventData.timestamp).getTime() - 60 * 60000).toISOString() // 1 hour ago
          });
          
          events.push({
            id: `${order.id}-completed`,
            ...baseEventData,
            eventType: 'Order Completed',
            previousState: 'inprogress',
            currentState: 'completed',
            priority: 'High',
            description: `Order ${order.id.slice(0, 7)}... has been successfully completed and delivered`
          });
          break;

        case 'cancelled':
          events.push({
            id: `${order.id}-cancelled`,
            ...baseEventData,
            eventType: 'Order Cancelled',
            currentState: 'cancelled',
            priority: 'Critical',
            description: `Order ${order.id.slice(0, 7)}... has been cancelled`
          });
          break;

        default:
          // Pending or unknown state
          events.push({
            id: `${order.id}-pending`,
            ...baseEventData,
            eventType: 'Order Created',
            currentState: 'pending',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... has been created and is awaiting acknowledgment`
          });
      }
    });

    // Sort by timestamp descending (most recent first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const fetchLifecycleEvents = async () => {
    try {
      setLoadingEvents(true);
      const ordersData = await productOrderingApi.getOrders().catch(() => []);
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      const events = generateLifecycleEvents(ordersArray);
      setLifecycleEvents(events);
    } catch (error) {
      console.error('Error fetching lifecycle events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEventClick = () => {
    navigate('/admin/events?tab=lifecycle');
  };

  const handleShowAllMessages = () => {
    navigate('/admin/events?tab=lifecycle');
  };

  useEffect(() => {
    fetchLifecycleEvents();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchLifecycleEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStateIcon = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'inprogress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'inprogress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                variant={"ghost" as const}
                size={"sm" as const}
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
                  placeholder="Search pages, tabs, offerings..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && hasSearchResults && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {/* Navigation Pages */}
                    {searchResults.pages.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Pages
                        </div>
                        {searchResults.pages.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.href}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSearchResultClick('page', item);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                            >
                              <Icon className="h-4 w-4 text-gray-500" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500 truncate">{item.description}</div>
                              </div>
                              {item.badge && (
                                <Badge variant={"secondary" as const} className="text-xs">{item.badge}</Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Product Catalog Tabs */}
                    {searchResults.tabs.length > 0 && (
                      <div className="p-2 border-t border-gray-200">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Product Catalog Tabs
                        </div>
                        {searchResults.tabs.map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.tab}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSearchResultClick('tab', tab);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors text-left"
                            >
                              <Icon className="h-4 w-4 text-blue-600" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900">{tab.name}</div>
                                <div className="text-xs text-gray-500 truncate">{tab.description}</div>
                              </div>
                              <Badge variant={"outline" as const} className="text-xs border-blue-200 text-blue-700">
                                Catalog
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* No Results */}
                {showSearchResults && !hasSearchResults && searchQuery.trim() && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4 text-center text-sm text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost" as const} size={"sm" as const} className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {lifecycleEvents.length > 0 ? Math.min(lifecycleEvents.length, 99) : 0}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Notifications</span>
                      <Badge variant={"secondary" as const} className="text-xs">
                        {lifecycleEvents.length} events
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {loadingEvents ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Loading events...
                    </div>
                  ) : lifecycleEvents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No lifecycle events found
                    </div>
                  ) : (
                    <>
                      {/* Last 3 Lifecycle Events */}
                      {lifecycleEvents.slice(0, 3).map((event) => (
                        <DropdownMenuItem 
                          key={event.id} 
                          onClick={handleEventClick}
                          className="p-3 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <div className="flex-shrink-0 mt-1">
                              {getStateIcon(event.currentState)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {event.eventType}
                                </p>
                                <Badge className={`text-xs ${getPriorityColor(event.priority)}`}>
                                  {event.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-1 truncate">
                                {event.productName}
                              </p>
                              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Order: {event.orderId.slice(0, 7)}...</span>
                                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      
                      {/* Show All Messages Button */}
                      {lifecycleEvents.length > 3 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={handleShowAllMessages}
                            className="p-3 cursor-pointer hover:bg-gray-50 text-center justify-center"
                          >
                            <Button 
                              variant={"outline" as const} 
                              size={"sm" as const} 
                              className="w-full"
                              onClick={handleShowAllMessages}
                            >
                              Show All Messages ({lifecycleEvents.length - 3} more)
                            </Button>
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost" as const} className="relative h-8 w-8 rounded-full">
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
                          <Badge variant={"secondary" as const} className="ml-2 text-xs">
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
                  variant={"outline" as const}
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