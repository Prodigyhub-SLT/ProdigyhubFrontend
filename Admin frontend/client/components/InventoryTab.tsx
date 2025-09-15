import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productCatalogApi, productOrderingApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

    const offering = offerings.find((of) => of.id === poId);
    return {
      order: recentCompleted,
      offering,
      offeringId: poId,
    };
  }, [orders, offerings]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Inventory</CardTitle>
            <CardDescription className="text-gray-600">Loading your active package...</CardDescription>
          </CardHeader>
        </Card>
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
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Inventory</CardTitle>
          <CardDescription className="text-gray-600">Your currently active package</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activePackage && (
            <div className="text-gray-700">No active package found.</div>
          )}

          {activePackage && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Status</div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Package</div>
                <div className="font-semibold text-gray-900">
                  {activePackage.offering?.name || activePackage.offeringId}
                </div>
              </div>
              {activePackage.offering?.description && (
                <div className="pt-2 text-sm text-gray-600">
                  {activePackage.offering.description}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Order ID</div>
                <div className="text-gray-900">{activePackage.order.id}</div>
              </div>
              {(activePackage.order.completionDate || activePackage.order.orderDate) && (
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">Since</div>
                  <div className="text-gray-900">
                    {new Date(activePackage.order.completionDate || activePackage.order.orderDate || '').toLocaleString()}
                  </div>
                </div>
              )}
              <div className="pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upgrade Package</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


