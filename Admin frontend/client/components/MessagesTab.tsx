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
  RefreshCw
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
  status: 'acknowledged' | 'inProgress' | 'completed';
  message: string;
  timestamp: string;
  read: boolean;
}

interface MessagesTabProps {
  user: User | null;
}

export default function MessagesTab({ user }: MessagesTabProps) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Convert orders to notifications
        const newNotifications: OrderNotification[] = userOrders.map((order: any) => ({
          id: order.id,
          orderId: order.id,
          packageName: order.productOrderItem?.[0]?.productOffering?.name || 'Unknown Package',
          status: order.state,
          message: getStatusMessage(order.state, order.productOrderItem?.[0]?.productOffering?.name),
          timestamp: order.creationDate || order.createdAt,
          read: false
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
      default:
        return `Update for your ${packageName} upgrade request.`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'inProgress':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
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
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
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
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
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
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(notification.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {notification.packageName}
                          </span>
                          {getStatusBadge(notification.status)}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Order ID: {notification.orderId}</span>
                          <span>
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
