import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { productCatalogApi, productOrderingApi, eventManagementApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Package, Zap, X, ArrowUpRight, Eye, Trash2, ClipboardCheck, Sliders, MessageSquare, Cpu, AlertTriangle } from 'lucide-react';

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [offerings, setOfferings] = useState<ProductOffering[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<ProductOrder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string>('');

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
  const firstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User'));
  const avatarUrl = ((user as any)?.photoURL || user?.avatar || '').trim();
  const [avatarErrored, setAvatarErrored] = useState(false);
  const showImage = !!avatarUrl && !avatarErrored;

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

  // Handler functions for view and delete actions
  const handleViewOrder = (order: ProductOrder) => {
    console.log('🔍 Selected order for view:', order);
    setSelectedOrderForView(order);
    setIsViewDialogOpen(true);
  };

  const deleteOrder = async (orderId: string) => {
    try {
      console.log('🗑️ Starting deletion for order:', orderId);
      
      // Delete the order
      await productOrderingApi.deleteOrder(orderId);
      console.log('✅ Order deleted successfully');

      // Create event notification for deletion
      try {
        const eventData = {
          id: `${orderId}-deleted-${Date.now()}`,
          eventType: 'ProductOrderDeleted',
          eventTime: new Date().toISOString(),
          timeOccurred: new Date().toISOString(),
          correlationId: orderId,
          domain: 'ProductOrdering',
          title: 'Order Deletion',
          description: `Order ${orderId} has been permanently deleted from user inventory`,
          priority: 'High',
          source: {
            id: orderId,
            type: 'ProductOrder'
          },
          event: {
            orderId: orderId,
            deletedAt: new Date().toISOString(),
            action: 'delete',
            userEmail: user?.email
          }
        };

        await eventManagementApi.createEvent(eventData);
        console.log('📧 Deletion event notification sent');
      } catch (eventError) {
        console.warn('⚠️ Failed to send deletion event notification:', eventError);
      }

      // Update local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setIsDeleteDialogOpen(false);
      setOrderToDelete("");

      toast({
        title: "✅ Order Deleted",
        description: `Order ${orderId} has been permanently deleted`,
      });

    } catch (error) {
      console.error('❌ Delete failed:', error);
      toast({
        title: "❌ Delete Failed",
        description: error instanceof Error ? error.message : 'Failed to delete order',
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

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
                {showImage ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarErrored(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/25 to-white/5 flex items-center justify-center text-white text-2xl font-bold">
                    {firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
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
              {/* Small Activate pill near Inventory */}
              {activePackage && (
                <Button
                  size={"sm" as const}
                  className="ml-2 h-8 px-5 rounded-full bg-white/15 text-white font-semibold border border-white/70 shadow-inner hover:bg-white/20"
                >
                  Active
                </Button>
              )}
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
              {/* Cancel button - red with X icon */}
              <Button
                variant={"outline" as const}
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
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Quick actions</h3>
                    <span className="text-sm text-gray-500">Choose where to go next</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Packages */}
                    <button
                      onClick={() => navigate({ search: '?tab=packages' })}
                      className="group rounded-2xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md p-4 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 text-blue-700 p-2">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700">Packages</div>
                          <div className="text-sm text-gray-500">Browse and select your package</div>
                        </div>
                      </div>
                    </button>
                    {/* Qualification */}
                    <button
                      onClick={() => navigate({ search: '?tab=qualification' })}
                      className="group rounded-2xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md p-4 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-indigo-50 text-indigo-700 p-2">
                          <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-indigo-700">Qualification</div>
                          <div className="text-sm text-gray-500">Check your service availability</div>
                        </div>
                      </div>
                    </button>
                    {/* Customize */}
                    <button
                      onClick={() => navigate({ search: '?tab=customize' })}
                      className="group rounded-2xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md p-4 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-purple-50 text-purple-700 p-2">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-purple-700">Customize</div>
                          <div className="text-sm text-gray-500">Tailor your experience</div>
                        </div>
                      </div>
                    </button>
                    {/* Messages */}
                    <button
                      onClick={() => navigate({ search: '?tab=messages' })}
                      className="group rounded-2xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md p-4 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-50 text-teal-700 p-2">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-teal-700">Messages</div>
                          <div className="text-sm text-gray-500">Get help or chat with us</div>
                        </div>
                      </div>
                    </button>
                    {/* Hot Device - placeholder */}
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-50 text-orange-700 p-2">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Hot Device</div>
                          <div className="text-sm text-gray-500">Coming soon</div>
                        </div>
                      </div>
                    </div>
                    {/* Complaints - placeholder */}
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-rose-50 text-rose-700 p-2">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Complaints</div>
                          <div className="text-sm text-gray-500">Coming soon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                variant={"outline" as const}
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
          <CardContent className="p-8 md:p-10 space-y-8">
            {!activePackage && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Quick actions</h3>
                  <span className="text-sm text-gray-500">Choose where to go next</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Packages */}
                  <button
                    onClick={() => navigate({ search: '?tab=packages' })}
                    className="group rounded-2xl border border-gray-200 bg-white hover:border-blue-500/70 hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-50 text-blue-700 p-3 shadow-inner transition-all duration-300 group-hover:shadow-blue-200 group-hover:scale-110 group-hover:-rotate-3">
                        <Package className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">Packages</div>
                        <div className="text-sm text-gray-500">Browse and select your package</div>
                      </div>
                    </div>
                  </button>
                  {/* Qualification */}
                  <button
                    onClick={() => navigate({ search: '?tab=qualification' })}
                    className="group rounded-2xl border border-gray-200 bg-white hover:border-indigo-500/70 hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-50 text-indigo-700 p-3 shadow-inner transition-all duration-300 group-hover:shadow-indigo-200 group-hover:scale-110 group-hover:rotate-1">
                        <ClipboardCheck className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">Qualification</div>
                        <div className="text-sm text-gray-500">Check your service availability</div>
                      </div>
                    </div>
                  </button>
                  {/* Customize */}
                  <button
                    onClick={() => navigate({ search: '?tab=customize' })}
                    className="group rounded-2xl border border-gray-200 bg-white hover:border-purple-500/70 hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-purple-50 text-purple-700 p-3 shadow-inner transition-all duration-300 group-hover:shadow-purple-200 group-hover:scale-110 group-hover:-rotate-2">
                        <Sliders className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-purple-700">Customize</div>
                        <div className="text-sm text-gray-500">Tailor your experience</div>
                      </div>
                    </div>
                  </button>
                  {/* Messages */}
                  <button
                    onClick={() => navigate({ search: '?tab=messages' })}
                    className="group rounded-2xl border border-gray-200 bg-white hover:border-teal-500/70 hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-teal-50 text-teal-700 p-3 shadow-inner transition-all duration-300 group-hover:shadow-teal-200 group-hover:scale-110 group-hover:rotate-2">
                        <MessageSquare className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-teal-700">Messages</div>
                        <div className="text-sm text-gray-500">Get help or chat with us</div>
                      </div>
                    </div>
                  </button>
                  {/* Hot Device - placeholder */}
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-orange-50 text-orange-700 p-3 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <Cpu className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">Hot Device</div>
                        <div className="text-sm text-gray-500">Coming soon</div>
                      </div>
                    </div>
                  </div>
                  {/* Complaints - placeholder */}
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-rose-50 text-rose-700 p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2">
                        <AlertTriangle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">Complaints</div>
                        <div className="text-sm text-gray-500">Coming soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                              variant={"ghost" as const}
                              size={"sm" as const}
                              onClick={() => handleViewOrder(order)}
                              title="View Order Details"
                              className="h-9 w-9 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group/btn"
                            >
                              <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            </Button>
                            <Button
                              variant={"ghost" as const}
                              size={"sm" as const}
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete Order"
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
            <Button variant={"outline" as const} onClick={() => setIsCancelDialogOpen(false)} disabled={!!cancellingOrderId}>
              Close
            </Button>
            <Button
              variant={"destructive" as const}
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b border-slate-100 pb-6">
            <DialogTitle className="flex items-center space-x-3 text-2xl">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Order Details
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Complete information about this product order
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderForView ? (
            <div className="space-y-8 py-6">
              {/* Order Overview Section */}
              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    Order Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                      <h4 className="text-blue-700 font-bold text-sm">Order ID</h4>
                      <p className="text-sm font-mono bg-white p-3 rounded-lg border border-blue-200/50 mt-2 shadow-sm">
                        {selectedOrderForView.id || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
                      <h4 className="text-emerald-700 font-bold text-sm">Status</h4>
                      <div className="mt-3">
                        <Badge className={`${selectedOrderForView.state === 'completed' ? 'bg-green-100 text-green-800' : selectedOrderForView.state === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} border px-4 py-2`}>
                          <span className="capitalize font-semibold">{selectedOrderForView.state || 'unknown'}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                      <h4 className="text-purple-700 font-bold text-sm">Serial Number</h4>
                      <p className="text-sm font-mono bg-white p-3 rounded-lg border border-purple-200/50 mt-2 shadow-sm">
                        AUTO-{selectedOrderForView.id}-1
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
                      <h4 className="text-amber-700 font-bold text-sm">Order Date</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">
                        {selectedOrderForView.orderDate ? new Date(selectedOrderForView.orderDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-200/50">
                      <h4 className="text-cyan-700 font-bold text-sm">Completion Date</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">
                        {selectedOrderForView.completionDate ? new Date(selectedOrderForView.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not completed yet'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Details Section */}
              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const offering = offerings.find(o => o.id === selectedOrderForView.productOrderItem?.[0]?.productOffering?.id);
                    const packageName = offering?.name || selectedOrderForView.productOrderItem?.[0]?.productOffering?.name || 'Unknown Package';
                    const packageDescription = offering?.description || 'No description available';
                    
                    return (
                      <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50/50 border border-orange-200/50">
                          <h4 className="text-orange-700 font-bold text-lg mb-3">Package Name</h4>
                          <p className="text-xl font-bold text-slate-900 mb-2">{packageName}</p>
                          <p className="text-sm text-slate-600">{packageDescription}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50 border border-green-200/50">
                            <h4 className="text-green-700 font-bold text-sm">Package ID</h4>
                            <p className="text-sm font-mono bg-white p-3 rounded-lg border border-green-200/50 mt-2 shadow-sm">
                              {offering?.id || selectedOrderForView.productOrderItem?.[0]?.productOffering?.id || 'N/A'}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100/50 border border-indigo-200/50">
                            <h4 className="text-indigo-700 font-bold text-sm">Package Type</h4>
                            <p className="text-sm font-bold text-slate-900 mt-2">
                              {offering?.category?.name || 'Standard Package'}
                            </p>
                          </div>
                        </div>

                        {/* Package Specifications */}
                        {offering?.productSpecification && (
                          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100/50 border border-slate-200/50">
                            <h4 className="text-slate-700 font-bold text-sm mb-3">Package Specifications</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {(() => {
                                const spec = offering.productSpecification;
                                const characteristics = spec?.characteristic || spec?.productSpecCharacteristic || [];
                                const specs = Array.isArray(characteristics) 
                                  ? characteristics.slice(0, 6).map((c: any, index: number) => (
                                      <div key={index} className="bg-white p-3 rounded-lg border border-slate-200/50 shadow-sm">
                                        <span className="text-xs text-slate-600 font-medium">{c?.name || c?.id || `Feature ${index + 1}`}</span>
                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                          {c?.value || c?.defaultValue || 'Included'}
                                        </p>
                                      </div>
                                    ))
                                  : [];
                                return specs.length > 0 ? specs : (
                                  <div className="col-span-full bg-white p-3 rounded-lg border border-slate-200/50 shadow-sm text-center text-slate-500">
                                    No specifications available
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Customer Information Section */}
              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-green-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                      <h4 className="text-blue-700 font-bold text-sm">Customer Email</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">
                        {selectedOrderForView.customerDetails?.email || user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                      <h4 className="text-purple-700 font-bold text-sm">Order Category</h4>
                      <p className="text-sm font-bold text-slate-900 mt-2">
                        {offerings.find(o => o.id === selectedOrderForView.productOrderItem?.[0]?.productOffering?.id)?.category?.name || 'SLT Package'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Order Information */}
              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Order Processing Time:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {selectedOrderForView.orderDate && selectedOrderForView.completionDate 
                          ? `${Math.ceil((new Date(selectedOrderForView.completionDate).getTime() - new Date(selectedOrderForView.orderDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                          : 'In progress'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Order Priority:</span>
                      <Badge className="bg-blue-100 text-blue-800">Standard</Badge>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Service Provider:</span>
                      <span className="text-sm font-bold text-gray-900">Sri Lanka Telecom</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-gray-600">Order Source:</span>
                      <span className="text-sm font-bold text-gray-900">ProdigyHub Portal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Loading order details...</p>
            </div>
          )}
          
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
            <Button 
              variant={"outline" as const} 
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedOrderForView(null);
              }}
              className="rounded-xl border-slate-200 hover:bg-slate-50 px-8 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-xl bg-red-100">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <span>Delete Order</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Are you sure you want to permanently delete order {orderToDelete?.slice(0, 7)}...? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Warning</span>
              </div>
              <p className="text-red-700 mt-2 text-sm">
                This will permanently delete the order from your inventory. This action cannot be reversed.
              </p>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button 
              type="button" 
              variant={"outline" as const} 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setOrderToDelete("");
              }}
              className="rounded-xl border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => orderToDelete && deleteOrder(orderToDelete)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


