import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, Activity, Users, Server, CheckCircle, TrendingUp, 
  ShoppingCart, Package, AlertTriangle, Zap, Globe, BarChart3,
  ArrowUpRight, ArrowDownRight, Eye, Clock, DollarSign
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ModernEnhancedDashboard() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // Mock data for charts
  const performanceData = [
    { name: 'Jan', requests: 65000, users: 180, revenue: 45000 },
    { name: 'Feb', requests: 72000, users: 220, revenue: 52000 },
    { name: 'Mar', requests: 68000, users: 195, revenue: 48000 },
    { name: 'Apr', requests: 85000, users: 280, revenue: 62000 },
    { name: 'May', requests: 91000, users: 320, revenue: 71000 },
    { name: 'Jun', requests: 87000, users: 295, revenue: 68000 },
  ];

  const orderStatusData = [
    { name: 'Completed', value: 1247, color: '#10b981' },
    { name: 'In Progress', value: 432, color: '#8b5cf6' },
    { name: 'Pending', value: 189, color: '#f59e0b' },
    { name: 'Failed', value: 45, color: '#ef4444' },
  ];

  const productCategoryData = [
    { name: 'Broadband', orders: 450, revenue: 28500 },
    { name: 'Mobile', orders: 380, revenue: 22800 },
    { name: 'Cloud Services', orders: 280, revenue: 35600 },
    { name: 'IoT Solutions', orders: 150, revenue: 18900 },
    { name: 'Enterprise', orders: 120, revenue: 24000 },
  ];

  const realtimeMetrics = [
    { metric: 'Active Sessions', value: '2,847', change: '+12%', trend: 'up' },
    { metric: 'Response Time', value: '120ms', change: '-8%', trend: 'down' },
    { metric: 'Error Rate', value: '0.3%', change: '-45%', trend: 'down' },
    { metric: 'Throughput', value: '1.2k/s', change: '+18%', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl opacity-90"></div>
          <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  ProdigyHub Analytics
                </h1>
                <p className="text-blue-100 text-lg">Real-time system monitoring & business intelligence</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm">Live Data</span>
                  </div>
                  <div className="text-white/80 text-sm">Last updated: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handleRefresh} 
                  disabled={loading}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
          {['overview', 'analytics', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Revenue', value: '$487.2K', icon: DollarSign, change: '+23.4%', color: 'from-green-500 to-emerald-600' },
                { title: 'Active Orders', value: '2,847', icon: ShoppingCart, change: '+12.8%', color: 'from-blue-500 to-cyan-600' },
                { title: 'System Health', value: '99.9%', icon: CheckCircle, change: '+0.1%', color: 'from-purple-500 to-violet-600' },
                { title: 'Response Time', value: '120ms', icon: Zap, change: '-8.2%', color: 'from-orange-500 to-red-500' },
              ].map((metric, index) => (
                <Card key={index} className="relative overflow-hidden bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${metric.color}`}>
                        <metric.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        {metric.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Performance Trend */}
              <Card className="lg:col-span-2 bg-white/70 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }} 
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRequests)"
                        name="Requests"
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        name="Active Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Order Status Pie Chart */}
              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Metrics */}
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-600" />
                  Real-time System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {realtimeMetrics.map((item, index) => (
                    <div key={index} className="text-center p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                      <div className="text-sm text-gray-600 mb-2">{item.metric}</div>
                      <div className={`flex items-center justify-center gap-1 text-sm ${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {item.change}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Category Performance */}
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Product Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={productCategoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Revenue Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#10b981' }}
                      name="Revenue ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-600" />
                  System Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'CPU Usage', value: 45, color: 'blue' },
                    { label: 'Memory Usage', value: 68, color: 'purple' },
                    { label: 'Disk Usage', value: 32, color: 'green' },
                  ].map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-semibold text-gray-700 mb-2">{metric.label}</div>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${(metric.value / 100) * 351.86} 351.86`}
                            className={`${
                              metric.color === 'blue' ? 'text-blue-500' :
                              metric.color === 'purple' ? 'text-purple-500' :
                              'text-green-500'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">{metric.value}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#3b82f6' }}
                      name="API Requests"
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#8b5cf6' }}
                      name="Concurrent Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Status */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <div className="font-semibold">System Status: All Services Operational</div>
                  <div className="text-green-100 text-sm">ProdigyHub is running smoothly with optimal performance</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">99.97%</div>
                <div className="text-green-100 text-sm">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}