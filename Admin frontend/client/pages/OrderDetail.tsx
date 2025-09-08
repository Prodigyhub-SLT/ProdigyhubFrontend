import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, FileText, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { productOrderingApi } from '../lib/api';
import type { ProductOrder } from '@shared/product-order-types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

const stateColors = {
  acknowledged: 'bg-blue-100 text-blue-800 border-blue-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  held: 'bg-orange-100 text-orange-800 border-orange-200',
  inProgress: 'bg-purple-100 text-purple-800 border-purple-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  assessingCancellation: 'bg-orange-100 text-orange-800 border-orange-200',
  pendingCancellation: 'bg-red-100 text-red-800 border-red-200',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<ProductOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productOrderingApi.getOrderById(id!);
      setOrder(data as ProductOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;

    try {
      setDeleteLoading(true);
      await productOrderingApi.deleteOrder(order.id);
      toast({
        title: "Success",
        description: "Order deleted successfully"
      });
      navigate('/admin/ordering');
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete order',
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link to="/admin/ordering">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Order</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={loadOrder} variant="outline">
                Try Again
              </Button>
              <Link to="/admin/ordering">
                <Button>
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/admin/ordering">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Order #{order.id.slice(0, 7)}</h1>
                <p className="text-sm text-slate-500">{order.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`${stateColors[order.state] || 'bg-gray-100 text-gray-800'}`} variant="outline">
                {order.state}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the order
                      and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Order Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Order Overview</CardTitle>
              <CardDescription>Basic information about this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-600">Order ID</p>
                  <p className="text-lg font-semibold text-slate-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  <Badge className={`${stateColors[order.state] || 'bg-gray-100 text-gray-800'} mt-1`} variant="outline">
                    {order.state}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Priority</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {order.priority === '1' ? 'High' : order.priority === '2' ? 'Medium' : 'Low'} ({order.priority})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Order Date</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-lg font-semibold text-slate-900">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Requested Completion</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-lg font-semibold text-slate-900">
                      {order.requestedCompletionDate ? new Date(order.requestedCompletionDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Completion Date</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-lg font-semibold text-slate-900">
                      {order.completionDate ? new Date(order.completionDate).toLocaleDateString() : 'Not completed'}
                    </p>
                  </div>
                </div>
              </div>
              {order.description && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-600 mb-2">Description</p>
                  <p className="text-slate-900">{order.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Items */}
          <Card>
            <CardHeader>
              <CardTitle>Product Items ({order.productOrderItem.length})</CardTitle>
              <CardDescription>Products included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.productOrderItem.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">Item #{index + 1}</h4>
                      <Badge variant="outline" className="capitalize">
                        {item.action}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Product Offering</p>
                        <p className="text-slate-900">{item.productOffering?.name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">ID: {item.productOffering?.id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Quantity</p>
                        <p className="text-slate-900">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">State</p>
                        <p className="text-slate-900 capitalize">{item.state || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Parties */}
          {order.relatedParty && order.relatedParty.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Parties ({order.relatedParty.length})</CardTitle>
                <CardDescription>People and organizations associated with this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.relatedParty.map((party, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-lg">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-semibold text-slate-900">{party.name}</p>
                            <Badge variant="outline" className="capitalize">
                              {party.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mb-3">ID: {party.id}</p>
                          
                          {/* Enhanced user details for customers */}
                          {party.role === 'customer' && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                              <h4 className="text-sm font-medium text-slate-700 mb-2">Customer Information</h4>
                              {(order as any).customerDetails ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {(order as any).customerDetails.name && (
                                    <div>
                                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Name</span>
                                      <p className="text-sm text-slate-900">{(order as any).customerDetails.name}</p>
                                    </div>
                                  )}
                                  {(order as any).customerDetails.email && (
                                    <div>
                                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Email</span>
                                      <p className="text-sm text-slate-900">{(order as any).customerDetails.email}</p>
                                    </div>
                                  )}
                                  {(order as any).customerDetails.phone && (
                                    <div>
                                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Phone</span>
                                      <p className="text-sm text-slate-900">{(order as any).customerDetails.phone}</p>
                                    </div>
                                  )}
                                  {(order as any).customerDetails.nic && (
                                    <div>
                                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">NIC Number</span>
                                      <p className="text-sm text-slate-900">{(order as any).customerDetails.nic}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1 text-sm text-slate-600">
                                  {order.note && order.note
                                    .filter(note => note.text.includes('Customer Details') || note.text.includes('Customer Phone') || note.text.includes('Customer NIC'))
                                    .map((note, noteIndex) => (
                                      <div key={noteIndex} className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                        <span>{note.text}</span>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.note && order.note.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Notes ({order.note.length})</CardTitle>
                <CardDescription>Additional notes and comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.note.map((note, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <p className="font-medium text-slate-900">{note.author}</p>
                        </div>
                        <p className="text-sm text-slate-500">
                          {note.date ? new Date(note.date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <p className="text-slate-700">{note.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}