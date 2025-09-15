import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Package, 
  Bell,
  X,
  RefreshCw,
  Trash2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Square,
  Info,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface OrderNotification {
  id: string;
  orderId: string;
  packageName: string;
  status: 'acknowledged' | 'inProgress' | 'completed' | 'cancelled' | 'failed';
  message: string;
  timestamp: string;
  read: boolean;
  canCancel?: boolean;
  progress?: number;
}

interface MessagesTabProps {
  user: User | null;
}

export default function MessagesTab({ user }: MessagesTabProps) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Helper functions for localStorage management
  const getReadNotifications = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('readNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const saveReadNotifications = (readIds: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('readNotifications', JSON.stringify([...readIds]));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  };

  const getDeletedNotifications = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('deletedNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const saveDeletedNotifications = (deletedIds: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('deletedNotifications', JSON.stringify([...deletedIds]));
    } catch (error) {
      console.error('Error saving deleted notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Check for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/productOrderingManagement/v4/productOrder');
      if (response.ok) {
        const orders = await response.json();
        const userOrders = orders.filter((order: any) => 
          order.customerDetails?.email === user?.email
        );
        
        // Get previously read and deleted notification IDs
        const readNotifications = getReadNotifications();
        const deletedNotifications = getDeletedNotifications();
        
        // Convert orders to notifications and filter out deleted ones
        const newNotifications: OrderNotification[] = userOrders
          .filter((order: any) => !deletedNotifications.has(order.id))
          .map((order: any) => ({
            id: order.id,
            orderId: order.id,
            packageName: order.productOrderItem?.[0]?.productOffering?.name || 'Unknown Package',
            status: order.state,
            message: getStatusMessage(order.state, order.productOrderItem?.[0]?.productOffering?.name),
            timestamp: order.creationDate || order.createdAt,
            read: readNotifications.has(order.id),
            canCancel: ['acknowledged', 'inProgress'].includes(order.state),
            progress: getOrderProgress(order.state)
          }));
        
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (status: string, packageName: string) => {
    switch (status) {
      case 'acknowledged':
        return `Your upgrade request for ${packageName} has been acknowledged and is being processed.`;
      case 'inProgress':
        return `Your upgrade request for ${packageName} is now in progress.`;
      case 'completed':
        return `Your upgrade request for ${packageName} has been completed successfully!`;
      case 'cancelled':
        return `Your upgrade request for ${packageName} has been cancelled.`;
      case 'failed':
        return `Your upgrade request for ${packageName} has failed. Please contact support.`;
      default:
        return `Update for your ${packageName} upgrade request.`;
    }
  };

  const getOrderProgress = (status: string): number => {
    switch (status) {
      case 'acknowledged': return 25;
      case 'inProgress': return 75;
      case 'completed': return 100;
      case 'cancelled': return 0;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'inProgress':
        return <PlayCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return <Badge className="bg-blue-100 text-blue-800">Acknowledged</Badge>;
      case 'inProgress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // Save to localStorage
    const readNotifications = getReadNotifications();
    readNotifications.add(notificationId);
    saveReadNotifications(readNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    // Save all notification IDs to localStorage
    const readNotifications = getReadNotifications();
    notifications.forEach(notif => readNotifications.add(notif.id));
    saveReadNotifications(readNotifications);
  };

  const deleteNotification = (notificationId: string) => {
    // Remove from current state
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
    
    // Add to deleted notifications in localStorage
    const deletedNotifications = getDeletedNotifications();
    deletedNotifications.add(notificationId);
    saveDeletedNotifications(deletedNotifications);
  };

  const cancelOrder = async (notificationId: string) => {
    setCancellingOrder(notificationId);
    try {
      console.log('🚫 Attempting to cancel order:', notificationId);
      
      // Step 1: Update the order state to cancelled first (same as admin dashboard)
      console.log('📝 Step 1: Updating order state to cancelled...');
      const updateResponse = await fetch(`/api/productOrderingManagement/v4/productOrder/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify({
          state: 'cancelled',
          cancellationDate: new Date().toISOString(),
          cancellationReason: 'User requested cancellation',
          '@type': 'ProductOrder'
        })
      });
      
      if (!updateResponse.ok) {
        const updateError = await updateResponse.json().catch(() => ({}));
        console.error('❌ Failed to update order state:', updateError);
        alert(`Failed to cancel order: ${updateError.message || updateError.error || 'Please try again or contact support.'}`);
        return;
      }
      
      const updateData = await updateResponse.json();
      console.log('✅ Order state updated to cancelled:', updateData);
      
      // Step 2: Create cancellation request (same as admin dashboard)
      console.log('📝 Step 2: Creating cancellation request...');
      const cancelRequest = {
        productOrder: {
          id: notificationId,
          href: `/productOrderingManagement/v4/productOrder/${notificationId}`,
          '@type': 'ProductOrderRef'
        },
        cancellationReason: 'User requested cancellation',
        requestedCancellationDate: new Date().toISOString(),
        '@type': 'CancelProductOrder'
      };
      
      console.log('📤 Cancel request body:', cancelRequest);
      
      const cancelResponse = await fetch(`/api/productOrderingManagement/v4/cancelProductOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelRequest)
      });

      console.log('📥 Cancel response status:', cancelResponse.status);

      if (cancelResponse.ok) {
        const cancelData = await cancelResponse.json();
        console.log('✅ Cancellation request created:', cancelData);
      } else {
        const cancelError = await cancelResponse.json().catch(() => ({}));
        console.warn('⚠️ Failed to create cancellation request:', cancelError);
        // Don't fail the whole process if cancellation request creation fails
      }
      
      // Update the notification status to cancelled
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { 
                ...notif, 
                status: 'cancelled' as const,
                message: getStatusMessage('cancelled', notif.packageName),
                canCancel: false,
                progress: 0
              } 
            : notif
        )
      );
      
      // Mark as read since user interacted with it
      const readNotifications = getReadNotifications();
      readNotifications.add(notificationId);
      saveReadNotifications(readNotifications);
      
      console.log('✅ Order cancellation completed successfully');
      
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      alert(`Error cancelling order: ${error.message}. Please try again or contact support.`);
    } finally {
      setCancellingOrder(null);
    }
  };

  const toggleMessageExpansion = (notificationId: string) => {
    setExpandedMessage(expandedMessage === notificationId ? null : notificationId);
    // Mark as read when user clicks to expand
    if (expandedMessage !== notificationId) {
      markAsRead(notificationId);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading messages...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Messages
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2"
                >
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No messages yet</h3>
              <p className="text-gray-400">You'll receive notifications about your package upgrades here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border transition-all duration-200 cursor-pointer ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                  onClick={() => toggleMessageExpansion(notification.id)}
                >
                  {/* Compact Message Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div>
                          {getStatusIcon(notification.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {notification.packageName}
                            </span>
                            {getStatusBadge(notification.status)}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {expandedMessage === notification.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedMessage === notification.id && (
                    <div className="px-4 pb-4 border-t border-gray-200 bg-white rounded-b-lg">
                      {/* Progress Bar for Active Orders */}
                      {notification.status !== 'completed' && notification.status !== 'cancelled' && notification.status !== 'failed' && (
                        <div className="mb-4 pt-4">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{notification.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                notification.status === 'acknowledged' ? 'bg-blue-500' :
                                notification.status === 'inProgress' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${notification.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Details */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">Order Status</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Order ID:</span>
                            <span className="ml-1 font-mono">{notification.orderId.slice(0, 8)}...</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className="ml-1">{notification.status}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Progress:</span>
                            <span className="ml-1">{notification.progress}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="ml-1">{new Date(notification.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {notification.canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelOrder(notification.id);
                            }}
                            disabled={cancellingOrder === notification.id}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            {cancellingOrder === notification.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Square className="h-3 w-3 mr-1" />
                            )}
                            Cancel Request
                          </Button>
                        )}
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

