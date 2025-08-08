import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, CheckCircle, Plus, RefreshCw, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productOrderingApi } from "@/lib/api";
import type { ProductOrder, CancelProductOrder } from "@shared/product-order-types";
import OrderOverview from "./OderOverview";
import ProductOrders from "./ProductOders";

interface OrderStats {
  totalOrders: number;
  acknowledgedOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCancellations: number;
  avgOrderValue: number;
}

export default function ProductOrderingDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    acknowledgedOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCancellations: 0,
    avgOrderValue: 0
  });
  
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [cancelOrders, setCancelOrders] = useState<CancelProductOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use the API client instead of direct fetch
      const [ordersData, cancelOrdersData] = await Promise.all([
        productOrderingApi.getOrders().catch((error) => {
          console.warn('Product Ordering API not available:', error.message);
          return [];
        }),
        // Note: Cancel orders endpoint might not be available, handle gracefully
        fetch('/api/productOrderingManagement/v4/cancelProductOrder')
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      ]);

      // Handle both array and object responses
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      const cancelOrdersArray = Array.isArray(cancelOrdersData) ? cancelOrdersData : [];

      // Filter orders: active orders (non-cancelled) go to orders tab
      const activeOrders = ordersArray.filter((order: ProductOrder) => order.state !== 'cancelled');
      // Cancelled orders go to cancellations tab
      const cancelledOrders = ordersArray.filter((order: ProductOrder) => order.state === 'cancelled');

      setOrders(activeOrders);
      setCancelOrders([...cancelOrdersArray, ...cancelledOrders]);

      // Calculate stats
      const acknowledged = activeOrders.filter((o: ProductOrder) => o.state === 'acknowledged').length;
      const inProgress = activeOrders.filter((o: ProductOrder) => o.state === 'inProgress').length;
      const completed = activeOrders.filter((o: ProductOrder) => o.state === 'completed').length;
      const cancelled = cancelledOrders.length;
      
      // Calculate average order value (if available) - only for active orders
      const totalValue = activeOrders.reduce((sum: number, order: ProductOrder) => {
        const orderValue = order.orderTotalPrice?.[0]?.price?.taxIncludedAmount?.value || 0;
        return sum + orderValue;
      }, 0);

      setStats({
        totalOrders: activeOrders.length,
        acknowledgedOrders: acknowledged,
        inProgressOrders: inProgress,
        completedOrders: completed,
        cancelledOrders: cancelled,
        totalCancellations: [...cancelOrdersArray, ...cancelledOrders].length,
        avgOrderValue: activeOrders.length > 0 ? totalValue / activeOrders.length : 0
      });

    } catch (error) {
      console.error('Error fetching order data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Navigate to CreateOrder page instead of opening dialog
  const handleCreateOrderClick = () => {
    navigate('/admin/orders/new');
  };

  // Helper function to get state color for cancellations
  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'inprogress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Product Ordering Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage product orders and cancellations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateOrderClick} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OrderOverview stats={stats} recentOrders={orders} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <ProductOrders 
            orders={orders}
            loading={loading}
            onRefreshData={fetchData}
            onCreateOrder={handleCreateOrderClick}
          />
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-4">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b-0 pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-red-100 to-rose-100">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Order Cancellations
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Track and manage order cancellation requests with precision
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="rounded-2xl border border-slate-200/50 bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b border-slate-200/50 hover:bg-slate-100/80">
                      <TableHead className="font-bold text-slate-700 py-4 px-6">Cancellation ID</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 px-6">Order ID</TableHead>
                      <TableHead className="hidden sm:table-cell font-bold text-slate-700 py-4 px-6">Reason</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 px-6">State</TableHead>
                      <TableHead className="hidden md:table-cell font-bold text-slate-700 py-4 px-6">Requested Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelOrders.map((cancelOrder, index) => {
                      // Handle both CancelProductOrder and ProductOrder types
                      const isProductOrder = !cancelOrder.productOrder;
                      const orderId = isProductOrder ? cancelOrder.id : cancelOrder.productOrder?.id;
                      const cancellationReason = isProductOrder ? 'Order cancelled' : cancelOrder.cancellationReason;
                      const cancellationDate = isProductOrder ? cancelOrder.orderDate : cancelOrder.requestedCancellationDate;
                      
                      return (
                        <TableRow 
                          key={cancelOrder.id || index}
                          className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-300 border-b border-slate-100/50 group"
                          style={{ height: '80px' }}
                        >
                          <TableCell className="font-medium py-4 px-6">
                            <div className="space-y-1">
                                                          <div className="font-bold text-slate-900 group-hover:text-red-700 transition-colors duration-300">
                              {orderId?.slice(0, 7) || 'Unknown'}...
                            </div>
                              <div className="text-sm text-slate-500 font-mono bg-slate-50 inline-block px-2 py-1 rounded-md">
                                {isProductOrder ? 'Order' : 'Cancel'} #{(orderId || '').slice(0, 7)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="space-y-1">
                                                          <div className="font-semibold text-slate-900">
                              {orderId?.slice(0, 7) || 'Unknown'}...
                            </div>
                              <div className="text-sm text-slate-500 font-mono bg-blue-50 inline-block px-2 py-1 rounded-md">
                                Order #{(orderId || '').slice(0, 7)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell py-4 px-6">
                            <div className="max-w-32">
                              <div className="font-medium text-slate-900 truncate" title={cancellationReason || 'No reason provided'}>
                                {cancellationReason || 'No reason provided'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge className={`bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 shadow-sm border px-3 py-1.5 rounded-lg font-medium`}>
                              <div className="flex items-center space-x-2">
                                <XCircle className="w-4 h-4" />
                                <span className="capitalize font-semibold">cancelled</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell py-4 px-6 text-slate-600 font-medium">
                            {cancellationDate 
                              ? new Date(cancellationDate).toLocaleDateString()
                              : 'N/A'
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {cancelOrders.length === 0 && (
                <div className="text-center py-16">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-lg">
                      <XCircle className="w-10 h-10 text-slate-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No Cancellations Found</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    No orders have been cancelled yet. Cancelled orders will appear here automatically.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}