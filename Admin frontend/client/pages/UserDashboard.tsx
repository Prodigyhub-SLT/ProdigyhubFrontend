import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { productCatalogApi } from '@/lib/api';
import { 
  Wifi, 
  Tv, 
  Phone, 
  Smartphone, 
  Megaphone,
  Plus,
  Cloud,
  Monitor,
  FileText,
  MessageCircle,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  Zap,
  Gift,
  Clock,
  History,
  Star,
  LogOut,
  Home,
  Package,
  Database,
  Award,
  Palette,
  MessageSquare,
  Search
} from 'lucide-react';

interface ServiceData {
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
}

interface DataUsage {
  type: string;
  used: string;
  total: string;
  percentage: number;
}

interface QuickLink {
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface ValueAddedService {
  name: string;
  icon: React.ReactNode;
  color: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeService, setActiveService] = useState('broadband');
  const [activeTab, setActiveTab] = useState('summary');
  
  // Packages tab state
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [connectionTypeFilter, setConnectionTypeFilter] = useState('all');
  const [usageTypeFilter, setUsageTypeFilter] = useState('all');

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Mock data for services
  const services: ServiceData[] = [
    { name: 'Broadband', icon: <Wifi className="w-6 h-6" />, isActive: true },
    { name: 'PEOTV', icon: <Tv className="w-6 h-6" />, isActive: false },
    { name: 'Voice', icon: <Phone className="w-6 h-6" />, isActive: false },
    { name: 'Mobile', icon: <Smartphone className="w-6 h-6" />, isActive: false },
    { name: 'Promotion', icon: <Megaphone className="w-6 h-6" />, isActive: false },
  ];

  // Mock data for broadband sub-services
  const broadbandSubServices = [
    { name: 'Summary', isActive: true },
    { name: 'Daily Usage', isActive: false },
    { name: 'Gift Data', isActive: false },
    { name: 'History', isActive: false },
    { name: 'Redeem Data', isActive: false },
    { name: 'Happy Day', isActive: false },
    { name: 'More', isActive: false, hasDropdown: true },
  ];

  // Mock data for data usage
  const dataUsage: DataUsage[] = [
    { type: 'My Package', used: '55.2', total: '87.1GB', percentage: 63 },
    { type: 'Extra GB', used: '0.4', total: '1.0GB', percentage: 40 },
    { type: 'Bonus Data', used: 'N/A', total: 'N/A', percentage: 0 },
    { type: 'Add-Ons Data', used: '40.5', total: '45.0GB', percentage: 90 },
    { type: 'Free Data', used: 'N/A', total: 'N/A', percentage: 0 },
  ];

