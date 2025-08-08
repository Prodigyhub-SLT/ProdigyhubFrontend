import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Wifi, 
  Smartphone, 
  Globe, 
  Building, 
  Plus,
  Activity,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Target,
  Layers,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Server,
  WifiOff,
  Package,
  FileText,
  MapPin,
  Router,
  Database,
  Users,
  Sliders,
  Monitor,
  Cloud
} from "lucide-react";

// Inject animation styles
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

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
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

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
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

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-bounceIn {
    animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  }

  .gradient-animate {
    background-size: 200% 200%;
    animation: gradientShift 4s ease infinite;
  }

  .hover-lift {
    transition: all 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('configuration-overview-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'configuration-overview-styles';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// Progress Bar Component
const ProgressBar: React.FC<{ 
  label: string; 
  count: number; 
  total: number; 
  color: string; 
  delay?: number 
}> = ({ label, count, total, color, delay = 0 }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);
  
  return (
    <div className="animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{count}</span>
          <Badge variant="outline">{percentage.toFixed(0)}%</Badge>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full transition-all duration-1500 ease-out rounded-full"
          style={{ 
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}dd, ${color})`
          }}
        />
      </div>
    </div>
  );
};

interface ConfigurationOverviewTabProps {
  stats: {
    totalConfigurations: number;
    broadbandConfigs: number;
    mobileConfigs: number;
    businessConfigs: number;
    cloudConfigs: number;
    activeConfigs: number;
    completedConfigs: number;
    avgConfigTime: string;
  };
  configurations: any[];
  connectionStatus: 'connected' | 'connecting' | 'offline';
  onCreateConfiguration: () => void;
}

export function QualificationOverviewTab({ 
  stats, 
  configurations, 
  connectionStatus, 
  onCreateConfiguration 
}: ConfigurationOverviewTabProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
    window.location.reload();
  };

  // Calculate configuration type distribution
  const configTypeDistribution = {
    broadband: stats.broadbandConfigs || 0,
    mobile: stats.mobileConfigs || 0,
    business: stats.businessConfigs || 0,
    cloud: stats.cloudConfigs || 0
  };

  // Calculate service distribution
  const serviceDistribution = configurations.reduce((acc: Record<string, number>, config: any) => {
    const serviceType = config.category || config.productType || 'Other';
    acc[serviceType] = (acc[serviceType] || 0) + 1;
    return acc;
  }, {});

  // Create typed arrays for rendering
  const serviceEntries: Array<[string, number]> = Object.keys(serviceDistribution).map(key => [key, serviceDistribution[key]]);

  // Recent configurations
  const recentConfigurations = configurations
    .slice(0, 3)
    .map((config, index) => ({
      ...config,
      displayIndex: index + 1
    }));

  const totalConfigValue = configurations.reduce((sum, config) => {
    return sum + (config.pricing?.monthlyFee || 0);
  }, 0);

  const avgConfigValue = configurations.length > 0 ? Math.round(totalConfigValue / configurations.length) : 0;

  return (
    <div className="space-y-6">

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white border-0 hover-lift gradient-animate h-64">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Product Configuration</CardTitle>
              <CardDescription className="text-blue-100">
                Complete product setup and customization
              </CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sliders className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-bold mb-6">{stats.totalConfigurations}</div>
            <Button 
              onClick={onCreateConfiguration} 
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Configure New Product
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white border-0 hover-lift gradient-animate h-64">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Configuration Value</CardTitle>
              <CardDescription className="text-green-100">Average: LKR {avgConfigValue.toLocaleString()}</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">LKR {totalConfigValue.toLocaleString()}</div>
            <div className="flex gap-4 text-sm">
              <div>
                <div className="text-green-100">Active Configs</div>
                <div className="text-xl font-bold">{stats.activeConfigs}</div>
              </div>
              <div>
                <div className="text-green-100">Completed</div>
                <div className="text-xl font-bold">{stats.completedConfigs}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Configuration by Category</div>
                <div className="text-sm text-gray-600">Service type breakdown</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar
                label="Broadband"
                count={configTypeDistribution.broadband}
                total={stats.totalConfigurations}
                color="#3b82f6"
                delay={100}
              />
              <ProgressBar
                label="Mobile"
                count={configTypeDistribution.mobile}
                total={stats.totalConfigurations}
                color="#10b981"
                delay={200}
              />
              <ProgressBar
                label="Business"
                count={configTypeDistribution.business}
                total={stats.totalConfigurations}
                color="#8b5cf6"
                delay={300}
              />
              <ProgressBar
                label="Cloud Services"
                count={configTypeDistribution.cloud}
                total={stats.totalConfigurations}
                color="#f59e0b"
                delay={400}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Available Products</div>
                <div className="text-sm text-gray-600">Customizable product options</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Broadband</span>
                </div>
                <div className="text-xs text-blue-600">
                  Fiber, ADSL, Speed tiers, Entertainment add-ons
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Mobile</span>
                </div>
                <div className="text-xs text-green-600">
                  Data plans, Voice, SMS, Roaming options
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Business</span>
                </div>
                <div className="text-xs text-purple-600">
                  SME, Enterprise, Dedicated support
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Cloud</span>
                </div>
                <div className="text-xs text-orange-600">
                  Storage, Computing, Hosting, Backup
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentConfigurations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-0 shadow-xl hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center animate-pulse">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Recent Configurations</div>
                <div className="text-sm text-gray-600">Latest product customizations</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConfigurations.map((config) => (
                <div key={config.id} className="relative group">
                  <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover-lift">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg">
                      {config.displayIndex}
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">{config.productName || config.name || 'Product Configuration'}</h4>
                      <div className="text-sm text-gray-600">
                        {config.category || config.productType || 'SLT Service'} • 
                        {config.pricing ? ` LKR ${config.pricing.monthlyFee}` : ' Custom pricing'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <Badge className="bg-blue-100 text-blue-800">
                          {config.connectionType || config.serviceType || 'Standard'}
                        </Badge>
                        {config.packageType && (
                          <Badge className="bg-green-100 text-green-800">
                            {config.packageType}
                          </Badge>
                        )}
                      </div>
                      <Badge className="bg-emerald-500 text-white shadow-md">
                        {config.status?.toUpperCase() || 'CONFIGURED'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleRefresh} variant="outline" className="hover-lift">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
        <Button onClick={onCreateConfiguration} className="hover-lift">
          <Plus className="w-4 h-4 mr-2" />
          Create New Configuration
        </Button>
      </div>
    </div>
  );
}