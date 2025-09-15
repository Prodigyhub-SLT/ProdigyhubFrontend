import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productCatalogApi, productOrderingApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Zap, Gauge, DollarSign, CalendarClock } from 'lucide-react';

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
        setOrders(userOrders as ProductOrder[]);
        setOfferings((allOfferings || []) as ProductOffering[]);
      } catch (e) {
        setError('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    load();
    // Periodic refresh to reflect upgrades without manual reload
    const interval = setInterval(load, 5000);
    // Refresh on window focus/visibility change
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [user?.email]);

  const activePackage = useMemo(() => {
    if (!orders?.length) return null;

    // Sort orders (most recent first)
    const sorted = [...orders].sort((a, b) => {
      const da = new Date(a.completionDate || a.orderDate || 0).getTime();
      const db = new Date(b.completionDate || b.orderDate || 0).getTime();
      return db - da;
    });

    // Determine the single active package: pick the most recent non-cancelled completed order across all packages
    const recentCompleted = sorted.find((o) => o.state === 'completed');
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

  const priceInfo = useMemo(() => {
    const off: any = activePackage?.offering as any;
    if (!off) return null;
    const pop = Array.isArray(off.productOfferingPrice) ? off.productOfferingPrice[0] : null;
    const priceValue = pop?.price?.value ?? pop?.price?.taxIncludedAmount?.value ?? pop?.price?.dutyFreeAmount?.value;
    const currency = pop?.price?.unit ?? pop?.price?.taxIncludedAmount?.unit ?? pop?.price?.dutyFreeAmount?.unit ?? 'LKR';
    if (priceValue == null) return null;
    return { amount: priceValue, currency };
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
    <div className="max-w-5xl mx-auto">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-white/10 p-2 backdrop-blur">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Inventory</h2>
            </div>
            <p className="text-white/90">Your currently active package</p>
          </div>
          {activePackage && (
            <Badge className="bg-emerald-400 text-emerald-900 font-semibold">Active</Badge>
          )}
        </div>
        {activePackage?.offering?.name && (
          <div className="mt-6">
            <div className="text-sm text-white/80">Current Package</div>
            <div className="text-2xl font-semibold">{activePackage.offering.name}</div>
          </div>
        )}
      </div>

      <Card className="bg-white shadow-xl border-0 rounded-2xl">
        <CardContent className="p-6 md:p-8">
          {!activePackage && (
            <div className="text-gray-700">No active package found.</div>
          )}

          {activePackage && (
            <div className="space-y-8">
              {/* Top row: name + price */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Package</div>
                  <div className="text-xl md:text-2xl font-semibold text-gray-900">
                    {activePackage.offering?.name || activePackage.offeringId}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 text-blue-700 px-3 py-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-lg">
                      {priceInfo ? `${priceInfo.currency} ${priceInfo.amount}` : 'Price N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature chips */}
              {features.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Key Features</div>
                  <div className="flex flex-wrap gap-2">
                    {features.map((f, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-sm"
                      >
                        <Zap className="w-3.5 h-3.5 text-blue-600" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta info grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Order ID</div>
                  <div className="font-medium text-gray-900">{activePackage.order.id}</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Since</div>
                  <div className="font-medium text-gray-900">
                    {new Date(activePackage.order.completionDate || activePackage.order.orderDate || '').toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              {activePackage.offering?.description && (
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <div className="text-sm text-gray-500 mb-1">Description</div>
                  <div className="text-gray-700">{activePackage.offering.description}</div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                  onClick={() => {
                    navigate({ search: '?tab=packages' });
                  }}
                >
                  Upgrade Package
                </Button>
              </div>
            </div>
          )}

          {/* Pending upgrade banner */}
          {pendingUpgrade && (
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-amber-800 font-medium mb-1">Upgrade in progress</div>
              <div className="text-amber-700 text-sm">
                Switching to {pendingUpgrade.offering?.name || pendingUpgrade.offeringId} · Status: {pendingUpgrade.order.state}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


