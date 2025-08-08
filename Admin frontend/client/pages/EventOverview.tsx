import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Bell, 
  Clock,
  CheckCircle,
  XCircle,
  Package,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Calendar,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  Layers
} from "lucide-react";

// Add custom CSS animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.8s ease-out forwards;
  }

  .animate-slideInRight {
    animation: slideInRight 0.8s ease-out forwards;
  }

  .animate-bounceIn {
    animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

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

interface EventOverviewProps {
  stats: EventStats;
  recentEvents?: OrderEvent[];
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'acknowledged': return 'bg-blue-500 text-white';
    case 'inprogress': return 'bg-amber-500 text-white';
    case 'completed': return 'bg-emerald-500 text-white';
    case 'cancelled': return 'bg-red-500 text-white';
    case 'pending': return 'bg-yellow-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
};

const getStatusGradient = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'acknowledged': return 'from-blue-400 to-blue-600';
    case 'inprogress': return 'from-amber-400 to-amber-600';
    case 'completed': return 'from-emerald-400 to-emerald-600';
    case 'cancelled': return 'from-red-400 to-red-600';
    case 'pending': return 'from-yellow-400 to-yellow-600';
    default: return 'from-slate-400 to-slate-600';
  }
};

const StatusProgressBar = ({ label, count, total, status, icon: Icon }: { 
  label: string; 
  count: number; 
  total: number; 
  status: string;
  icon: any;
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusGradient(status)}`}></div>
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">{count}</span>
          <Badge className={getStatusColor(status)} variant="outline">
            {percentage.toFixed(0)}%
          </Badge>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getStatusGradient(status)} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function EventOverview({ stats, recentEvents = [] }: EventOverviewProps) {
  const completionPercentage = stats.totalEvents > 0 ? (stats.completedEvents / stats.totalEvents) * 100 : 0;
  const highPriorityPercentage = stats.totalEvents > 0 ? (stats.highPriorityEvents / stats.totalEvents) * 100 : 0;

  // Get recent events (last 3) - fallback to empty array if not provided
  const recentEventsList = recentEvents.slice(0, 3);

  const getEventStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return 'bg-blue-500 text-white';
      case 'inprogress': return 'bg-amber-500 text-white';
      case 'completed': return 'bg-emerald-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getEventIcon = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return Clock;
      case 'inprogress': return Activity;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'pending': return Package;
      default: return MessageSquare;
    }
  };

  return (
    <div className="space-y-8">
      {/* Futuristic Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white border-0 shadow-2xl h-64">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Total Events</CardTitle>
              <CardDescription className="text-blue-100">Lifecycle events tracked: {stats.totalEvents} events</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.totalEvents}</div>
            <div className="text-sm text-blue-100">
              +{stats.todayEvents} events today
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white border-0 shadow-2xl h-64">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">High Priority</CardTitle>
              <CardDescription className="text-green-100">Critical & high priority: {stats.highPriorityEvents} events</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Bell className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.highPriorityEvents}</div>
            <div className="text-sm text-green-100">
              {highPriorityPercentage.toFixed(0)}% of total events
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Status Breakdown with Animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Events by Status</div>
                <div className="text-sm text-gray-600">Current event distribution</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <StatusProgressBar 
                label="Acknowledged" 
                count={stats.acknowledgedEvents} 
                total={stats.totalEvents} 
                status="acknowledged"
                icon={Clock}
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <StatusProgressBar 
                label="In Progress" 
                count={stats.inProgressEvents} 
                total={stats.totalEvents} 
                status="inprogress"
                icon={Activity}
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <StatusProgressBar 
                label="Completed" 
                count={stats.completedEvents} 
                total={stats.totalEvents} 
                status="completed"
                icon={CheckCircle}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Performance Metrics</div>
                <div className="text-sm text-gray-600">Key performance indicators</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Completion Rate */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Completion Rate</span>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {completionPercentage.toFixed(0)}%
                  </Badge>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* High Priority Events */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">High Priority</span>
                  </div>
                  <Badge className="bg-orange-600 text-white">
                    {stats.highPriorityEvents}
                  </Badge>
                </div>
                <div className="text-sm text-orange-700">
                  Events requiring immediate attention
                </div>
              </div>

              {/* Today's Activity */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Today's Activity</span>
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {stats.todayEvents}
                  </Badge>
                </div>
                <div className="text-sm text-blue-700">
                  Events generated today
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group animate-slideInLeft">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold">Active Events</div>
                <div className="text-sm text-gray-600">Currently processing</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.acknowledgedEvents + stats.inProgressEvents}
            </div>
            <div className="text-sm text-gray-600">
              Events in the pipeline
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold">Success Rate</div>
                <div className="text-sm text-gray-600">Completed vs Total</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {completionPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">
              Events successfully completed
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group animate-slideInRight">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold">Event Flow</div>
                <div className="text-sm text-gray-600">Order processing flow</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.acknowledgedEvents + stats.inProgressEvents}
            </div>
            <div className="text-sm text-gray-600">
              Events in active workflow
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Activity Summary */}
      <Card className="bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-gray-700 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Event Summary</div>
              <div className="text-sm text-gray-600">Quick overview of event metrics</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.highPriorityEvents}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.inProgressEvents}</div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{completionPercentage.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Activity */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Recent Events</div>
              <div className="text-sm text-gray-600">Latest lifecycle events</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEventsList.length > 0 ? (
            <div className="space-y-4">
              {recentEventsList.map((event, index) => {
                const EventIcon = getEventIcon(event.currentState);
                
                return (
                  <div key={event.id} className="relative group">
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <EventIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{event.eventType}</h4>
                        <p className="text-gray-600">{event.productName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getEventStateColor(event.currentState)} shadow-md`}>
                          {event.currentState?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            {event.timestamp ? new Date(event.timestamp).toLocaleDateString() : 'No date'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'No time'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Recent Activity</h3>
              <p className="text-gray-600 mb-6">No recent events found. Events will appear here when order lifecycle changes occur.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}