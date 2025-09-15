import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Calendar,
  DollarSign,
  Filter,
  Loader2
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

export default function CustomerInventoryTab() {
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
    if (s === 'active') return <Badge className="bg-green-600 hover:bg-green-700 text-white">Active</Badge>;
    if (s === 'created') return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Created</Badge>;
    if (s === 'suspended') return <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">Suspended</Badge>;
    if (s === 'terminated') return <Badge className="bg-red-600 hover:bg-red-700 text-white">Terminated</Badge>;
    return <Badge variant="outline" className="text-gray-600">Unknown</Badge>;
  };

  const getServiceIcon = (serviceType: string) => {
    const iconClass = "w-5 h-5";
    switch (serviceType.toLowerCase()) {
      case 'broadband':
        return <Wifi className={iconClass} />;
      case 'mobile':
        return <Smartphone className={iconClass} />;
      case 'tv':
        return <Tv className={iconClass} />;
      case 'voice':
        return <Phone className={iconClass} />;
      case 'bundle':
        return <Package className={iconClass} />;
      default:
        return <Globe className={iconClass} />;
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

  const activeProducts = products.filter(p => p.status?.toLowerCase() === 'active');
  const totalMonthlyCost = activeProducts.reduce((sum, p) => sum + (p.monthlyFee || 0), 0);
  const bundleCount = products.filter(p => p.isBundle).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Info Banner */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <Package className="w-4 h-4" />
        <AlertDescription className="text-sm">
          <strong>Customer Inventory:</strong> View and manage all your active services, 
          subscriptions, and products. Track usage, billing, and service status from one place.
        </AlertDescription>
      </Alert>

      {/* Main Inventory Card */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Customer Inventory Dashboard
          </CardTitle>
          <CardDescription className="text-gray-600">
            Comprehensive view of your services, subscriptions, and product inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter & Search Options
            </h3>
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products, IDs, services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Status Filter</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500">
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
                <Label className="text-gray-700">Service Type</Label>
                <Select value={serviceTypeFilter} onValueChange={(v) => setServiceTypeFilter(v as ServiceTypeFilter)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500">
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
                <Label className="text-gray-700">Visibility</Label>
                <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as VisibilityFilter)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500">
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
          </div>

          {/* Enhanced Summary Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Layers className="w-5 h-5 mr-2" />
              Inventory Overview
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {/* Total Products Card */}
              <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Total Products</h4>
                      <p className="text-sm text-gray-600">All inventory items</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                    {products.length} items
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-blue-700">{products.length}</div>
              </div>

              {/* Active Services Card */}
              <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Active Services</h4>
                      <p className="text-sm text-gray-600">Currently running</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                    Live
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-700">{activeProducts.length}</div>
              </div>

              {/* Monthly Cost Card */}
              <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Monthly Cost</h4>
                      <p className="text-sm text-gray-600">Active services only</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs bg-yellow-600 hover:bg-yellow-700">
                    LKR
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  Rs {totalMonthlyCost.toLocaleString()}
                </div>
              </div>

              {/* Bundle Deals Card */}
              <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Bundle Deals</h4>
                      <p className="text-sm text-gray-600">Combined services</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs bg-purple-600 hover:bg-purple-700">
                    Bundles
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-purple-700">{bundleCount}</div>
              </div>
            </div>
          </div>

          {/* Enhanced Product List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Product Details
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} result(s) found
                </span>
                <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex flex-col items-center gap-4 text-gray-500">
                    <Package className="w-12 h-12 text-gray-300" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {loading ? 'Loading inventory...' : 'No products match your filters'}
                      </p>
                      <p className="text-sm">
                        {loading ? 'Please wait...' : 'Try adjusting your search or filters'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {filteredProducts.map((product) => (
                <Card key={product.id} className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid lg:grid-cols-12 gap-4 items-center">
                      {/* Service Icon and Info */}
                      <div className="lg:col-span-4 flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex-shrink-0">
                          {getServiceIcon(product.serviceType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{product.description}</p>
                          <p className="text-xs text-gray-500 font-mono">{product.id}</p>
                        </div>
                      </div>

                      {/* Status and Type */}
                      <div className="lg:col-span-2 space-y-2">
                        {getStatusBadge(product.status)}
                        {product.isBundle ? (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 block w-fit">
                            Bundle
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 border-gray-300 block w-fit">
                            Single
                          </Badge>
                        )}
                      </div>

                      {/* Monthly Fee */}
                      <div className="lg:col-span-2 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(product.monthlyFee)}
                        </div>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>

                      {/* Activation Date */}
                      <div className="lg:col-span-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(product.activationDate)}
                        </div>
                        <p className="text-xs text-gray-500">activated</p>
                      </div>

                      {/* Visibility */}
                      <div className="lg:col-span-2 text-center">
                        {product.isCustomerVisible ? (
                          <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-cyan-100 text-cyan-800">
                            <Eye className="w-3 h-3" /> Visible
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Details for larger screens */}
                    {(product.features || product.bandwidth || product.dataAllowance) && (
                      <div className="mt-4 pt-4 border-t border-gray-100 hidden md:block">
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                          {product.bandwidth && (
                            <div>
                              <strong>Bandwidth:</strong> {product.bandwidth}
                            </div>
                          )}
                          {product.dataAllowance && (
                            <div>
                              <strong>Data:</strong> {product.dataAllowance}
                            </div>
                          )}
                          {product.location && (
                            <div>
                              <strong>Location:</strong> {product.location}
                            </div>
                          )}
                        </div>
                        {product.features && product.features.length > 0 && (
                          <div className="mt-3">
                            <strong className="text-sm text-gray-700">Features:</strong>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {product.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              For any questions about your services, call 1212 SLT hotline
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
