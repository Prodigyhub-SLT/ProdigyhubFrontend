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
  Search,
  Filter,
  X
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

  // Enhanced offering data processing with safe operations
  const processOfferingData = (offering: any) => {
    try {
      // Extract common attributes that might be in different locations
      const connectionType = getCustomAttributeValue(offering, 'Connection Type');
      const packageType = getCustomAttributeValue(offering, 'Package Type');
      const internetSpeed = getCustomAttributeValue(offering, 'Internet Speed');
      const dataAllowance = getCustomAttributeValue(offering, 'Data Allowance');
      
      // Create a standardized offering object with safe operations
      return {
        ...offering,
        displayData: {
          connectionType,
          packageType,
          internetSpeed,
          dataAllowance,
          // Additional derived fields with safe operations
          isUnlimited: typeof dataAllowance === 'string' && dataAllowance.toLowerCase().includes('unlimited'),
          isFiber: typeof connectionType === 'string' && connectionType.toLowerCase().includes('fiber'),
          isHighSpeed: typeof internetSpeed === 'string' && !isNaN(parseInt(internetSpeed)) && parseInt(internetSpeed) > 100
        }
      };
    } catch (error) {
      console.error('Error processing offering data:', error);
      // Return safe fallback
      return {
        ...offering,
        displayData: {
          connectionType: 'Fiber',
          packageType: 'Any Time',
          internetSpeed: '300 Mbps',
          dataAllowance: 'Unlimited',
          isUnlimited: false,
          isFiber: true,
          isHighSpeed: false
        }
      };
    }
  };

  // Process offerings to add display data with safety check
  const processedOfferings = Array.isArray(offerings) ? offerings.map(processOfferingData) : [];

  // Filter offerings based on search and filters with safety checks
  const filteredOfferings = processedOfferings.filter(offering => {
    try {
      if (!offering || !offering.displayData) {
        return false;
      }
      
      // Search filter
      const matchesSearch = searchTerm === '' || 
                           offering.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           offering.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Connection Type filter (subSubCategory)
      const matchesConnectionType = connectionTypeFilter === 'all' || 
        offering.subSubCategory === connectionTypeFilter ||
        offering.subCategory === connectionTypeFilter ||
        offering.category === connectionTypeFilter;
      
      // Package Type filter (technology type)
      const matchesPackageType = categoryFilter === 'all' || 
        offering.displayData.connectionType === categoryFilter ||
        offering.packageType === categoryFilter;
      
      // Usage Type filter
      const matchesUsageType = usageTypeFilter === 'all' || 
        offering.displayData.packageType === usageTypeFilter ||
        offering.packageUsageType === usageTypeFilter;
      
      return matchesSearch && matchesConnectionType && matchesPackageType && matchesUsageType;
    } catch (error) {
      console.error('Error filtering offering:', error);
      return false;
    }
  });

  // Group offerings by Connection Type (subSubCategory) like PublicOfferings
  const groupedOfferings = filteredOfferings.reduce((groups: any, offering) => {
    try {
      if (!offering) {
        return groups;
      }
      
      // Get the Connection Type (subSubCategory) which represents the main grouping
      let groupKey = 'Other';
      
      if (offering.subSubCategory) {
        groupKey = offering.subSubCategory;
      } else if (offering.subCategory) {
        groupKey = offering.subCategory;
      } else if (offering.category) {
        groupKey = offering.category;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(offering);
      return groups;
    } catch (error) {
      console.error('Error grouping offering:', error);
      return groups;
    }
  }, {});

  // Sort categories in logical order (like PublicOfferings)
  const sortedGroupedOfferings = Object.entries(groupedOfferings).sort(([a], [b]) => {
    // Define priority order for categories
    const categoryOrder = [
      'Data/PEOTV & Voice Packages',
      'Data Packages',
      'Data & Voice',
      'Broadband',
      'PEOTV',
      'Voice',
      'Mobile',
      'Promotion'
    ];
    
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    // If both categories are in the order array, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // If neither is in the order array, maintain alphabetical order
    return a.localeCompare(b);
  });

  // Get category icon and color for subSubCategory grouping
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    // Handle subSubCategory patterns like "Data/PEOTV & Voice Packages"
    if (categoryLower.includes('data') && categoryLower.includes('peotv')) {
      return <Wifi className="w-4 h-4 text-orange-500" />;
    }
    if (categoryLower.includes('data') && categoryLower.includes('voice')) {
      return <Phone className="w-4 h-4 text-green-500" />;
    }
    if (categoryLower.includes('data packages')) {
      return <Wifi className="w-4 h-4 text-blue-500" />;
    }
    if (categoryLower.includes('peotv')) {
      return <Tv className="w-4 h-4 text-purple-500" />;
    }
    if (categoryLower.includes('voice')) {
      return <Phone className="w-4 h-4 text-green-500" />;
    }
    if (categoryLower.includes('mobile')) {
      return <Smartphone className="w-4 h-4 text-blue-500" />;
    }
    if (categoryLower.includes('promotion')) {
      return <Gift className="w-4 h-4 text-red-500" />;
    }
    if (categoryLower.includes('broadband') || categoryLower.includes('internet')) {
      return <Wifi className="w-4 h-4 text-orange-500" />;
    }
    
    // Default fallback
    return <Package className="w-4 h-4 text-gray-500" />;
  };

  // Get custom attribute value with better fallbacks and error handling
  const getCustomAttributeValue = (offering: any, attributeName: string) => {
    try {
      if (!offering || typeof offering !== 'object') {
        return 'N/A';
      }

      if (!offering.customAttributes || !Array.isArray(offering.customAttributes)) {
        // Provide intelligent fallbacks based on offering data
        switch (attributeName) {
          case 'Connection Type':
            return offering.connectionType || 'Fiber'; // Default to Fiber for most offerings
          case 'Package Type':
            return offering.packageType || 'Any Time'; // Default to Any Time
          case 'Internet Speed':
            return offering.internetSpeed || '300 Mbps'; // Default to common speed
          case 'Data Allowance':
            return offering.dataAllowance || 'Unlimited'; // Default to Unlimited
          default:
            return 'N/A';
        }
      }
      
      const attr = offering.customAttributes.find((a: any) => a && a.name === attributeName);
      if (attr && attr.value) {
        return attr.value;
      }
      
      // Provide intelligent fallbacks if custom attribute exists but has no value
      switch (attributeName) {
        case 'Connection Type':
          return offering.connectionType || 'Fiber';
        case 'Package Type':
          return offering.packageType || 'Any Time';
        case 'Internet Speed':
          return offering.internetSpeed || '300 Mbps';
        case 'Data Allowance':
          return offering.dataAllowance || 'Unlimited';
        default:
          return 'N/A';
      }
    } catch (error) {
      console.error(`Error getting custom attribute value for ${attributeName}:`, error);
      // Return safe fallback values
      switch (attributeName) {
        case 'Connection Type':
          return 'Fiber';
        case 'Package Type':
          return 'Any Time';
        case 'Internet Speed':
          return '300 Mbps';
        case 'Data Allowance':
          return 'Unlimited';
        default:
          return 'N/A';
      }
    }
  };

  // Safe string operations helper
  const safeStringOperation = (str: any, operation: (s: string) => boolean, fallback: boolean) => {
    try {
      if (typeof str === 'string' && str.trim()) {
        return operation(str);
      }
      return fallback;
    } catch (error) {
      console.error('Error in string operation:', error);
      return fallback;
    }
  };

  // Safe integer parsing helper
  const safeParseInt = (str: any, fallback: number) => {
    try {
      if (typeof str === 'string') {
        const parsed = parseInt(str);
        return isNaN(parsed) ? fallback : parsed;
      }
      return fallback;
    } catch (error) {
      console.error('Error parsing integer:', error);
      return fallback;
    }
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
              
              {/* Filter Bar - Matching PublicOfferings Design */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-medium text-gray-700">Filter By:</span>
                  
                  {/* Connection Type Filter (subSubCategory) */}
                  <Select 
                    value={connectionTypeFilter} 
                    onValueChange={setConnectionTypeFilter}
                  >
                    <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                      <SelectValue placeholder="All Connection Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Connection Types</SelectItem>
                      <SelectItem value="Data/PEOTV & Voice Packages">Data/PEOTV & Voice Packages</SelectItem>
                      <SelectItem value="Data Packages">Data Packages</SelectItem>
                      <SelectItem value="Data & Voice">Data & Voice</SelectItem>
                      <SelectItem value="Broadband">Broadband</SelectItem>
                      <SelectItem value="PEOTV">PEOTV</SelectItem>
                      <SelectItem value="Voice">Voice</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Package Usage Type Filter */}
                  <Select 
                    value={usageTypeFilter} 
                    onValueChange={setUsageTypeFilter}
                  >
                    <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                      <SelectValue placeholder="All Usage Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Usage Types</SelectItem>
                      <SelectItem value="Any Time">Any Time</SelectItem>
                      <SelectItem value="Time Based">Time Based</SelectItem>
                      <SelectItem value="Unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Package Type Filter */}
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                      <SelectValue placeholder="All Package Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Package Types</SelectItem>
                      <SelectItem value="4G">4G</SelectItem>
                      <SelectItem value="ADSL">ADSL</SelectItem>
                      <SelectItem value="Fiber">Fiber</SelectItem>
                      <SelectItem value="Copper">Copper</SelectItem>
                      <SelectItem value="Wireless">Wireless</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Data Bundle Filter */}
                  <Select 
                    value={searchTerm} 
                    onValueChange={(value) => setSearchTerm(value)}
                  >
                    <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                      <SelectValue placeholder="All Data Bundles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Data Bundles</SelectItem>
                      <SelectItem value="40GB">40GB</SelectItem>
                      <SelectItem value="50GB">50GB</SelectItem>
                      <SelectItem value="85GB">85GB</SelectItem>
                      <SelectItem value="100GB">100GB</SelectItem>
                      <SelectItem value="115GB">115GB</SelectItem>
                      <SelectItem value="200GB">200GB</SelectItem>
                      <SelectItem value="400GB">400GB</SelectItem>
                      <SelectItem value="Unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search Input */}
                  <div className="flex items-center space-x-2 flex-1">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search offerings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 max-w-xs"
                    />
                  </div>

                  {/* Reset Button */}
                  {(connectionTypeFilter !== 'all' || usageTypeFilter !== 'all' || 
                    categoryFilter !== 'all' || searchTerm !== '') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConnectionTypeFilter('all');
                        setUsageTypeFilter('all');
                        setCategoryFilter('all');
                        setSearchTerm('');
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Offerings by Category */}
              {loadingOfferings ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading packages...</p>
                </div>
              ) : (
                sortedGroupedOfferings.map(([category, categoryOfferings]: [string, any]) => (
                  <div key={category} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Filter className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        {category === 'Data/PEOTV & Voice Packages' ? 'Data/PEOTV & Voice Packages' :
                         category === 'Data Packages' ? 'Data Packages' :
                         category === 'Data & Voice' ? 'Data & Voice' :
                         category}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.isArray(categoryOfferings) && categoryOfferings.map((offering: any) => {
                        // Skip invalid offerings
                        if (!offering || !offering.id) {
                          return null;
                        }
                        
                        return (
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
                              <p className="text-sm text-gray-600">
                                {offering.description || 
                                 `${getCustomAttributeValue(offering, 'Data Allowance')} data with ${getCustomAttributeValue(offering, 'Internet Speed')} speed`}
                              </p>
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
                            
                            {/* Package Highlights */}
                            <div className="flex flex-wrap gap-2">
                              {safeStringOperation(
                                getCustomAttributeValue(offering, 'Data Allowance'),
                                (str) => str.toLowerCase().includes('unlimited'),
                                false
                              ) && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Unlimited Data</Badge>
                              )}
                              {safeStringOperation(
                                getCustomAttributeValue(offering, 'Connection Type'),
                                (str) => str.toLowerCase().includes('fiber'),
                                false
                              ) && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">Fiber Optic</Badge>
                              )}
                              {safeParseInt(
                                getCustomAttributeValue(offering, 'Internet Speed'),
                                0
                              ) > 100 && (
                                <Badge className="bg-purple-100 text-purple-800 text-xs">High Speed</Badge>
                              )}
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
                      );
                      })}
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
