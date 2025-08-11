// components/OverviewTab.tsx - FUTURISTIC ENHANCED VERSION WITH ANIMATIONS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  BookOpen, 
  Plus,
  Activity,
  TrendingUp,
  PieChart,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Zap,
  Target,
  Layers,
  DollarSign,
  Calendar,
  Tag
} from "lucide-react";
import { CategoryIcons, CATEGORIES } from "./CategoryConfig";
import { MongoProductOffering } from "../hooks/useMongoOfferingsLogic";
import { MongoProductSpec } from "../hooks/useMongoSpecsLogic";

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

interface OverviewTabProps {
  stats: any;
  categories: any[];
  specs: MongoProductSpec[];
  mongoOfferings: MongoProductOffering[];
  prices: any[];
  openCreateDialog: (type: 'category' | 'spec' | 'offering' | 'price') => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-emerald-500 text-white';
    case 'draft': return 'bg-amber-500 text-white';
    case 'retired': return 'bg-slate-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
};

const getStatusGradient = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'from-emerald-400 to-emerald-600';
    case 'draft': return 'from-amber-400 to-amber-600';
    case 'retired': return 'from-slate-400 to-slate-600';
    default: return 'from-slate-400 to-slate-600';
  }
};

const StatusProgressBar = ({ label, count, total, status }: { label: string; count: number; total: number; status: string }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusGradient(status)}`}></div>
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

const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

const CategoryChart = ({ data, type }: { data: Record<string, number>; type: 'offerings' | 'specs' }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div className="space-y-4">
      {CATEGORIES.map((category, index) => {
        const count = data[category.value] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const CategoryIcon = CategoryIcons[category.value]?.icon || Package;
        const color = colors[index % colors.length];
        
        return (
          <div 
            key={category.value} 
            className="group animate-fadeInUp hover:scale-[1.02] transition-transform duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: color }}
                />
                <CategoryIcon className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium text-gray-700">{category.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 animate-bounceIn" style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
                  {count}
                </span>
                <Badge variant="outline" className="bg-white animate-fadeInUp" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                  {percentage > 0 ? `${percentage.toFixed(0)}%` : '0%'}
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full transition-all duration-1500 ease-out rounded-full"
                style={{ 
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${color}dd, ${color})`,
                  animationDelay: `${index * 0.2}s`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  categories,
  specs,
  mongoOfferings,
  prices,
  openCreateDialog
}) => {
  // Calculate offering status breakdown
  const offeringStatusBreakdown = {
    active: mongoOfferings.filter(o => o.lifecycleStatus === 'Active').length,
    draft: mongoOfferings.filter(o => o.lifecycleStatus === 'Draft').length,
    retired: mongoOfferings.filter(o => o.lifecycleStatus === 'Retired').length,
  };

  // Calculate spec status breakdown
  const specStatusBreakdown = {
    active: specs.filter(s => s.lifecycleStatus === 'Active').length,
    draft: specs.filter(s => s.lifecycleStatus === 'Draft').length,
    retired: specs.filter(s => s.lifecycleStatus === 'Retired').length,
  };

  // Calculate offering category breakdown
  const offeringCategoryBreakdown = CATEGORIES.reduce((acc, category) => {
    acc[category.value] = mongoOfferings.filter(o => o.category === category.value).length;
    return acc;
  }, {} as Record<string, number>);

  // Calculate spec category breakdown
  const specCategoryBreakdown = CATEGORIES.reduce((acc, category) => {
    acc[category.value] = specs.filter(s => s.category === category.value).length;
    return acc;
  }, {} as Record<string, number>);

  // Get recent offerings (last 3)
  const recentOfferings = [...mongoOfferings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Calculate completion percentage
  const totalItems = mongoOfferings.length + specs.length;
  const activeItems = offeringStatusBreakdown.active + specStatusBreakdown.active;
  const completionPercentage = totalItems > 0 ? (activeItems / totalItems) * 100 : 0;

  // Calculate pricing statistics
  const pricedOfferings = mongoOfferings.filter(o => o.pricing && o.pricing.amount);
  const totalPricingValue = pricedOfferings.reduce((total, offering) => {
    return total + (offering.pricing?.amount || 0);
  }, 0);
  const averagePricingValue = pricedOfferings.length > 0 ? totalPricingValue / pricedOfferings.length : 0;
  const recurringOfferings = pricedOfferings.filter(o => o.pricing?.period !== 'one-time');
  const oneTimeOfferings = pricedOfferings.filter(o => o.pricing?.period === 'one-time');

  return (
    <div className="space-y-8">
      {/* Futuristic Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white border-0 shadow-2xl h-64">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Product Offerings</CardTitle>
              <CardDescription className="text-blue-100">Total: {mongoOfferings.length} offerings</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Package className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{mongoOfferings.length}</div>
            <Button 
              onClick={() => openCreateDialog('offering')} 
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Offering
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white border-0 shadow-2xl h-64">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Product Specifications</CardTitle>
              <CardDescription className="text-green-100">Total: {specs.length} specifications</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{specs.length}</div>
            <Button 
              onClick={() => openCreateDialog('spec')} 
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Specification
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-700 text-white border-0 shadow-2xl h-64">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Product Prices</CardTitle>
              <CardDescription className="text-purple-100">Total: {mongoOfferings.filter(o => o.pricing).length} offers with pricing</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
                         <div className="text-4xl font-bold mb-6">
               LKR {totalPricingValue.toLocaleString()}
             </div>
             <div className="text-sm text-purple-100 mb-4">
               Total Value from {pricedOfferings.length} priced offers
             </div>
             <div className="grid grid-cols-2 gap-2 text-xs text-purple-100">
               <div>
                 <div className="font-semibold">Recurring</div>
                 <div>{recurringOfferings.length} offers</div>
               </div>
               <div>
                 <div className="font-semibold">One-time</div>
                 <div>{oneTimeOfferings.length} offers</div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Overview Section */}
      {pricedOfferings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Average Price</div>
                  <div className="text-sm text-gray-600">Per offering</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                LKR {averagePricingValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Based on {pricedOfferings.length} offers
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Recurring Offers</div>
                  <div className="text-sm text-gray-600">Monthly/Yearly</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {recurringOfferings.length}
              </div>
              <div className="text-sm text-gray-600">
                {recurringOfferings.length > 0 ? 
                  `LKR ${recurringOfferings.reduce((total, o) => total + (o.pricing?.amount || 0), 0).toLocaleString()} total` : 
                  'No recurring offers'
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">One-time Offers</div>
                  <div className="text-sm text-gray-600">Setup fees</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {oneTimeOfferings.length}
              </div>
              <div className="text-sm text-gray-600">
                {oneTimeOfferings.length > 0 ? 
                  `LKR ${oneTimeOfferings.reduce((total, o) => total + (o.pricing?.amount || 0), 0).toLocaleString()} total` : 
                  'No one-time offers'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Status Breakdown with Animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Offerings by Status</div>
                <div className="text-sm text-gray-600">Lifecycle distribution analysis</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <StatusProgressBar 
                label="Active" 
                count={offeringStatusBreakdown.active} 
                total={mongoOfferings.length} 
                status="active" 
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <StatusProgressBar 
                label="Draft" 
                count={offeringStatusBreakdown.draft} 
                total={mongoOfferings.length} 
                status="draft" 
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <StatusProgressBar 
                label="Retired" 
                count={offeringStatusBreakdown.retired} 
                total={mongoOfferings.length} 
                status="retired" 
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
                <div className="text-xl font-bold">Specifications by Status</div>
                <div className="text-sm text-gray-600">Lifecycle distribution analysis</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <StatusProgressBar 
                label="Active" 
                count={specStatusBreakdown.active} 
                total={specs.length} 
                status="active" 
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <StatusProgressBar 
                label="Draft" 
                count={specStatusBreakdown.draft} 
                total={specs.length} 
                status="draft" 
              />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <StatusProgressBar 
                label="Retired" 
                count={specStatusBreakdown.retired} 
                total={specs.length} 
                status="retired" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Category Charts with Stagger Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group animate-slideInLeft">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Offerings by Category</div>
                <div className="text-sm text-gray-600">Category distribution breakdown</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={offeringCategoryBreakdown} type="offerings" />
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group animate-slideInRight">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Specifications by Category</div>
                <div className="text-sm text-gray-600">Category distribution breakdown</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={specCategoryBreakdown} type="specs" />
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
              <div className="text-xl font-bold">Recent Activity</div>
              <div className="text-sm text-gray-600">Latest offerings created</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOfferings.length > 0 ? (
            <div className="space-y-4">
              {recentOfferings.map((offering, index) => {
                const CategoryIcon = CategoryIcons[offering.category]?.icon || Package;
                
                return (
                  <div key={offering.id} className="relative group">
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <CategoryIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{offering.name}</h4>
                        <p className="text-gray-600">{offering.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(offering.lifecycleStatus)} shadow-md`}>
                          {offering.lifecycleStatus?.toUpperCase()}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            {new Date(offering.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(offering.createdAt).toLocaleTimeString()}
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
              <p className="text-gray-600 mb-6">Create your first offering to see recent activity here.</p>
              <Button 
                onClick={() => openCreateDialog('offering')}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Offering
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};