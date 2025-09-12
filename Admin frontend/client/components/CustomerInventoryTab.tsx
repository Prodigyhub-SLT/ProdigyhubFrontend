import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { productInventoryApi } from '@/lib/api';
import type { Product } from '@shared/product-order-types';
import {
  Package,
  RefreshCw,
  Search,
  Layers,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'created' | 'suspended' | 'terminated';
type VisibilityFilter = 'all' | 'visible' | 'hidden';

export function CustomerInventoryTab() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productInventoryApi.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load inventory products', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Auto-refresh when a new order is created (wired elsewhere)
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
        p.id?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === 'all' || (p.status as string)?.toLowerCase() === statusFilter;

      const isVisible = Boolean((p as any).isCustomerVisible);
      const matchesVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'visible' && isVisible) ||
        (visibilityFilter === 'hidden' && !isVisible);

      return matchesText && matchesStatus && matchesVisibility;
    });
  }, [products, searchTerm, statusFilter, visibilityFilter]);

  const getStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase();
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
    if (s === 'active') return <div className={`${base} bg-emerald-500 text-white`}>Active</div>;
    if (s === 'created') return <div className={`${base} bg-blue-500 text-white`}>Created</div>;
    if (s === 'suspended') return <div className={`${base} bg-amber-500 text-white`}>Suspended</div>;
    if (s === 'terminated') return <div className={`${base} bg-red-500 text-white`}>Terminated</div>;
    return <div className={`${base} border text-foreground`}>Unknown</div>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Info Banner (mirrors QualificationTab style) */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <AlertDescription className="text-sm">
          📦 <strong>Customer Inventory:</strong> View products provisioned for the customer, filter by status, and quickly search.
        </AlertDescription>
      </Alert>

      {/* Main Inventory Card */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white">
              <Package className="w-6 h-6" />
            </div>
            Customer Inventory
          </CardTitle>
          <CardDescription className="text-gray-600">
            Track and manage the customer's provisioned products
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Visibility</Label>
              <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as VisibilityFilter)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="All visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="visible">Customer Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary badges */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-blue-700" />
                <div className="text-sm text-blue-800">Total Products</div>
              </div>
              <div className="text-xl font-bold text-blue-900">{products.length}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
                <div className="text-sm text-emerald-800">Active</div>
              </div>
              <div className="text-xl font-bold text-emerald-900">{products.filter(p => (p.status as string)?.toLowerCase() === 'active').length}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-700" />
                <div className="text-sm text-red-800">Suspended/Terminated</div>
              </div>
              <div className="text-xl font-bold text-red-900">{products.filter(p => {
                const s = (p.status as string)?.toLowerCase();
                return s === 'suspended' || s === 'terminated';
              }).length}</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-slate-50 border-b">
              <div className="text-sm text-slate-700">{filteredProducts.length} result(s)</div>
              <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Bundle</TableHead>
                  <TableHead>Visibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-slate-500 py-8">
                      {loading ? 'Loading inventory...' : 'No products match your filters.'}
                    </TableCell>
                  </TableRow>
                )}
                {filteredProducts.map((p) => {
                  const visible = Boolean((p as any).isCustomerVisible);
                  const isBundle = Boolean((p as any).isBundle);
                  return (
                    <TableRow key={p.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{p.name || 'Unnamed Product'}</span>
                        </div>
                        <div className="text-xs text-slate-500 md:hidden">{p.id}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-slate-500">{p.id}</TableCell>
                      <TableCell>{getStatusBadge(p.status as string)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {isBundle ? (
                          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-500 text-white">Bundle</div>
                        ) : (
                          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border text-foreground">Single</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {visible ? (
                          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-cyan-500 text-white gap-1"><Eye className="w-3 h-3" /> Visible</div>
                        ) : (
                          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border text-foreground gap-1"><EyeOff className="w-3 h-3" /> Hidden</div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerInventoryTab;

