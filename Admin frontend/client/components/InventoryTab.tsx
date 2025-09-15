import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { productCatalogApi, productOrderingApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Zap, X, ArrowUpRight } from 'lucide-react';

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
        setLoading(false);
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
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-40 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 mb-4" />
          <div className="h-64 rounded-2xl bg-white shadow-sm" />
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-amber-700">Upgrade in progress</div>
                  <div className="text-lg md:text-xl font-semibold text-gray-900">
                    {pendingUpgrade.offering?.name || pendingUpgrade.offeringId}
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 capitalize">{pendingUpgrade.order.state}</Badge>
              </div>

              {/* Vertical Stepper */}
              <div className="space-y-4">
                {['Acknowledged', 'In Progress', 'Completed'].map((label, idx) => {
                  const current = getOrderStepIndex(pendingUpgrade.order.state);
                  const isDone = idx <= current;
                  return (
                    <div key={label} className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow ${isDone ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {idx + 1}
                      </div>
                      <div className={`text-sm font-medium ${isDone ? 'text-amber-700' : 'text-gray-500'}`}>{label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-gray-600">
                Last updated: {new Date(pendingUpgrade.order.orderDate || '').toLocaleString()}
              </div>

              {/* Cancel Request Button */}
              <Button
                variant="outline"
                onClick={() => setIsCancelDialogOpen(true)}
                className="w-full bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white rounded-lg py-3 font-medium shadow-md"
              >
                Cancel Request
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


