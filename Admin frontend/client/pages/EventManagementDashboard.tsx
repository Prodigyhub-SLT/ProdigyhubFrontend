import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Zap, 
  MessageSquare, 
  Plus, 
  Eye, 
  RefreshCw, 
  Bell, 
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ShoppingCart,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eventManagementApi, productOrderingApi } from "@/lib/api";
import EventOverview from "./EventOverview";

interface OrderEvent {
  id: string;
  orderId: string;
  productName: string;
  eventType: string;
  previousState?: string;
  currentState: string;
  timestamp: string;
  priority: string;
  description: string;
  orderInfo?: {
    totalPrice?: number;
    currency?: string;
    customerName?: string;
    items?: any[];
  };
}

interface Event {
  id: string;
  eventType: string;
  eventTime?: string;
  timeOccurred?: string;
  correlationId?: string;
  domain?: string;
  title?: string;
  description?: string;
  priority?: string;
  source?: any;
  event?: any;
}

interface EventStats {
  totalEvents: number;
  todayEvents: number;
  acknowledgedEvents: number;
  inProgressEvents: number;
  completedEvents: number;
  highPriorityEvents: number;
  eventsByPriority: { [key: string]: number };
  recentOrderEvents: OrderEvent[];
}

export default function EventManagementDashboard() {
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    todayEvents: 0,
    acknowledgedEvents: 0,
    inProgressEvents: 0,
    completedEvents: 0,
    highPriorityEvents: 0,
    eventsByPriority: {},
    recentOrderEvents: []
  });
  
  const [events, setEvents] = useState<Event[]>([]);
  const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  
  const { toast } = useToast();

  const fetchOrderData = async () => {
    try {
      const ordersData = await productOrderingApi.getOrders().catch(() => []);
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      setOrders(ordersArray);
      
      // Generate lifecycle events from orders
      const lifecycleEvents = generateLifecycleEvents(ordersArray);
      setOrderEvents(lifecycleEvents);
      
      return lifecycleEvents;
    } catch (error) {
      console.error('Error fetching order data:', error);
      return [];
    }
  };

  const generateLifecycleEvents = (orders: any[]): OrderEvent[] => {
    const events: OrderEvent[] = [];
    
    orders.forEach((order) => {
      const productName = order.productOrderItem?.[0]?.productOffering?.name || 'Unknown Product';
      const baseEventData = {
        orderId: order.id,
        productName,
        timestamp: order.orderDate || new Date().toISOString(),
        orderInfo: {
          totalPrice: order.orderTotalPrice?.[0]?.price?.taxIncludedAmount?.value,
          currency: order.orderTotalPrice?.[0]?.price?.taxIncludedAmount?.unit || 'USD',
          customerName: order.relatedParty?.[0]?.name || 'Unknown Customer',
          items: order.productOrderItem || []
        }
      };

      // Generate events based on current state and create lifecycle progression
      switch (order.state?.toLowerCase()) {
        case 'acknowledged':
          events.push({
            id: `${order.id}-acknowledged`,
            ...baseEventData,
            eventType: 'Order Acknowledged',
            currentState: 'acknowledged',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... has been acknowledged and is ready for processing`
          });
          break;

        case 'inprogress':
          // Add acknowledged event first
          events.push({
            id: `${order.id}-acknowledged`,
            ...baseEventData,
            eventType: 'Order Acknowledged',
            currentState: 'acknowledged',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... was acknowledged`,
            timestamp: new Date(new Date(baseEventData.timestamp).getTime() - 30 * 60000).toISOString() // 30 min ago
          });
          
          // Add in progress event
          events.push({
            id: `${order.id}-inprogress`,
            ...baseEventData,
            eventType: 'Order In Progress',
            previousState: 'acknowledged',
            currentState: 'inprogress',
            priority: 'High',
            description: `Order ${order.id.slice(0, 7)}... is now being processed and fulfilled`
          });
          break;

        case 'completed':
          // Add all previous states
          events.push({
            id: `${order.id}-acknowledged`,
            ...baseEventData,
            eventType: 'Order Acknowledged',
            currentState: 'acknowledged',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... was acknowledged`,
            timestamp: new Date(new Date(baseEventData.timestamp).getTime() - 120 * 60000).toISOString() // 2 hours ago
          });
          
          events.push({
            id: `${order.id}-inprogress`,
            ...baseEventData,
            eventType: 'Order In Progress',
            previousState: 'acknowledged',
            currentState: 'inprogress',
            priority: 'High',
            description: `Order ${order.id.slice(0, 7)}... was being processed`,
            timestamp: new Date(new Date(baseEventData.timestamp).getTime() - 60 * 60000).toISOString() // 1 hour ago
          });
          
          events.push({
            id: `${order.id}-completed`,
            ...baseEventData,
            eventType: 'Order Completed',
            previousState: 'inprogress',
            currentState: 'completed',
            priority: 'High',
            description: `Order ${order.id.slice(0, 7)}... has been successfully completed and delivered`
          });
          break;

        case 'cancelled':
          events.push({
            id: `${order.id}-cancelled`,
            ...baseEventData,
            eventType: 'Order Cancelled',
            currentState: 'cancelled',
            priority: 'Critical',
            description: `Order ${order.id.slice(0, 7)}... has been cancelled`
          });
          break;

        default:
          // Pending or unknown state
          events.push({
            id: `${order.id}-pending`,
            ...baseEventData,
            eventType: 'Order Created',
            currentState: 'pending',
            priority: 'Normal',
            description: `Order ${order.id.slice(0, 7)}... has been created and is awaiting acknowledgment`
          });
      }
    });

    // Sort by timestamp descending (most recent first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const fetchEventData = async () => {
    try {
      const eventsData = await eventManagementApi.getEvents().catch(() => []);
      const eventsArray = Array.isArray(eventsData) ? eventsData : [];
      setEvents(eventsArray);
      return eventsArray;
    } catch (error) {
      console.error('Error fetching event data:', error);
      return [];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lifecycleEvents, systemEvents] = await Promise.all([
        fetchOrderData(),
        fetchEventData()
      ]);

      // Calculate stats
      const today = new Date().toDateString();
      const todayEvents = lifecycleEvents.filter(e => 
        new Date(e.timestamp).toDateString() === today
      ).length;
      
      const acknowledgedEvents = lifecycleEvents.filter(e => e.currentState === 'acknowledged').length;
      const inProgressEvents = lifecycleEvents.filter(e => e.currentState === 'inprogress').length;
      const completedEvents = lifecycleEvents.filter(e => e.currentState === 'completed').length;
      const highPriorityEvents = lifecycleEvents.filter(e => 
        e.priority === 'High' || e.priority === 'Critical'
      ).length;

      // Group by priority
      const eventsByPriority: { [key: string]: number } = {};
      lifecycleEvents.forEach(e => {
        eventsByPriority[e.priority] = (eventsByPriority[e.priority] || 0) + 1;
      });

      setStats({
        totalEvents: lifecycleEvents.length + systemEvents.length,
        todayEvents,
        acknowledgedEvents,
        inProgressEvents,
        completedEvents,
        highPriorityEvents,
        eventsByPriority,
        recentOrderEvents: lifecycleEvents.slice(0, 10)
      });

    } catch (error) {
      console.error('Error fetching event data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch event data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inprogress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return <Clock className="w-4 h-4" />;
      case 'inprogress': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Package className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredOrderEvents = orderEvents.filter(event => {
    const matchesSearch = event.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'all' || event.currentState === stateFilter;
    const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;
    return matchesSearch && matchesState && matchesPriority;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track product order lifecycle and system events</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>


      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EventOverview stats={stats} recentEvents={stats.recentOrderEvents} />
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events by product, order ID, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Events Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Product Order Lifecycle Events
              </CardTitle>
              <CardDescription>
                Real-time tracking of order state changes from acknowledgment to completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrderEvents.length > 0 ? (
                  filteredOrderEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getStateColor(event.currentState)} border`}>
                            {getStateIcon(event.currentState)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{event.eventType}</h4>
                            <p className="text-sm text-gray-600">{event.productName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(event.priority)}>
                            {event.priority}
                          </Badge>
                          <Badge className={getStateColor(event.currentState)}>
                            {event.currentState.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="ml-11 space-y-2">
                        <p className="text-gray-700">{event.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="w-4 h-4" />
                            Order: {event.orderId.slice(0, 7)}...
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                          {event.orderInfo?.totalPrice && (
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              ${event.orderInfo.totalPrice.toFixed(2)} {event.orderInfo.currency}
                            </span>
                          )}
                          {event.previousState && (
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-4 h-4" />
                              {event.previousState} → {event.currentState}
                            </span>
                          )}
                        </div>

                        {event.orderInfo?.customerName && (
                          <p className="text-sm text-gray-600">
                            Customer: {event.orderInfo.customerName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Activity className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No Events Found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || stateFilter !== 'all' || priorityFilter !== 'all' 
                        ? "No events match your current filters. Try adjusting your search criteria."
                        : "No order lifecycle events found. Events will appear here when orders are created and change states."
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}