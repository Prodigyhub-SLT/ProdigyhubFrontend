// components/QualificationOverviewTab.tsx - FUTURISTIC ENHANCED VERSION WITH ANIMATIONS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Wifi, 
  Router, 
  Plus,
  Activity,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Target,
  Layers,
  MapPin,
  Database,
  Globe,
  Smartphone
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

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
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

interface QualificationOverviewTabProps {
  stats: {
    totalQualifications: number;
    fiberAvailable: number;
    adslAvailable: number;
    bothAvailable: number;
    neitherAvailable: number;
    successRate: number;
    avgResponseTime: string;
  };
  qualifications: any[];
  connectionStatus: 'connected' | 'connecting' | 'offline';
  onCreateQualification: () => void;
}

const getStatusGradient = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'qualified': return 'from-emerald-400 to-emerald-600';
    case 'conditional': return 'from-amber-400 to-amber-600';
    case 'unqualified': return 'from-red-400 to-red-600';
    default: return 'from-slate-400 to-slate-600';
  }
};

const StatusProgressBar = ({ label, count, total, type }: { 
  label: string; 
  count: number; 
  total: number; 
  type: 'qualified' | 'conditional' | 'unqualified' | 'fiber' | 'adsl' | 'both' | 'neither';
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  const getColor = () => {
    switch (type) {
      case 'qualified': return 'from-emerald-400 to-emerald-600';
      case 'conditional': return 'from-amber-400 to-amber-600';
      case 'unqualified': return 'from-red-400 to-red-600';
      case 'fiber': return 'from-blue-400 to-blue-600';
      case 'adsl': return 'from-purple-400 to-purple-600';
      case 'both': return 'from-green-400 to-green-600';
      case 'neither': return 'from-gray-400 to-gray-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'qualified': return 'bg-emerald-500 text-white';
      case 'conditional': return 'bg-amber-500 text-white';
      case 'unqualified': return 'bg-red-500 text-white';
      case 'fiber': return 'bg-blue-500 text-white';
      case 'adsl': return 'bg-purple-500 text-white';
      case 'both': return 'bg-green-500 text-white';
      case 'neither': return 'bg-gray-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getColor()}`}></div>
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">{count}</span>
          <Badge className={getBadgeColor()} variant="outline">
            {percentage.toFixed(0)}%
          </Badge>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const InfrastructureChart = ({ stats }: { stats: any }) => {
  const data = [
    { 
      label: 'Fiber + ADSL', 
      count: stats.bothAvailable, 
      type: 'both' as const,
      color: 'from-emerald-500 to-green-600',
      icon: CheckCircle,
      description: 'Dual connectivity'
    },
    { 
      label: 'Fiber Only', 
      count: stats.fiberAvailable - stats.bothAvailable, 
      type: 'fiber' as const,
      color: 'from-blue-500 to-cyan-600',
      icon: Wifi,
      description: 'High-speed fiber'
    },
    { 
      label: 'ADSL Only', 
      count: stats.adslAvailable - stats.bothAvailable, 
      type: 'adsl' as const,
      color: 'from-purple-500 to-violet-600',
      icon: Router,
      description: 'Standard broadband'
    },
    { 
      label: 'Limited/None', 
      count: stats.neitherAvailable, 
      type: 'neither' as const,
      color: 'from-gray-500 to-slate-600',
      icon: XCircle,
      description: 'No coverage'
    }
  ];

  const maxCount = Math.max(...data.map(item => item.count));
  const total = stats.totalQualifications;

  return (
    <div className="space-y-6">
      {/* Glass-morphism Bar Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="glassGradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
              </linearGradient>
              <linearGradient id="glassGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
              </linearGradient>
              <filter id="glassShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.3)" />
            <XAxis 
              dataKey="label" 
              stroke="rgba(107, 114, 128, 0.8)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(107, 114, 128, 0.8)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(10px)'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} locations`, 
                props.payload.label
              ]}
            />
            
            <Bar 
              dataKey="count" 
              radius={[8, 8, 0, 0]}
              filter="url(#glassShadow)"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${index % 2 === 0 ? 'glassGradient1' : 'glassGradient2'})`}
                  stroke={`url(#${entry.color})`}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Infrastructure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, index) => {
          const Icon = item.icon;
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          
          return (
            <div 
              key={item.type} 
              className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm"></div>
              
              <div className="relative z-10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{item.label}</h4>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">{item.count}</div>
                    <div className="text-sm text-gray-600">{percentage > 0 ? `${percentage.toFixed(0)}%` : '0%'}</div>
                  </div>
                </div>
                
                {/* Animated progress bar */}
                <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ 
                      width: `${percentage}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const QualificationOverviewTab: React.FC<QualificationOverviewTabProps> = ({
  stats,
  qualifications,
  connectionStatus,
  onCreateQualification
}) => {
  // Calculate qualification status breakdown
  const qualificationStatusBreakdown = {
    qualified: qualifications.filter(q => q.qualificationResult === 'qualified').length,
    conditional: qualifications.filter(q => q.qualificationResult === 'conditional').length,
    unqualified: qualifications.filter(q => q.qualificationResult === 'unqualified').length,
  };

  // Get recent qualifications (last 3)
  const recentQualifications = [...qualifications]
    .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
    .slice(0, 3);

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
              <CardTitle className="text-2xl font-bold">Total Qualifications</CardTitle>
              <CardDescription className="text-blue-100">Stored in Database</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.totalQualifications}</div>
            <Button 
              onClick={onCreateQualification} 
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Qualification
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white border-0 shadow-2xl h-64">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Success Rate</CardTitle>
              <CardDescription className="text-green-100">Qualification Success</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.successRate.toFixed(1)}%</div>
            <div className="flex items-center gap-2 text-green-100">
              <Database className="w-4 h-4" />
              <span className="text-sm">
                Connection: {connectionStatus === 'connected' ? 'Connected' : 
                           connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
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
                <div className="text-xl font-bold">Qualifications by Result</div>
                <div className="text-sm text-gray-600">Qualification success analysis</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <StatusProgressBar 
                label="Qualified" 
                count={qualificationStatusBreakdown.qualified} 
                total={stats.totalQualifications} 
                type="qualified" 
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <StatusProgressBar 
                label="Conditional" 
                count={qualificationStatusBreakdown.conditional} 
                total={stats.totalQualifications} 
                type="conditional" 
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <StatusProgressBar 
                label="Unqualified" 
                count={qualificationStatusBreakdown.unqualified} 
                total={stats.totalQualifications} 
                type="unqualified" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Infrastructure Availability</div>
                <div className="text-sm text-gray-600">Network coverage breakdown</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfrastructureChart stats={stats} />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Coverage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-slideInLeft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Wifi className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">Fiber Coverage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-2">{stats.fiberAvailable}</div>
            <p className="text-sm text-blue-600">FTTH coverage areas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Router className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">ADSL Coverage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-2">{stats.adslAvailable}</div>
            <p className="text-sm text-purple-600">DSL service areas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-slideInRight">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">Dual Coverage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">{stats.bothAvailable}</div>
            <p className="text-sm text-green-600">Fiber + ADSL areas</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Activity */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Recent Qualifications</div>
              <div className="text-sm text-gray-600">Latest qualification checks</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentQualifications.length > 0 ? (
            <div className="space-y-4">
              {recentQualifications.map((qualification, index) => {
                const getResultIcon = (result: string) => {
                  switch (result?.toLowerCase()) {
                    case 'qualified': return CheckCircle;
                    case 'conditional': return AlertCircle;
                    case 'unqualified': return XCircle;
                    default: return AlertCircle;
                  }
                };

                const getResultColor = (result: string) => {
                  switch (result?.toLowerCase()) {
                    case 'qualified': return 'from-emerald-500 to-green-600';
                    case 'conditional': return 'from-amber-500 to-orange-600';
                    case 'unqualified': return 'from-red-500 to-pink-600';
                    default: return 'from-gray-500 to-slate-600';
                  }
                };

                const ResultIcon = getResultIcon(qualification.qualificationResult);
                
                return (
                  <div key={qualification.id} className="relative group">
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${getResultColor(qualification.qualificationResult)} rounded-xl text-white font-bold text-lg shadow-lg`}>
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{qualification.location?.address || 'Unknown Location'}</h4>
                        <p className="text-gray-600">{qualification.location?.district}, {qualification.location?.province}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {qualification.infrastructure?.fiber?.available && (
                            <Badge className="bg-blue-100 text-blue-800">Fiber</Badge>
                          )}
                          {qualification.infrastructure?.adsl?.available && (
                            <Badge className="bg-purple-100 text-purple-800">ADSL</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            {qualification.creationDate ? new Date(qualification.creationDate).toLocaleDateString() : '-'}
                          </div>
                          <Badge className={`${
                            qualification.qualificationResult === 'qualified' ? 'bg-emerald-500 text-white' :
                            qualification.qualificationResult === 'conditional' ? 'bg-amber-500 text-white' :
                            'bg-red-500 text-white'
                          } shadow-md`}>
                            {qualification.qualificationResult?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Recent Qualifications</h3>
              <p className="text-gray-600 mb-6">Create your first qualification check to see recent activity here.</p>
              <Button 
                onClick={onCreateQualification}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Qualification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};