import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  UserPlus, 
  Building, 
  ArrowRight, 
  LogOut,
  Home,
  Settings,
  Bell,
  Package,
  Database,
  Award,
  Palette,
  MessageSquare,
  Search,
  Wifi,
  Tv,
  Phone,
  Smartphone,
  Gift
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { productCatalogApi } from '@/lib/api';

export default function CustomerSelectionDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Packages tab state
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [connectionTypeFilter, setConnectionTypeFilter] = useState('all');
  const [usageTypeFilter, setUsageTypeFilter] = useState('all');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOptionSelect = (option: 'existing' | 'new') => {
    setSelectedOption(option);
    console.log(`User selected: ${option} customer option`);
  };

  const handleContinue = () => {
    if (selectedOption === 'existing') {
      // Navigate to existing customer flow - for now go to user dashboard
      console.log('Navigating to existing customer flow');
      navigate('/user');
    } else if (selectedOption === 'new') {
      // Navigate to new customer flow
      console.log('Navigating to new customer flow');
      navigate('/new-customer');
    }
  };

  // Tab configuration with icons
  const tabs = [
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="text-white">
                <div className="text-xl font-bold">SLTMOBITEL</div>
                <div className="text-sm text-blue-200">The Connection</div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Second Navigation Bar */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 py-3">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`px-4 py-2 ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
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
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="text-blue-200 text-lg">
            Let's get you started with SLT services
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' && (
          <div className="max-w-4xl mx-auto">
            {/* Customer Type Selection */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                  Are you an existing SLT Customer?
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Please select the option that best describes your situation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Option Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Existing Customer Option */}
                  <Card 
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedOption === 'existing' 
                        ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/25' 
                        : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                    }`}
                    onClick={() => handleOptionSelect('existing')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Existing Customer
                      </h3>
                      <p className="text-blue-100 text-sm">
                        I already have SLT services and want to manage my account
                      </p>
                      {selectedOption === 'existing' && (
                        <Badge className="mt-3 bg-green-500 text-white">
                          Selected
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* New Customer Option */}
                  <Card 
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedOption === 'new' 
                        ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/25' 
                        : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                    }`}
                    onClick={() => handleOptionSelect('new')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        New Customer
                      </h3>
                      <p className="text-blue-100 text-sm">
                        I'm new to SLT and want to explore available services
                      </p>
                      {selectedOption === 'new' && (
                        <Badge className="mt-3 bg-green-500 text-white">
                          Selected
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Continue Button */}
                {selectedOption && (
                  <div className="text-center pt-4">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
                      onClick={handleContinue}
                    >
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Packages Tab Content */}
        {activeTab === 'packages' && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Broadband Packages</h2>
              
              {/* Filter Bar */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2 flex-1">
                      <Search className="w-4 h-4 text-white" />
                      <Input
                        placeholder="Search offerings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-40 bg-white/20 border-white/30 text-white">
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
                      <SelectTrigger className="w-full sm:w-40 bg-white/20 border-white/30 text-white">
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
                      <SelectTrigger className="w-full sm:w-40 bg-white/20 border-white/30 text-white">
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  <p className="text-white mt-4">Loading packages...</p>
                </div>
              ) : (
                Object.entries(groupedOfferings).map(([category, categoryOfferings]: [string, any]) => (
                  <div key={category} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      {getCategoryIcon(category)}
                      <h3 className="text-xl font-semibold text-white">{category}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryOfferings.map((offering: any) => (
                        <Card key={offering.id} className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
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
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="text-center py-12">
                    <Package className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Packages Found</h3>
                    <p className="text-blue-200 mb-4">
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Inventory</CardTitle>
                <CardDescription className="text-blue-200">Inventory management features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {activeTab === 'qualification' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Qualification</CardTitle>
                <CardDescription className="text-blue-200">Qualification features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {activeTab === 'customize' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Customize</CardTitle>
                <CardDescription className="text-blue-200">Customization features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Messages</CardTitle>
                <CardDescription className="text-blue-200">Messaging features coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* User Info Card - only show on summary tab */}
        {activeTab === 'summary' && (
          <div className="max-w-md mx-auto mt-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Name:</span>
                  <span className="text-white font-medium">{user?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Email:</span>
                  <span className="text-white font-medium">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Role:</span>
                  <Badge variant="secondary" className="bg-blue-500 text-white">
                    {user?.role || 'User'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Department:</span>
                  <span className="text-white font-medium">{user?.department || 'General'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