  // Mock data for quick links
  const quickLinks: QuickLink[] = [
    { name: 'New Services', icon: <Plus className="w-5 h-5" />, color: 'bg-blue-500' },
    { name: 'Digital Life', icon: <Cloud className="w-5 h-5" />, color: 'bg-green-500' },
    { name: 'Hot Device', icon: <Monitor className="w-5 h-5" />, color: 'bg-purple-500' },
    { name: 'Bill', icon: <FileText className="w-5 h-5" />, color: 'bg-orange-500' },
    { name: 'Complaints', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-red-500' },
    { name: 'More', icon: <ChevronDown className="w-5 h-5" />, color: 'bg-gray-500' },
  ];

  // Mock data for value added services
  const valueAddedServices: ValueAddedService[] = [
    { name: 'Duthaya', icon: <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">D</div>, color: 'bg-blue-500' },
    { name: 'Kaspersky', icon: <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">🛡️</div>, color: 'bg-green-500' },
    { name: 'PEOTV GO', icon: <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">PEO</div>, color: 'bg-purple-500' },
    { name: 'SLT Kimaki', icon: <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">🥷</div>, color: 'bg-red-500' },
    { name: 'Storage', icon: <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">📦</div>, color: 'bg-blue-600' },
  ];

  // Tab configuration for second navigation bar
  const secondNavTabs = [
    { id: 'summary', name: 'Summary', icon: <Home className="w-4 h-4" /> },
    { id: 'packages', name: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'inventory', name: 'Inventory', icon: <Database className="w-4 h-4" /> },
    { id: 'qualification', name: 'Qualification', icon: <Award className="w-4 h-4" /> },
    { id: 'customize', name: 'Customize', icon: <Palette className="w-4 h-4" /> },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  // Load offerings when packages tab is active
  useEffect(() => {
    if (activeTab === 'packages') {
      loadOfferings();
    }
  }, [activeTab]);

  const loadOfferings = async () => {
    try {
      setLoadingOfferings(true);
      const offeringsData = await productCatalogApi.getOfferings({ limit: 100 });
      setOfferings(offeringsData);
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoadingOfferings(false);
    }
  };

  // Filter offerings based on search and filters
  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || offering.category === categoryFilter;
    const matchesConnectionType = connectionTypeFilter === 'all' || 
      offering.customAttributes?.some((attr: any) => 
        attr.name === 'Connection Type' && attr.value === connectionTypeFilter
      );
    const matchesUsageType = usageTypeFilter === 'all' || 
      offering.customAttributes?.some((attr: any) => 
        attr.name === 'Package Type' && attr.value === usageTypeFilter
      );
    
    return matchesSearch && matchesCategory && matchesConnectionType && matchesUsageType;
  });

  // Group offerings by category
  const groupedOfferings = filteredOfferings.reduce((groups: any, offering) => {
    const category = offering.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(offering);
    return groups;
  }, {});

  // Get category icon and color
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'broadband':
      case 'internet':
        return <Wifi className="w-4 h-4 text-orange-500" />;
      case 'peotv':
      case 'tv':
        return <Tv className="w-4 h-4 text-purple-500" />;
      case 'voice':
      case 'telephony':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'promotion':
        return <Gift className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get custom attribute value
  const getCustomAttributeValue = (offering: any, attributeName: string) => {
    if (!offering.customAttributes) return 'N/A';
    const attr = offering.customAttributes.find((a: any) => a.name === attributeName);
    return attr?.value || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SLT</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SLTMOBITEL</h1>
                  <p className="text-sm text-gray-600">The Connection</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">My SLT Portal</span>
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-gray-700 font-medium">0372298622</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Service Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-4">
            {services.map((service) => (
              <Button
                key={service.name}
                variant={service.isActive ? "default" : "outline"}
                className={`px-6 py-3 ${
                  service.isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveService(service.name.toLowerCase())}
              >
                {service.icon}
                <span className="ml-2">{service.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Second Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3">
            {secondNavTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`px-4 py-2 ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel - Package Information and Data Usage */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Package Details */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Package Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-semibold text-gray-800">ANY TRIO SHINE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-semibold text-gray-800">94372298622</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Package Upgrade
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Get Extra GB
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Get Data Add-ons
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Usage Cards */}
              <div className="space-y-4">
                {dataUsage.map((usage, index) => (
                  <Card key={index} className="bg-white shadow-lg border-0">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{usage.type}</span>
                        <span className="text-sm text-gray-500">
                          {usage.used} used from {usage.total}
                        </span>
                      </div>
                      {usage.percentage > 0 && (
                        <Progress value={usage.percentage} className="h-2" />
                      )}
                      {usage.percentage === 0 && (
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-gray-300 rounded-full w-1/3"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Central Panel - Usage Meter */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-gray-600">Your speed is</span>
                      <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">NORMAL</Badge>
                      <span className="text-gray-600">right now</span>
                    </div>
                    <p className="text-gray-600 text-sm">Any Time Usage.</p>
                  </div>

                  {/* Circular Progress Meter */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-blue-600"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.37)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-blue-600">37%</div>
                      <div className="text-sm text-gray-600">REMAINING</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-800">
                      55.2 GB USED OF 87.1 GB
                    </p>
                    <p className="text-sm text-gray-600">(Valid Till: 31-Aug)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Quick Links, Promotions, Billing, VAS */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Quick Links */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {quickLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className={`h-20 flex flex-col items-center justify-center space-y-2 ${link.color} text-white hover:opacity-80`}
                      >
                        {link.icon}
                        <span className="text-xs font-medium">{link.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Promotional Banner */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative p-6 text-white h-full flex flex-col justify-between">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2 text-yellow-300">
                          SPEED BASED UNLIMITED DATA
                        </h3>
                        <p className="text-lg">Play, Learn, Work, Entertainment</p>
                      </div>
                      <div className="text-center text-sm">
                        <p>SLT-MOBITEL FIBRE</p>
                        <p>SPEED BASED Unlimited Data plans</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Billing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Payable:</span>
                    <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">Rs 0.00</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Pay Now
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Bill History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Value Added Services */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Value Added Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {valueAddedServices.map((service, index) => (
                      <div key={index} className="text-center">
                        {service.icon}
                        <p className="text-xs text-gray-600 mt-2">{service.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Packages Tab Content */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Broadband Packages</h2>
              
              {/* Filter Bar */}
              <Card className="bg-white shadow-lg border-0 mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2 flex-1">
                      <Search className="w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Search offerings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Broadband">Broadband</SelectItem>
                        <SelectItem value="PEOTV">PEOTV</SelectItem>
                        <SelectItem value="Voice">Voice</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                        <SelectItem value="Promotion">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={connectionTypeFilter} onValueChange={setConnectionTypeFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Connection Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Connection Types</SelectItem>
                        <SelectItem value="Fiber">Fiber</SelectItem>
                        <SelectItem value="Copper">Copper</SelectItem>
                        <SelectItem value="Wireless">Wireless</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={usageTypeFilter} onValueChange={setUsageTypeFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Usage Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Usage Types</SelectItem>
                        <SelectItem value="Any Time">Any Time</SelectItem>
                        <SelectItem value="Night Time">Night Time</SelectItem>
                        <SelectItem value="Weekend">Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Offerings by Category */}
              {loadingOfferings ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading packages...</p>
                </div>
              ) : (
                Object.entries(groupedOfferings).map(([category, categoryOfferings]: [string, any]) => (
                  <div key={category} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      {getCategoryIcon(category)}
                      <h3 className="text-xl font-semibold text-gray-800">{category}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryOfferings.map((offering: any) => (
                        <Card key={offering.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <Badge className="bg-green-100 text-green-800" variant="outline">
                                ACTIVE
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                {getCategoryIcon(category)}
                                <span>{category}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-gray-800">{offering.name}</h3>
                              <p className="text-sm text-gray-600">{offering.description || 'No description available'}</p>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Specifications */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">Connection Type:</span>
                                <span className="text-gray-600">{getCustomAttributeValue(offering, 'Connection Type')}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">Package Type:</span>
                                <span className="text-gray-600">{getCustomAttributeValue(offering, 'Package Type')}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">Internet Speed:</span>
                                <span className="text-gray-600">{getCustomAttributeValue(offering, 'Internet Speed')}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">Data Allowance:</span>
                                <span className="text-gray-600">{getCustomAttributeValue(offering, 'Data Allowance')}</span>
                              </div>
                            </div>
                            
                            {/* Pricing */}
                            {offering.pricing && (
                              <div className="bg-blue-600 text-white rounded-lg p-4">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-bold">
                                    {offering.pricing.currency || 'LKR'} {(offering.pricing.amount || 0).toLocaleString()}
                                  </span>
                                  <span className="text-blue-100 text-sm">
                                    {offering.pricing.period || 'per month'}
                                  </span>
                                </div>
                                
                                {((offering.pricing.setupFee || 0) > 0 || (offering.pricing.deposit || 0) > 0) && (
                                  <div className="mt-2 text-right">
                                    {(offering.pricing.setupFee || 0) > 0 && (
                                      <div className="text-sm text-blue-100">
                                        Setup: {offering.pricing.currency || 'LKR'} {(offering.pricing.setupFee || 0).toLocaleString()}
                                      </div>
                                    )}
                                    {(offering.pricing.deposit || 0) > 0 && (
                                      <div className="text-sm text-blue-100">
                                        Security Deposit: {offering.pricing.currency || 'LKR'} {(offering.pricing.deposit || 0).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {filteredOfferings.length === 0 && !loadingOfferings && (
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || categoryFilter !== 'all' || connectionTypeFilter !== 'all' || usageTypeFilter !== 'all'
                        ? 'No packages match your current filters.'
                        : 'No packages are currently available.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Other tabs content can be added here */}
        {activeTab === 'inventory' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Inventory</CardTitle>
                <CardDescription className="text-gray-600">Inventory management features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {activeTab === 'qualification' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Qualification</CardTitle>
                <CardDescription className="text-gray-600">Qualification features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {activeTab === 'customize' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Customize</CardTitle>
                <CardDescription className="text-gray-600">Customization features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Messages</CardTitle>
                <CardDescription className="text-gray-600">Messaging features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
