import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Filter, Search, Calendar, User, AlertCircle, CheckCircle, Clock, X, BookOpen, Warehouse, Shield, Activity, Settings, Cog, RefreshCw } from 'lucide-react';
import { productOrderingApi, productCatalogApi, productInventoryApi, eventManagementApi, healthApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// API Dashboard Cards Data
const apiDashboards = [
  {
    id: 'catalog',
    title: 'Product Catalog',
    description: 'Manage catalogs, categories, and specifications',
    icon: BookOpen,
    path: '/admin/catalog',
    color: 'bg-blue-500',
    stats: 'Categories, Specs, Offerings',
    api: 'TMF620'
  },
  {
    id: 'ordering',
    title: 'Product Ordering',
    description: 'Manage product orders and cancellations',
    icon: Package,
    path: '/admin/ordering',
    color: 'bg-green-500',
    stats: 'Orders, Fulfillment, Tracking',
    api: 'TMF622'
  },
  {
    id: 'inventory',
    title: 'Product Inventory',
    description: 'Track and manage product inventory',
    icon: Warehouse,
    path: '/admin/inventory',
    color: 'bg-purple-500',
    stats: 'Stock, Availability, Lifecycle',
    api: 'TMF637'
  },
  {
    id: 'qualification',
    title: 'Product Qualification',
    description: 'Validate and qualify product offerings',
    icon: Shield,
    path: '/admin/qualification',
    color: 'bg-orange-500',
    stats: 'Validation, Eligibility, Rules',
    api: 'TMF679'
  },
  {
    id: 'events',
    title: 'Event Management',
    description: 'Monitor and manage system events',
    icon: Activity,
    path: '/admin/events',
    color: 'bg-red-500',
    stats: 'Events, Notifications, Monitoring',
    api: 'TMF688'
  },
  {
    id: 'configuration',
    title: 'Product Configuration',
    description: 'Configure and validate product setups',
    icon: Settings,
    path: '/admin/configuration',
    color: 'bg-indigo-500',
    stats: 'Config, Validation, Rules',
    api: 'TMF760'
  }
];

export default function Index() {
  const [orders, setOrders] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    totalCategories: 0,
    totalProducts: 0,
    totalEvents: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load data from different APIs in parallel
      const [ordersData, healthData, catalogData, inventoryData, eventsData] = await Promise.all([
        productOrderingApi.getOrders({ limit: 10 }).catch((error) => {
          console.warn('Product Ordering API not available:', error.message);
          return [];
        }),
        healthApi.getHealth().catch((error) => {
          console.warn('Health API not available:', error.message);
          return null;
        }),
        productCatalogApi.getCategories({ limit: 5 }).catch((error) => {
          console.warn('Product Catalog API not available:', error.message);
          return [];
        }),
        productInventoryApi.getProducts({ limit: 5 }).catch((error) => {
          console.warn('Product Inventory API not available:', error.message);
          return [];
        }),
        eventManagementApi.getEvents({ limit: 5 }).catch((error) => {
          console.warn('Event Management API not available:', error.message);
          return [];
        })
      ]);

      // Handle different response formats
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      const catalogArray = Array.isArray(catalogData) ? catalogData : [];
      const inventoryArray = Array.isArray(inventoryData) ? inventoryData : [];
      const eventsArray = Array.isArray(eventsData) ? eventsData : [];

      setOrders(ordersArray);
      setSystemHealth(healthData);

      // Calculate stats
      const stats = {
        totalOrders: ordersArray.length,
        completed: ordersArray.filter((o: any) => o.state === 'completed').length,
        inProgress: ordersArray.filter((o: any) => o.state === 'inProgress').length,
        pending: ordersArray.filter((o: any) => ['pending', 'acknowledged'].includes(o.state)).length,
        totalCategories: catalogArray.length,
        totalProducts: inventoryArray.length,
        totalEvents: eventsArray.length
      };
      
      setDashboardStats(stats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Dashboard data has been updated"
    });
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = stateFilter === 'all' || order.state === stateFilter;
    
    return matchesSearch && matchesState;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ProdigyHub Dashboard</h1>
                <p className="text-sm text-slate-500">TM Forum Product Management Platform</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/admin/orders/new" className="w-full sm:w-auto">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* API Dashboards Section */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">TM Forum API Dashboard</h2>
            <p className="text-slate-600 text-sm sm:text-base">Access and manage all Product Management APIs</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {apiDashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <Link key={dashboard.id} to={dashboard.path}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer border border-slate-200 group hover:border-slate-300 h-full">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 ${dashboard.color} rounded-xl text-white group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 sm:w-6 h-5 sm:h-6" />
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {dashboard.api}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors text-sm sm:text-base">
                          {dashboard.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2">
                          {dashboard.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {dashboard.stats}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">System Overview</h2>
            <p className="text-slate-600 text-sm sm:text-base">Current system statistics and performance</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-white shadow-sm border-slate-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Total Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{dashboardStats.totalOrders}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-slate-100 rounded-xl">
                    <Package className="w-5 sm:w-6 h-5 sm:h-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Completed</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{dashboardStats.completed}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-xl">
                    <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">In Progress</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">{dashboardStats.inProgress}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-xl">
                    <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Pending</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{dashboardStats.pending}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 bg-yellow-100 rounded-xl">
                    <AlertCircle className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Catalog Items</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{dashboardStats.totalCategories}</p>
                </div>
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Active categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">Products</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{dashboardStats.totalProducts}</p>
                </div>
                <Warehouse className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs text-slate-500 mt-2">In inventory</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">System Events</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{dashboardStats.totalEvents}</p>
                </div>
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Recent events</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}