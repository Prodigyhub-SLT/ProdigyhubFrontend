import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Eye, 
  Search 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productOrderingApi, eventManagementApi } from "@/lib/api";
import type { ProductOrder, CreateCancelProductOrderRequest } from "@shared/product-order-types";

interface ProductOrdersProps {
  orders: ProductOrder[];
  loading: boolean;
  onRefreshData: () => void;
  onCreateOrder: () => void;
}

export default function ProductOrders({ 
  orders, 
  loading, 
  onRefreshData, 
  onCreateOrder 
}: ProductOrdersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<ProductOrder | null>(null);
  
  const { toast } = useToast();

  const cancelOrder = async (orderId: string, cancellationReason: string) => {
    try {
      console.log('Starting cancellation for order:', orderId);
      
      const cancelRequest: CreateCancelProductOrderRequest = {
        cancellationReason,
        requestedCancellationDate: new Date().toISOString(),
        productOrder: {
          id: orderId,
          href: `/productOrderingManagement/v4/productOrder/${orderId}`,
          '@type': 'ProductOrderRef'
        },
        '@type': 'CancelProductOrder'
      };

      console.log('Updating order state to cancelled...');
      // First, update the order state to cancelled
      await productOrderingApi.updateOrder(orderId, { state: 'cancelled' });
      console.log('Order state updated successfully');

      console.log('Submitting cancellation request...');
      // Then submit the cancellation request
      await productOrderingApi.cancelOrder(cancelRequest);
      console.log('Cancellation request submitted successfully');

      // Create event notification for cancellation
      try {
        console.log('Creating event notification...');
        const eventData = {
          id: `${orderId}-cancelled-${Date.now()}`,
          eventType: 'ProductOrderCancelled',
          eventTime: new Date().toISOString(),
          timeOccurred: new Date().toISOString(),
          correlationId: orderId,
          domain: 'ProductOrdering',
          title: 'Order Cancellation',
          description: `Order ${orderId} has been cancelled. Reason: ${cancellationReason}`,
          priority: 'Critical',
          source: {
            id: orderId,
            type: 'ProductOrder'
          },
          event: {
            orderId: orderId,
            cancellationReason: cancellationReason,
            cancelledAt: new Date().toISOString(),
            previousState: 'inProgress',
            currentState: 'cancelled'
          }
        };

        console.log('Event data:', eventData);
        // Send event to Event Management API using the proper API client
        await eventManagementApi.createEvent(eventData);
        console.log('Event notification sent successfully');
      } catch (eventError) {
        console.warn('Failed to create event notification:', eventError);
      }

      toast({
        title: "Success",
        description: "Order cancelled successfully and moved to cancellations",
      });
      
      // Add a small delay to ensure the backend has processed the changes
      setTimeout(() => {
        onRefreshData();
      }, 1000);
      
      setIsCancelDialogOpen(false);
      setSelectedOrderId("");
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const updateOrderState = async (orderId: string, newState: string) => {
    try {
      await productOrderingApi.updateOrder(orderId, { state: newState as any });

      toast({
        title: "Success",
        description: `Order state updated to ${newState}`,
      });
      onRefreshData();
    } catch (error) {
      console.error('Error updating order state:', error);
      toast({
        title: "Error",
        description: "Failed to update order state",
        variant: "destructive",
      });
    }
  };

  const getStateIcon = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return <Clock className="w-4 h-4" />;
      case 'inprogress': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 shadow-sm';
      case 'inprogress': return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 shadow-sm';
      case 'completed': return 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 shadow-sm';
      case 'cancelled': return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 shadow-sm';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 shadow-sm';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '1': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25';
      case '2': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25';
      case '3': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25';
    }
  };

  const getProductNames = (order: ProductOrder): string => {
    if (!order.productOrderItem || order.productOrderItem.length === 0) {
      return 'No products';
    }
    
    const productNames = order.productOrderItem
      .map(item => item.productOffering?.name || 'Unknown Product')
      .filter(name => name !== 'Unknown Product');
    
    if (productNames.length === 0) {
      return 'No product names available';
    }
    
    if (productNames.length > 1) {
      return `${productNames[0]} (+${productNames.length - 1} more)`;
    }
    
    return productNames[0];
  };

  const getAllProductNames = (order: ProductOrder): string[] => {
    if (!order.productOrderItem || order.productOrderItem.length === 0) {
      return [];
    }
    
    return order.productOrderItem
      .map(item => item.productOffering?.name || 'Unknown Product')
      .filter(name => name !== 'Unknown Product');
  };

  const handleViewOrder = (order: ProductOrder) => {
    console.log('🔍 Selected order for view:', order);
    console.log('🔍 Order customerDetails:', order.customerDetails);
    setSelectedOrderForView(order);
    setIsViewDialogOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const productNames = getAllProductNames(order);
    const matchesSearch = 
      (order.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      productNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.state === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b-0 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Product Orders
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Manage and track product orders with precision
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row justify-between mb-8 gap-6">
            <div className="relative flex items-center space-x-2 flex-1">
              <div className="absolute left-4 z-10">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                placeholder="Search orders by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border-slate-200/50 bg-white/70 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-blue-200/50 transition-all duration-300 shadow-sm"
              />
            </div>
            <div className="flex space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl border-slate-200/50 bg-white/70 backdrop-blur-sm focus:border-blue-300 shadow-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200/50 bg-white/95 backdrop-blur-xl shadow-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-200/50 bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b border-slate-200/50 hover:bg-slate-100/80">
                  <TableHead className="font-bold text-slate-700 py-4 px-6">Product Name(s)</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-700 py-4 px-6">Customer</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">State</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-700 py-4 px-6 text-center">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell font-bold text-slate-700 py-4 px-6">Order Date</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => {
                  const productNames = getAllProductNames(order);
                  const displayName = getProductNames(order);
                  
                  return (
                    <TableRow 
                      key={order.id || index}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300 border-b border-slate-100/50 group"
                      style={{ height: '80px' }}
                    >
                      <TableCell className="font-medium py-4 px-6">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300" title={productNames.join(', ')}>
                            {displayName}
                          </div>
                          <div className="text-sm text-slate-500 font-mono bg-slate-50 inline-block px-2 py-1 rounded-md">
                            Order #{(order.id || '').slice(0, 7)}...
                          </div>
                          {productNames.length > 1 && (
                            <div className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-full border border-blue-200">
                              {productNames.length} products total
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-4 px-6">
                        {order.customerDetails ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900 text-sm">
                              {order.customerDetails.name || 'Unknown Customer'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {order.customerDetails.email || 'No email'}
                            </div>
                            {order.customerDetails.phone && (
                              <div className="text-xs text-slate-500">
                                {order.customerDetails.phone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm">No customer data</div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge className={`${getStateColor(order.state || '')} border px-3 py-1.5 rounded-lg font-medium`}>
                          <div className="flex items-center space-x-2">
                            {getStateIcon(order.state || '')}
                            <span className="capitalize font-semibold">{order.state || 'unknown'}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-4 px-6 text-center">
                        <div className="flex justify-center items-center">
                          <Badge className={`${getPriorityColor(order.priority || '')} px-3 py-1.5 rounded-lg font-bold min-w-[60px]`}>
                            {order.priority === '1' ? 'High' : 
                             order.priority === '2' ? 'Medium' : 
                             order.priority === '3' ? 'Low' : 
                             order.priority || 'Normal'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-4 px-6 text-slate-600 font-medium">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            title="View Order Details"
                            className="rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.state === 'acknowledged' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateOrderState(order.id || '', 'inProgress')}
                              title="Start Processing"
                              className="rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <Package className="w-4 h-4" />
                            </Button>
                          )}
                          {order.state === 'inProgress' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateOrderState(order.id || '', 'completed')}
                              title="Mark Complete"
                              className="rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {['acknowledged', 'inProgress'].includes(order.state || '') && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedOrderId(order.id || '');
                                setIsCancelDialogOpen(true);
                              }}
                              title="Cancel Order"
                              className="rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Orders Found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No orders match your current filters. Try adjusting your search criteria.' 
                  : 'Get started by creating your first product order and begin tracking your business growth.'}
              </p>
              <Button 
                onClick={onCreateOrder}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-xl bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <span>Cancel Order</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Provide a reason for cancelling order {selectedOrderId?.slice(0, 7)}...
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const reason = formData.get('reason') as string;
            if (reason && selectedOrderId) {
              cancelOrder(selectedOrderId, reason);
            }
          }}>
            <div className="grid gap-6 py-4">
              <div className="space-y-3">
                <Label htmlFor="reason" className="text-sm font-semibold text-slate-700">Cancellation Reason *</Label>
                <Textarea
                  id="reason" 
                  name="reason" 
                  placeholder="Enter cancellation reason..."
                  required 
                  className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl focus:border-red-300 focus:ring-red-200/50"
                />
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCancelDialogOpen(false);
                  setSelectedOrderId("");
                }}
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Submit Cancellation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
          
          {selectedOrderForView && (
            <div className="space-y-8 py-6">
              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Order Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                      <Label className="text-blue-700 font-bold text-sm">Order ID</Label>
                      <p className="text-sm font-mono bg-white p-3 rounded-lg border border-blue-200/50 mt-2 shadow-sm">
                        {selectedOrderForView.id || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
                      <Label className="text-emerald-700 font-bold text-sm">Status</Label>
                      <div className="mt-3">
                        <Badge className={`${getStateColor(selectedOrderForView.state || '')} border px-4 py-2`}>
                          <div className="flex items-center space-x-2">
                            {getStateIcon(selectedOrderForView.state || '')}
                            <span className="capitalize font-semibold">{selectedOrderForView.state || 'unknown'}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
                      <Label className="text-amber-700 font-bold text-sm">Priority</Label>
                      <div className="mt-3">
                        <Badge className={`${getPriorityColor(selectedOrderForView.priority || '')} px-4 py-2`}>
                          {selectedOrderForView.priority === '1' ? 'High Priority' : 
                           selectedOrderForView.priority === '2' ? 'Medium' : 
                           selectedOrderForView.priority === '3' ? 'Low' : 'Normal'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrderForView.description && (
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/50">
                      <Label className="text-slate-700 font-bold text-sm">Description</Label>
                      <p className="text-sm mt-2 p-4 bg-white rounded-lg border border-slate-200/50 shadow-sm">
                        {selectedOrderForView.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Details Section */}
              {selectedOrderForView.customerDetails && (
                <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-900">Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                        <Label className="text-purple-700 font-bold text-sm">Customer Name</Label>
                        <p className="text-sm font-semibold bg-white p-3 rounded-lg border border-purple-200/50 mt-2 shadow-sm">
                          {selectedOrderForView.customerDetails.name || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                        <Label className="text-blue-700 font-bold text-sm">Email</Label>
                        <p className="text-sm font-mono bg-white p-3 rounded-lg border border-blue-200/50 mt-2 shadow-sm">
                          {selectedOrderForView.customerDetails.email || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50">
                        <Label className="text-green-700 font-bold text-sm">Phone</Label>
                        <p className="text-sm font-mono bg-white p-3 rounded-lg border border-green-200/50 mt-2 shadow-sm">
                          {selectedOrderForView.customerDetails.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
                        <Label className="text-amber-700 font-bold text-sm">NIC</Label>
                        <p className="text-sm font-mono bg-white p-3 rounded-lg border border-amber-200/50 mt-2 shadow-sm">
                          {selectedOrderForView.customerDetails.nic || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-200/50">
                        <Label className="text-cyan-700 font-bold text-sm">Customer ID</Label>
                        <p className="text-sm font-mono bg-white p-3 rounded-lg border border-cyan-200/50 mt-2 shadow-sm">
                          {selectedOrderForView.customerDetails.id || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50">
                        <Label className="text-rose-700 font-bold text-sm">Order Type</Label>
                        <p className="text-sm font-semibold bg-white p-3 rounded-lg border border-rose-200/50 mt-2 shadow-sm">
                          {selectedOrderForView.category || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Address Details if available */}
                    {selectedOrderForView.customerDetails.address && (
                      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/50">
                        <Label className="text-slate-700 font-bold text-sm">Address</Label>
                        <div className="mt-2 p-4 bg-white rounded-lg border border-slate-200/50 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedOrderForView.customerDetails.address.street && (
                              <div>
                                <span className="text-slate-600 font-medium">Street: </span>
                                <span className="text-slate-900">{selectedOrderForView.customerDetails.address.street}</span>
                              </div>
                            )}
                            {selectedOrderForView.customerDetails.address.city && (
                              <div>
                                <span className="text-slate-600 font-medium">City: </span>
                                <span className="text-slate-900">{selectedOrderForView.customerDetails.address.city}</span>
                              </div>
                            )}
                            {selectedOrderForView.customerDetails.address.district && (
                              <div>
                                <span className="text-slate-600 font-medium">District: </span>
                                <span className="text-slate-900">{selectedOrderForView.customerDetails.address.district}</span>
                              </div>
                            )}
                            {selectedOrderForView.customerDetails.address.province && (
                              <div>
                                <span className="text-slate-600 font-medium">Province: </span>
                                <span className="text-slate-900">{selectedOrderForView.customerDetails.address.province}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    Product Items ({selectedOrderForView.productOrderItem?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedOrderForView.productOrderItem || selectedOrderForView.productOrderItem.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No product items in this order</p>
                  ) : (
                    <div className="space-y-6">
                      {selectedOrderForView.productOrderItem.map((item, index) => (
                        <div key={index} className="border border-slate-200/50 rounded-xl p-6 bg-gradient-to-br from-white to-slate-50/30 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-900 text-lg">Item #{index + 1}</h4>
                            <Badge variant="outline" className="capitalize px-3 py-1 rounded-lg">
                              {item.action || 'add'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                              <Label className="text-slate-600 font-semibold">Product Offering ID</Label>
                              <p className="text-sm font-mono bg-white p-3 rounded-lg border border-slate-200/50 mt-2 shadow-sm">
                                {item.productOffering?.id || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-slate-600 font-semibold">Product Name</Label>
                              <p className="text-sm font-bold text-slate-900 mt-2">
                                {item.productOffering?.name || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-slate-600 font-semibold">Quantity</Label>
                              <p className="text-sm font-bold text-slate-900 mt-2">{item.quantity || 1}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
            <Button 
              variant="outline" 
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
    </>
  );
}