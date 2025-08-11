import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  ShoppingCart, 
  Package, 
  CheckCircle, 
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  BarChart3,
  Target,
  Layers,
  Zap,
  Plus,
  DollarSign,
  Calendar
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

interface OrderStats {
  totalOrders: number;
  acknowledgedOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCancellations: number;
  avgOrderValue: number;
}

interface OrderOverviewProps {
  stats: OrderStats;
  recentOrders?: any[]; // Add recent orders prop
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'acknowledged': return 'bg-blue-500 text-white';
    case 'inprogress': return 'bg-amber-500 text-white';
    case 'completed': return 'bg-emerald-500 text-white';
    case 'cancelled': return 'bg-red-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
};





export default function OrderOverview({ stats, recentOrders = [] }: OrderOverviewProps) {
  const completionPercentage = stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0;

  // Get recent orders (last 3) - fallback to empty array if not provided
  const recentOrdersList = recentOrders.slice(0, 3);

  const getOrderStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return 'bg-blue-500 text-white';
      case 'inprogress': return 'bg-amber-500 text-white';
      case 'completed': return 'bg-emerald-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getOrderIcon = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'acknowledged': return Clock;
      case 'inprogress': return Activity;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };
  const totalOrderValue = stats.avgOrderValue * stats.totalOrders;

  // Data for the donut chart (kept in one place)
  const statusChartData = [
    { name: 'Acknowledged', value: stats.acknowledgedOrders, color: '#3b82f6', gradientId: 'gradAck' },
    { name: 'In Progress', value: stats.inProgressOrders, color: '#f59e0b', gradientId: 'gradProg' },
    { name: 'Completed', value: stats.completedOrders, color: '#10b981', gradientId: 'gradComp' },
    { name: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444', gradientId: 'gradCancel' },
  ];

  const totalOrdersCount = stats.totalOrders;

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
              <CardTitle className="text-2xl font-bold">Total Orders</CardTitle>
              <CardDescription className="text-blue-100">Orders managed: {stats.totalOrders} orders</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.totalOrders}</div>
            <div className="text-sm text-blue-100">
              +{stats.acknowledgedOrders} acknowledged orders
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white border-0 shadow-2xl h-64">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Cancellations</CardTitle>
              <CardDescription className="text-green-100">Total requests: {stats.totalCancellations} cancellations</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <XCircle className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.totalCancellations}</div>
            <div className="text-sm text-green-100">
              Total cancellation requests
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
                <div className="text-xl font-bold">Orders by Status</div>
                <div className="text-sm text-gray-600">Current order distribution</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    <linearGradient id="gradAck" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="gradProg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="gradCancel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Decorative outer ring */}
                  <Pie
                    data={[{ name: 'ring', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={118}
                    outerRadius={124}
                    paddingAngle={0}
                    dataKey="value"
                    isAnimationActive={false}
                    stroke="none"
                    fill="url(#ringGradient)"
                  />

                  {/* Main donut */}
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={112}
                    paddingAngle={4}
                    cornerRadius={10}
                    stroke="#ffffff"
                    strokeWidth={3}
                    dataKey="value"
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                    filter="url(#softShadow)"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#${entry.gradientId})`} />
                    ))}
                  </Pie>

                  {/* Center labels (always visible) */}
                  <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fill: '#0f172a', fontSize: '28px', fontWeight: 800, pointerEvents: 'none' }}
                  >
                    {totalOrdersCount}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fill: '#475569', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', pointerEvents: 'none' }}
                  >
                    TOTAL
                  </text>

                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    formatter={(value: number, name: string, props: any) => [value, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string, entry: any) => (
                      <span className="text-slate-700 font-medium">
                        {value} ({totalOrdersCount > 0 ? Math.round((entry.payload.value / totalOrdersCount) * 100) : 0}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
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

              {/* Cancellation Rate */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Cancellation Requests</span>
                  </div>
                  <Badge className="bg-red-600 text-white">
                    {stats.totalCancellations}
                  </Badge>
                </div>
                <div className="text-sm text-red-700">
                  Total cancellation requests received
                </div>
              </div>

              {/* Average Processing Time */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Processing Orders</span>
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {stats.inProgressOrders}
                  </Badge>
                </div>
                <div className="text-sm text-blue-700">
                  Currently being processed
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
                <div className="text-lg font-bold">Active Orders</div>
                <div className="text-sm text-gray-600">Currently processing</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.acknowledgedOrders + stats.inProgressOrders}
            </div>
            <div className="text-sm text-gray-600">
              Orders in the pipeline
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
              Orders successfully completed
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
                <div className="text-lg font-bold">Workflow</div>
                <div className="text-sm text-gray-600">Order processing flow</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.acknowledgedOrders + stats.inProgressOrders}
            </div>
            <div className="text-sm text-gray-600">
              Orders in active workflow
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
              <div className="text-xl font-bold">Order Summary</div>
              <div className="text-sm text-gray-600">Quick overview of order metrics</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCancellations}</div>
              <div className="text-sm text-gray-600">Cancellations</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.inProgressOrders}</div>
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
              <div className="text-xl font-bold">Recent Activity</div>
              <div className="text-sm text-gray-600">Latest orders created</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrdersList.length > 0 ? (
            <div className="space-y-4">
              {recentOrdersList.map((order, index) => {
                const OrderIcon = getOrderIcon(order.state);
                const productName = order.productOrderItem?.[0]?.productOffering?.name || 'Unknown Product';
                
                return (
                  <div key={order.id} className="relative group">
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <OrderIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{productName}</h4>
                        <p className="text-gray-600">Order #{order.id?.slice(0, 7) || 'Unknown'}...</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getOrderStateColor(order.state)} shadow-md`}>
                          {order.state?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'No date'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.orderDate ? new Date(order.orderDate).toLocaleTimeString() : 'No time'}
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
              <p className="text-gray-600 mb-6">No recent orders found. Create your first order to see activity here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}