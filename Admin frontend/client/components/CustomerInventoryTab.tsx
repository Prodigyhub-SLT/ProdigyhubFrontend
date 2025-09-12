import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  RefreshCw,
  Search,
  Layers,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Globe,
  Wifi,
  Smartphone,
  Tv,
  Phone,
  Clock,
  Calendar,
  DollarSign,
  Settings,
  MoreVertical,
  Filter
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'created' | 'suspended' | 'terminated';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
type ServiceTypeFilter = 'all' | 'broadband' | 'mobile' | 'tv' | 'voice';

interface Product {
  id: string;
  name: string;
  description?: string;
  status: string;
  serviceType: string;
  isCustomerVisible: boolean;
  isBundle: boolean;
  monthlyFee?: number;
  activationDate?: string;
  expiryDate?: string;
  bandwidth?: string;
  dataAllowance?: string;
  features?: string[];
  location?: string;
}

export function CustomerInventoryTab() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilter>('all');

  // Mock data for demonstration - replace with actual API call
  const mockProducts: Product[] = [
    {
      id: 'BB-001',
      name: 'Fiber Pro 100',
      description: 'High-speed fiber broadband connection',
      status: 'active',
      serviceType: 'broadband',
      isCustomerVisible: true,
      isBundle: false,
      monthlyFee: 4500,
      activationDate: '2024-01-15',
      expiryDate: '2025-01-15',
      bandwidth: '100 Mbps',
      dataAllowance: 'Unlimited',
      features: ['Static IP', 'Wi-Fi Router', '24/7 Support'],
      location: 'Colombo 03'
    },
    {
      id: 'MOB-002',
      name: 'Unlimited Mobile Pro',
      description: '4G/LTE unlimited mobile plan',
      status: 'active',
      serviceType: 'mobile',
      isCustomerVisible: true,
      isBundle: false,
      monthlyFee: 2500,
      activationDate: '2024-02-01',
      expiryDate: '2025-02-01',
      dataAllowance: 'Unlimited',
      features: ['4G LTE', 'Voice', 'SMS', 'Roaming'],
      location: 'Nationwide'
    },
    {
      id: 'TV-003',
      name: 'PEOTV Premium',
      description: 'Premium television package',
      status: 'suspended',
      serviceType: 'tv',
      isCustomerVisible: false,
      isBundle: false,
      monthlyFee: 3200,
      activationDate: '2024-01-20',
      expiryDate: '2025-01-20',
      features: ['HD Channels', 'Sports Package', 'Movies', 'Recorder'],
      location: 'Colombo 03'
    },
    {
      id: 'BUNDLE-004',
      name: 'Triple Play Supreme',
      description: 'Broadband + TV + Voice bundle',
      status: 'active',
      serviceType: 'bundle',
      isCustomerVisible: true,
      isBundle: true,
      monthlyFee: 7200,
      activationDate: '2024-03-01',
      expiryDate: '2025-03-01',
      bandwidth: '200 Mbps',
      dataAllowance: 'Unlimited',
      features: ['Fiber Internet', 'PEOTV', 'Voice', 'Wi-Fi Router'],
      location: 'Colombo 03'
    },
    {
      id: 'VOICE-005',
      name: 'Business Voice Line',
      description: 'Dedicated voice line for business',
      status: 'created',
      serviceType: 'voice',
      isCustomerVisible: false,
      isBundle: false,
      monthlyFee: 1200,
      activationDate: '2024-09-10',
      features: ['Dedicated Line', 'Call Waiting', 'Conference Call'],
      location: 'Colombo 03'
    }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to fetch from actual API first
      try {
        // Uncomment and modify this when you have the actual API
        // const response = await fetch('/api/productInventory/v1/products');
        // const data = await response.json();
        // setProducts(Array.isArray(data) ? data : []);
        
        // For now, use mock data
        setProducts(mockProducts);
      } catch (apiError) {
        // Fallback to mock data if API fails
        console.log('API not available, using mock data');
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Failed to load inventory products', error);
      // Use empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Auto-refresh when a new order is created
    const handleOrderCreated = () => fetchProducts();
    window.addEventListener('order-created', handleOrderCreated as EventListener);
    return () => window.removeEventListener('order-created', handleOrderCreated as EventListener);
  }, []);

  const filteredProducts = useMemo(() => {
    const text = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchesText =
        !text ||
        p.name?.toLowerCase().includes(text) ||
        p.description?.toLowerCase().includes(text) ||
        p.id?.toLowerCase().includes(text) ||
        p.serviceType?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === 'all' || p.status?.toLowerCase() === statusFilter;

      const isVisible = Boolean(p.isCustomerVisible);
      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'visible' && isVisible) ||
        (visibilityFilter === 'hidden' && !isVisible);

      const matchesServiceType =
        serviceTypeFilter === 'all' || 
        p.serviceType?.toLowerCase() === serviceTypeFilter ||
        (serviceTypeFilter === 'bundle' && p.isBundle);

      return matchesText && matchesStatus && matchesVisibility && matchesServiceType;
    });
  }, [products, searchTerm, statusFilter, visibilityFilter, serviceTypeFilter]);

  const getStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase();
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
    if (s === 'active') return <Badge className="bg-emerald-500 text-white">Active</Badge>;
    if (s === 'created') return <Badge className="bg-blue-500 text-white">Created</Badge>;
    if (s === 'suspended') return <Badge className="bg-amber-500 text-white">Suspended</Badge>;
    if (s === 'terminated') return <Badge className="bg-red-500 text-white">Terminated</Badge>;
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'broadband':
        return <Wifi className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tv':
        return <Tv className="w-4 h-4" />;
      case 'voice':
        return <Phone className="w-4 h-4" />;
      case 'bundle':
        return <Package className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return `Rs ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Info Banner */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <Package className="w-4 h-4" />
        <AlertDescription>
          <strong>Customer Inventory:</strong> View and manage all your active services, 
          subscriptions, and products. Track usage, billing, and service status from one place.
        </AlertDescription>
      </Alert>

      {/* Main Inventory Card */}
      <Card className="bg-white shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
              <Package className="w-6 h-6" />
            </div>
            Customer Inventory Dashboard
          </CardTitle>
          <CardDescription className="text-blue-100">
            Comprehensive view of your services, subscriptions, and product inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Enhanced Controls */}
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products, IDs, services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Service Type</Label>
              <Select value={serviceTypeFilter} onValueChange={(v) => setServiceTypeFilter(v as ServiceTypeFilter)}>
                <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="broadband">Broadband</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tv">Television</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="bundle">Bundles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Visibility</Label>
              <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as VisibilityFilter)}>
                <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="All visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="visible">Customer Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enhanced Summary Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Layers className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Active Services</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status?.toLowerCase() === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Monthly Cost</p>
                  <p className="text-2xl font-bold">
                    Rs {products
                      .filter(p => p.status?.toLowerCase() === 'active')
                      .reduce((sum, p) => sum + (p.monthlyFee || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Bundle Deals</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.isBundle).length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Enhanced Product Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {filteredProducts.length} result(s) found
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Service</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Product ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Monthly Fee</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Activation</TableHead>
                    <TableHead className="font-semibold text-gray-700">Visibility</TableHead>
                    <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Package className="w-12 h-12 text-gray-300" />
                          <p className="text-lg font-medium">
                            {loading ? 'Loading inventory...' : 'No products match your filters'}
                          </p>
                          <p className="text-sm">
                            {loading ? 'Please wait...' : 'Try adjusting your search or filters'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                            {getServiceIcon(product.serviceType)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 md:hidden">{product.id}</div>
                            {product.description && (
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600 font-mono">
                        {product.id}
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                        {formatCurrency(product.monthlyFee)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(product.activationDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.isCustomerVisible ? (
                          <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-cyan-100 text-cyan-800">
                            <Eye className="w-3 h-3" /> Visible
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.isBundle ? (
                          <Badge className="bg-purple-100 text-purple-800">Bundle</Badge>
                        ) : (
                          <Badge variant="outline">Single</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
