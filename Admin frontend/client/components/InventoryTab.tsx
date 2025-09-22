import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { productCatalogApi, productOrderingApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Zap, X, ArrowUpRight, Eye, Trash2 } from 'lucide-react';

type OrderState = 'acknowledged' | 'inProgress' | 'completed' | 'failed' | 'cancelled';

interface ProductOrderItem {
  productOffering?: { id?: string; name?: string };
}

interface ProductOrder {
  id: string;
  state: OrderState;
  orderDate?: string;
  completionDate?: string;
  productOrderItem?: ProductOrderItem[];
  customerDetails?: { email?: string };
}

interface ProductOffering {
  id: string;
  name: string;
  description?: string;
  category?: any;
  productSpecification?: any;
}

export default function InventoryTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [offerings, setOfferings] = useState<ProductOffering[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      setLoading(true);
      const MIN_LOADING_MS = 1200; // ensure pleasant skeleton for ~1.2s
      const startMs = Date.now();
      setError(null);
      try {
        const [allOrders, allOfferings] = await Promise.all([
          productOrderingApi.getOrders().catch(() => []),
          productCatalogApi.getOfferings().catch(() => []),
        ]);

        const userOrders = (allOrders || []).filter((o: any) => o?.customerDetails?.email === user.email);
        console.log('🔍 Inventory - User orders loaded:', userOrders.map(o => ({ id: o.id, state: o.state, name: o.productOrderItem?.[0]?.productOffering?.name })));
        setOrders(userOrders as ProductOrder[]);
        let offeringList = (allOfferings || []) as ProductOffering[];

        // Ensure the active offering exists by fetching it by ID if missing
        const sorted = [...(userOrders as ProductOrder[])].sort((a, b) => {
          const da = new Date(a.completionDate || a.orderDate || 0).getTime();
          const db = new Date(b.completionDate || b.orderDate || 0).getTime();
          return db - da;
        });
        const recentCompleted = sorted.find((o) => o.state === 'completed');
        const activeOfferingId = recentCompleted?.productOrderItem?.[0]?.productOffering?.id;
        if (activeOfferingId && !offeringList.find(o => o.id === activeOfferingId)) {
          try {
            const exact = await productCatalogApi.getOfferingById(activeOfferingId);
            if (exact) offeringList = [exact, ...offeringList];
          } catch (_) {}
        }

        setOfferings(offeringList);
      } catch (e) {
        setError('Failed to load inventory');
      } finally {
        const elapsed = Date.now() - startMs;
        const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
        setTimeout(() => setLoading(false), remaining);
      }
    };
    load();
    // No auto-refresh (as requested)
    return () => {};
  }, [user?.email]);

  const activePackage = useMemo(() => {
    if (!orders?.length) return null;

    // Sort orders (most recent first)
    const sorted = [...orders].sort((a, b) => {
      const da = new Date(a.completionDate || a.orderDate || 0).getTime();
      const db = new Date(b.completionDate || b.orderDate || 0).getTime();
      return db - da;
    });

    // Debug: Log all order states
    console.log('🔍 Inventory - All order states:', sorted.map(o => ({ id: o.id, state: o.state, name: o.productOrderItem?.[0]?.productOffering?.name })));

    // Determine the single active package: pick the most recent completed order (exclude cancelled, failed, etc.)
    const recentCompleted = sorted.find((o) => o.state === 'completed');
    
    console.log('🔍 Inventory - Recent completed order:', recentCompleted ? { id: recentCompleted.id, state: recentCompleted.state } : 'None found');
    
    if (!recentCompleted) return null;

    const poId = recentCompleted.productOrderItem?.[0]?.productOffering?.id;
    if (!poId) return null;

    const offeringFromOrder = recentCompleted.productOrderItem?.[0]?.productOffering as ProductOffering | undefined;
    const offering = offerings.find((of) => of.id === poId) || offeringFromOrder;
    return {
      order: recentCompleted,
      offering,
      offeringId: poId,
    };
  }, [orders, offerings]);

  const pendingUpgrade = useMemo(() => {
    if (!orders?.length) return null;
    const sorted = [...orders].sort((a, b) => {
      const da = new Date(a.completionDate || a.orderDate || 0).getTime();
      const db = new Date(b.completionDate || b.orderDate || 0).getTime();
      return db - da;
    });
    const latest = sorted[0];
    if (!latest) return null;
    if (latest.state === 'completed' || latest.state === 'cancelled') return null;
    const poId = latest.productOrderItem?.[0]?.productOffering?.id;
    const offeringFromOrder = latest.productOrderItem?.[0]?.productOffering as ProductOffering | undefined;
    const offering = (poId && offerings.find((of) => of.id === poId)) || offeringFromOrder;
    return { order: latest, offering, offeringId: poId };
  }, [orders, offerings]);

  const getOrderStepIndex = (state: OrderState) => {
    switch (state) {
      case 'acknowledged':
        return 0;
      case 'inProgress':
        return 1;
      case 'completed':
        return 2;
      case 'failed':
      case 'cancelled':
      default:
        return -1;
    }
  };

  // Derived user display values
  const firstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : '');
  const avatarUrl = (user as any)?.photoURL || user?.avatar;

  const priceInfo = useMemo(() => {
    const off: any = activePackage?.offering as any;
    if (!off) return null;
    if (off.productOfferingPrice && off.productOfferingPrice.length > 0) {
      const price = off.productOfferingPrice[0];
      const amount = price.price?.taxIncludedAmount?.value ?? price.price?.value ?? 0;
      const currency = price.price?.taxIncludedAmount?.unit ?? price.price?.unit ?? 'LKR';
      return { amount, currency };
    }
    return null;
  }, [activePackage]);

  const features = useMemo(() => {
    const off: any = activePackage?.offering as any;
    const spec = off?.productSpecification;
    const characteristics = spec?.characteristic || spec?.productSpecCharacteristic || [];
    const parsed = Array.isArray(characteristics)
      ? characteristics
          .map((c: any) => c?.name || c?.id)
          .filter((v: any) => typeof v === 'string')
          .slice(0, 6)
      : [];
    return parsed as string[];
  }, [activePackage]);

  const specDetails = useMemo(() => {
    const off: any = activePackage?.offering as any;
    if (!off) return { connectionType: '', packageType: '', dataBundle: '' };
    const categoryDescription = (off as any).categoryDescription || '';
    const connectionType = categoryDescription.includes('Fiber') || categoryDescription.includes('Fibre')
      ? 'Fiber'
      : categoryDescription.includes('4G')
      ? '4G'
      : categoryDescription.includes('ADSL')
      ? 'ADSL'
      : '';
    const packageType = categoryDescription.includes('Any Time')
      ? 'Any Time'
      : categoryDescription.includes('Time Based')
      ? 'Time Based'
      : categoryDescription.includes('Unlimited')
      ? 'Unlimited'
      : '';

    let dataBundle = '';
    const attrs = (off as any).customAttributes || [];
    if (Array.isArray(attrs)) {
      const dataAttr = attrs.find((a: any) => (a?.name || '').toLowerCase().includes('data allowance') || (a?.name || '').toLowerCase().includes('data bundle'));
      if (dataAttr?.value) dataBundle = dataAttr.value;
    }

    return { connectionType, packageType, dataBundle } as { connectionType?: string; packageType?: string; dataBundle?: string };
  }, [activePackage]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Inventory</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero header - single card like second image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-10 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Greeting with user avatar */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">{firstName?.[0] || 'U'}</div>
                )}
              </div>
              <div className="leading-tight">
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight">Hi {firstName},</div>
                <div className="text-base md:text-lg opacity-90 font-semibold">Welcome to Prodigyhub</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-white/10 p-2 backdrop-blur">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Inventory</h2>
            </div>
            <p className="text-white/90 text-sm md:text-base mb-4">Your currently active package</p>
            {activePackage?.offering?.name && (
              <div>
                <div className="text-sm text-white/80 mb-1">Current Package</div>
                <div className="text-3xl md:text-4xl font-semibold leading-tight">{activePackage.offering.name}</div>
              </div>
            )}
          </div>
          {activePackage && (
            <div className="flex flex-col gap-3 ml-8">
              {/* Activate button - green */}
              <Button
                className="bg-emerald-400 text-emerald-900 font-bold rounded-lg px-6 py-3 w-32 h-12 text-sm shadow-lg hover:bg-emerald-500"
              >
                Activate
              </Button>
              {/* Cancel button - red with X icon */}
              <Button
                variant="outline"
                onClick={() => setIsCancelDialogOpen(true)}
                className="bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white rounded-lg px-4 py-2 w-32 h-10 text-sm font-medium shadow-md flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              {/* Upgrade button - blue with arrow icon */}
              <Button
                onClick={() => navigate({ search: '?tab=packages' })}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 w-32 h-10 text-sm font-medium shadow-md flex items-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                Upgrade
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout when upgrade in progress, single column otherwise */}
      {pendingUpgrade ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left half - Package details */}
          <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              {!activePackage && (
                <div className="text-gray-700">No active package found.</div>
              )}

              {activePackage && (
                <div className="space-y-6">
                  {/* Top row: name + price */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Package</div>
                      <div className="text-2xl md:text-3xl font-semibold text-gray-900">
                        {activePackage.offering?.name || activePackage.offeringId}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-50 text-blue-700 px-3 py-2 flex items-center shadow-sm">
                        <span className="font-semibold text-lg tracking-wide">
                          {priceInfo ? `${priceInfo.currency} ${priceInfo.amount.toLocaleString?.() || priceInfo.amount}` : 'Price N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature chips */}
                  {features.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Key Features</div>
                      <div className="flex flex-wrap gap-2">
                        {features.map((f, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-800 px-3 py-1.5 text-sm border border-gray-200"
                          >
                            <Zap className="w-3.5 h-3.5 text-blue-600" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Offer details grid - vertical layout */}
                  <div className="space-y-3">
                    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">Connection Type</div>
                      <div className="font-medium text-gray-900">{specDetails.connectionType || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">Package Type</div>
                      <div className="font-medium text-gray-900">{specDetails.packageType || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">Data Bundle</div>
                      <div className="font-medium text-gray-900">{specDetails.dataBundle || '—'}</div>
                    </div>
                  </div>

                  {/* Description */}
                  {activePackage.offering?.description && (
                    <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                      <div className="text-sm text-gray-500 mb-2">Description</div>
                      <div className="text-gray-800 leading-relaxed">{activePackage.offering.description}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right half - Upgrade in progress */}
          <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-amber-700 font-medium">Upgrade in progress</div>
                  <div className="text-xl font-bold text-gray-900">
                    {pendingUpgrade.offering?.name || pendingUpgrade.offeringId}
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 capitalize font-medium">{pendingUpgrade.order.state}</Badge>
              </div>

              {/* Vertical Stepper with connecting lines - larger and more prominent */
              }
              <div className="relative mb-6">
                {/* Connecting line */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-gray-200"></div>
                
                <div className="space-y-8">
                  {['Acknowledged', 'In Progress', 'Completed'].map((label, idx) => {
                    const messages = [
                      'Your order has been acknowledged and will be prepared soon',
                      'We\u2019ve started working on your order\u2014hang tight',
                      'Great news! Your order is finished and ready for you.'
                    ];
                    const current = getOrderStepIndex(pendingUpgrade.order.state);
                    const isActive = idx === current;
                    const isCompleted = idx < current;
                    const isPending = idx > current;
                    
                    return (
                      <div key={label} className="relative flex items-center space-x-6">
                        {/* Step circle - larger */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-xl ${
                          isActive ? 'bg-orange-500 text-white ring-6 ring-orange-200' :
                          isCompleted ? 'bg-green-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                        
                        {/* Step label + dynamic message */}
                        <div className="flex flex-col">
                          <div className={`text-lg font-bold ${
                            isActive ? 'text-orange-600' :
                            isCompleted ? 'text-green-600' :
                            'text-gray-500'
                          }`}>
                            {label}
                          </div>
                          {isActive && (
                            <div className="text-sm text-gray-600 mt-1">
                              {messages[idx]}
                            </div>
                          )}
                        </div>
                        
                        {/* Active indicator dot - larger */}
                        {isActive && (
                          <div className="absolute -right-3 top-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional info section to fill space */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Order Details</div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>Order ID: {pendingUpgrade.order.id}</div>
                  <div>Requested: {new Date(pendingUpgrade.order.orderDate || '').toLocaleDateString()}</div>
                  <div>Last updated: {new Date(pendingUpgrade.order.orderDate || '').toLocaleString()}</div>
                </div>
              </div>

              {/* Cancel Request Button */}
              <Button
                variant="outline"
                onClick={async () => {
                  if (!pendingUpgrade?.order?.id) return;
                  if (!confirm('Are you sure you want to cancel this upgrade request?')) return;
                  try {
                    setCancellingOrderId(pendingUpgrade.order.id);
                    // Step 1: set order state to cancelled
                    await productOrderingApi.updateOrder(pendingUpgrade.order.id, { state: 'cancelled' } as any);
                    // Step 2: create cancellation request
                    await productOrderingApi.cancelOrder({
                      productOrder: {
                        id: pendingUpgrade.order.id,
                        href: `/productOrderingManagement/v4/productOrder/${pendingUpgrade.order.id}`,
                        '@type': 'ProductOrderRef'
                      },
                      cancellationReason: 'User requested cancellation',
                      requestedCancellationDate: new Date().toISOString(),
                      '@type': 'CancelProductOrder'
                    } as any);
                    // Refresh the data to reflect the cancellation
                    const updatedOrders = orders.map(order => 
                      order.id === pendingUpgrade.order.id 
                        ? { ...order, state: 'cancelled' as OrderState }
                        : order
                    );
                    setOrders(updatedOrders);
                  } catch (err) {
                    console.error('Error cancelling upgrade order', err);
                    alert('Failed to cancel upgrade request.');
                  } finally {
                    setCancellingOrderId(null);
                  }
                }}
                disabled={!!cancellingOrderId}
                className="w-full bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white rounded-lg py-3 font-medium shadow-md"
              >
                {cancellingOrderId ? 'Cancelling...' : 'Cancel Request'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Single column layout when no upgrade in progress */
        <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            {!activePackage && (
              <div className="text-gray-700">No active package found.</div>
            )}

            {activePackage && (
              <div className="space-y-8">
                {/* Top row: name + price */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Package</div>
                    <div className="text-2xl md:text-3xl font-semibold text-gray-900">
                      {activePackage.offering?.name || activePackage.offeringId}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 text-blue-700 px-3 py-2 flex items-center shadow-sm">
                      <span className="font-semibold text-lg tracking-wide">
                        {priceInfo ? `${priceInfo.currency} ${priceInfo.amount.toLocaleString?.() || priceInfo.amount}` : 'Price N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature chips */}
                {features.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Key Features</div>
                    <div className="flex flex-wrap gap-2">
                      {features.map((f, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-800 px-3 py-1.5 text-sm border border-gray-200"
                        >
                          <Zap className="w-3.5 h-3.5 text-blue-600" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offer details grid (not order details) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Connection Type</div>
                    <div className="font-medium text-gray-900">{specDetails.connectionType || '—'}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Package Type</div>
                    <div className="font-medium text-gray-900">{specDetails.packageType || '—'}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Data Bundle</div>
                    <div className="font-medium text-gray-900">{specDetails.dataBundle || '—'}</div>
                  </div>
                </div>

                {/* Description */}
                {activePackage.offering?.description && (
                  <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                    <div className="text-sm text-gray-500 mb-2">Description</div>
                    <div className="text-gray-800 leading-relaxed">{activePackage.offering.description}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base rounded-xl shadow-sm"
                    onClick={() => {
                      navigate({ search: '?tab=packages' });
                    }}
                  >
                    Upgrade Package
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order History Table */}
      {orders.length > 0 && (
        <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Product Details</h3>
                  <p className="text-gray-600">Your order history and package details</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">{orders.length} orders</span>
                </div>
              </div>
            </div>
            
            {/* Modern Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Order Info
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order, index) => {
                    const offering = offerings.find(o => o.id === order.productOrderItem?.[0]?.productOffering?.id);
                    const packageName = offering?.name || order.productOrderItem?.[0]?.productOffering?.name || 'Unknown Package';
                    const orderDate = new Date(order.orderDate || order.completionDate || '').toLocaleDateString();
                    
                    return (
                      <tr 
                        key={order.id} 
                        className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200 hover:shadow-sm"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {packageName}
                              </div>
                              <div className="text-sm text-gray-500 font-mono">ID: {order.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center">
                            {/* Status Badge (fixed size, no leading dot) */}
                            <div className={`relative overflow-hidden rounded-xl px-4 py-2 shadow-lg min-w-[120px] flex justify-center ${
                              order.state === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                              order.state === 'inProgress' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                              order.state === 'acknowledged' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                              order.state === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}>
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                              <div className="relative flex items-center gap-2">
                                <span className="text-white font-bold text-sm capitalize">
                                  {order.state === 'inProgress' ? 'In Progress' : order.state}
                                </span>
                                {order.state === 'inProgress' && (
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div>
                            <a 
                              href="#" 
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-all duration-200"
                              onClick={(e) => {
                                e.preventDefault();
                                console.log('View order:', order.id);
                              }}
                            >
                              {order.id}...
                            </a>
                            <div className="text-xs text-gray-500 mt-1">{orderDate}</div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="bg-gray-50 rounded-lg px-3 py-2 inline-block">
                            <div className="text-sm text-gray-700 font-mono">AUTO-{order.id}-{index + 1}</div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                console.log('View details:', order.id);
                              }}
                              className="h-9 w-9 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group/btn"
                            >
                              <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this order record?')) {
                                  console.log('Delete order:', order.id);
                                }
                              }}
                              className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group/btn"
                            >
                              <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Modern Footer */}
            <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>Showing {orders.length} of {orders.length} orders</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Active Package</DialogTitle>
            <DialogDescription>
              Provide a reason to cancel your currently active package: {activePackage?.offering?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Textarea
              placeholder="Enter cancellation reason..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={!!cancellingOrderId}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!activePackage?.order?.id) return;
                if (!cancellationReason.trim()) {
                  alert('Please provide a reason for cancellation.');
                  return;
                }
                try {
                  setCancellingOrderId(activePackage.order.id);
                  // Step 1: set order state to cancelled
                  await productOrderingApi.updateOrder(activePackage.order.id, { state: 'cancelled' } as any);
                  // Step 2: create cancellation request
                  await productOrderingApi.cancelOrder({
                    productOrder: {
                      id: activePackage.order.id,
                      href: `/productOrderingManagement/v4/productOrder/${activePackage.order.id}`,
                      '@type': 'ProductOrderRef'
                    },
                    cancellationReason,
                    requestedCancellationDate: new Date().toISOString(),
                    '@type': 'CancelProductOrder'
                  } as any);
                  setIsCancelDialogOpen(false);
                  setCancellationReason('');
                  // Refresh the data to reflect the cancellation
                  const updatedOrders = orders.map(order => 
                    order.id === activePackage.order.id 
                      ? { ...order, state: 'cancelled' as OrderState }
                      : order
                  );
                  setOrders(updatedOrders);
                } catch (err) {
                  console.error('Error cancelling order', err);
                  alert('Failed to cancel package.');
                } finally {
                  setCancellingOrderId(null);
                }
              }}
              disabled={!!cancellingOrderId}
            >
              {cancellingOrderId ? 'Cancelling...' : 'Submit Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


