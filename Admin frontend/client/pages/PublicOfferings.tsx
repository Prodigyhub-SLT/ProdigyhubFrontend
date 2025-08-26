import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Package, DollarSign, Clock, Shield, ArrowRight, LogIn, ChevronDown, Wifi, Building, Smartphone, Cloud, Tv, Phone, Gamepad2, Globe, Gift, Eye, Edit, Trash2, Filter, X, BookOpen } from 'lucide-react';
import { productCatalogApi } from '@/lib/api';
import { ProductOffering } from '../../shared/product-order-types';
import { SLT_CATEGORIES, getSubCategories, getSubSubCategories } from '../components/types/SLTTypes';

// Category Navigation Data
const categoryNavItems = [
  {
    name: 'Broadband',
    icon: Wifi,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    description: 'Internet & Data Services'
  },
  {
    name: 'Business',
    icon: Building,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    description: 'Enterprise Solutions'
  },
  {
    name: 'Mobile',
    icon: Smartphone,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    description: 'Mobile Services'
  },
  {
    name: 'Cloud Service',
    icon: Cloud,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    description: 'Cloud & Storage'
  },
  {
    name: 'Product',
    icon: Package,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    description: 'Hardware & Software Products'
  },
  {
    name: 'PEOTV',
    icon: Tv,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    description: 'Entertainment Services'
  },
  {
    name: 'Telephone',
    icon: Phone,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    description: 'Voice Services'
  },
  {
    name: 'Gaming & Cloud',
    icon: Gamepad2,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    description: 'Gaming Solutions'
  },
  {
    name: 'IDD',
    icon: Globe,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    description: 'International Services'
  },
  {
    name: 'Promotions',
    icon: Gift,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    description: 'Special Offers'
  }
];

interface PublicOfferingsProps {
  onLoginClick?: () => void;
}

interface FilterState {
  mainCategory: string;
  subCategory: string;
  subSubCategory: string;
  searchTerm: string;
}

export default function PublicOfferings({ onLoginClick }: PublicOfferingsProps) {
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState<ProductOffering[]>([]);
  const [filteredOfferings, setFilteredOfferings] = useState<ProductOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('broadband');
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    mainCategory: 'Broadband',
    subCategory: 'all',
    subSubCategory: 'all',
    searchTerm: ''
  });

  // Broadband specific filter states
  const [broadbandFilters, setBroadbandFilters] = useState({
    connectionType: 'all',
    packageUsageType: 'all',
    packageType: 'all',
    dataBundle: 'all'
  });

  // Spec view modal state
  const [isSpecViewOpen, setIsSpecViewOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<ProductOffering | null>(null);

  useEffect(() => {
    loadOfferings();
    // Set initial Broadband selection
    handleCategorySelect('Broadband');
  }, []);

  useEffect(() => {
    console.log('🔍 Current offerings:', offerings);
    console.log('🔍 Filtered offerings:', filteredOfferings);
    console.log('🔍 Current filters:', filters);
  }, [offerings, filteredOfferings, filters]);

  useEffect(() => {
    filterOfferings();
  }, [offerings, filters, broadbandFilters]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offeringsData = await productCatalogApi.getOfferings({ limit: 100 });
      console.log('📥 Raw offerings from API:', offeringsData);
      
      // Filter only active offerings
      const activeOfferings = offeringsData.filter(
        (offering: any) => offering.lifecycleStatus === 'Active'
      );
      
      console.log('✅ Active offerings found:', activeOfferings.length);
      
      // Use real offerings data, no mock data fallback
      setOfferings(activeOfferings);
      
    } catch (error) {
      console.error('❌ Error loading offerings:', error);
      setOfferings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOfferings = () => {
    let filtered = [...offerings];

    // Filter by main category
    if (filters.mainCategory !== 'all') {
      filtered = filtered.filter(offering => {
        const category = getOfferingCategory(offering);
        return category.toLowerCase() === filters.mainCategory.toLowerCase();
      });
    }

    // Filter by sub category
    if (filters.subCategory !== 'all') {
      filtered = filtered.filter(offering => {
        const subCategory = (offering as any).subCategory || '';
        return subCategory.toLowerCase() === filters.subCategory.toLowerCase();
      });
    }

    // Filter by sub-sub category
    if (filters.subSubCategory !== 'all') {
      filtered = filtered.filter(offering => {
        const subSubCategory = (offering as any).subSubCategory || '';
        return subSubCategory.toLowerCase() === filters.subSubCategory.toLowerCase();
      });
    }

    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(offering => {
        const name = offering.name?.toLowerCase() || '';
        const description = offering.description?.toLowerCase() || '';
        return name.includes(filters.searchTerm.toLowerCase()) || 
               description.includes(filters.searchTerm.toLowerCase());
      });
    }

    // Broadband-specific filters (only apply if main category is Broadband)
    if (filters.mainCategory === 'Broadband' || filters.mainCategory === 'broadband') {
      // Filter by Connection Type (sub-category)
      if (broadbandFilters.connectionType !== 'all') {
        filtered = filtered.filter(offering => {
          const subCategory = (offering as any).subCategory || '';
          return subCategory.toLowerCase() === broadbandFilters.connectionType.toLowerCase();
        });
      }

      // Filter by Package Usage Type (sub-sub-category)
      if (broadbandFilters.packageUsageType !== 'all') {
        filtered = filtered.filter(offering => {
          const subSubCategory = (offering as any).subSubCategory || '';
          return subSubCategory.toLowerCase() === broadbandFilters.packageUsageType.toLowerCase();
        });
      }

      // Filter by Package Type (sub-category)
      if (broadbandFilters.packageType !== 'all') {
        filtered = filtered.filter(offering => {
          const subCategory = (offering as any).subCategory || '';
          return subCategory.toLowerCase() === broadbandFilters.packageType.toLowerCase();
        });
      }

      // Filter by Data Bundle (sub-sub-category)
      if (broadbandFilters.dataBundle !== 'all') {
        filtered = filtered.filter(offering => {
          const subSubCategory = (offering as any).subSubCategory || '';
          return subSubCategory.toLowerCase() === broadbandFilters.dataBundle.toLowerCase();
        });
      }
    }

    setFilteredOfferings(filtered);
  };

  const resetFilters = () => {
    setFilters({
      mainCategory: 'all',
      subCategory: 'all',
      subSubCategory: 'all',
      searchTerm: ''
    });
    setBroadbandFilters({
      connectionType: 'all',
      packageUsageType: 'all',
      packageType: 'all',
      dataBundle: 'all'
    });
    setSelectedCategory('all');
  };

  const getOfferingPrice = (offering: ProductOffering) => {
    if (offering.productOfferingPrice && offering.productOfferingPrice.length > 0) {
      const price = offering.productOfferingPrice[0];
      return {
        amount: price.price?.taxIncludedAmount?.value || 0,
        currency: price.price?.taxIncludedAmount?.unit || 'LKR',
        period: price.priceType === 'oneTime' ? 'one-time' : 'per month'
      };
    }
    return null;
  };

  const getOfferingCategory = (offering: ProductOffering) => {
    if (Array.isArray(offering.category) && offering.category.length > 0) {
      return offering.category[0].name || offering.category[0].id || 'Other';
    } else if (typeof offering.category === 'object' && offering.category) {
      return (offering.category as any).name || (offering.category as any).id || 'Other';
    } else if (typeof offering.category === 'string') {
      return offering.category;
    }
    return 'Other';
  };

  const getOfferingSpecs = (offering: ProductOffering) => {
    // Get specifications from MongoDB offering structure
    const customAttributes = (offering as any).customAttributes || [];
    
    // Get category info from MongoDB fields
    const subCategory = (offering as any).subCategory || '';
    const subSubCategory = (offering as any).subSubCategory || '';
    const categoryDescription = (offering as any).categoryDescription || '';

    // Extract connection type from subCategory or custom attributes
    let connectionType = subCategory;
    if (!connectionType) {
      const connectionTypeAttr = customAttributes.find((attr: any) =>
        attr.name.toLowerCase().includes('connection') ||
        attr.name.toLowerCase().includes('technology') ||
        attr.name.toLowerCase().includes('type')
      );
      connectionType = connectionTypeAttr?.value || 'Broadband';
    }

    // Extract package type from subSubCategory or custom attributes
    let packageType = subSubCategory;
    if (!packageType) {
      const packageTypeAttr = customAttributes.find((attr: any) =>
        attr.name.toLowerCase().includes('package') ||
        attr.name.toLowerCase().includes('usage') ||
        attr.name.toLowerCase().includes('type')
      );
      packageType = packageTypeAttr?.value || 'Unlimited';
    }

    // Data allowance from custom attributes
    const dataAttr = customAttributes.find((attr: any) =>
      attr.name.toLowerCase().includes('data') ||
      attr.name.toLowerCase().includes('usage') ||
      attr.name.toLowerCase().includes('allowance')
    );
    const dataAllowance = dataAttr?.value || 'Unlimited';

    // Internet speed from custom attributes
    const speedAttr = customAttributes.find((attr: any) =>
      attr.name.toLowerCase().includes('speed') ||
      attr.name.toLowerCase().includes('bandwidth') ||
      attr.name.toLowerCase().includes('mbps')
    );
    const internetSpeed = speedAttr?.value || '300 Mbps';

    // Voice from custom attributes
    const voiceAttr = customAttributes.find((attr: any) =>
      attr.name.toLowerCase().includes('voice') ||
      attr.name.toLowerCase().includes('calls')
    );
    const voice = voiceAttr?.value || 'Unlimited Calls';

    const category = getOfferingCategory(offering);
    const name = (offering.name || '').toLowerCase();

    if (category === 'Broadband' || name.includes('fibre') || name.includes('broadband')) {
      return {
        connectionType: connectionType || 'Broadband',
        packageType: packageType || 'Unlimited',
        dataAllowance: dataAllowance,
        data: dataAllowance,
        internetSpeed: internetSpeed,
        voice: voice
      };
    } else if (category === 'Mobile' || name.includes('mobile')) {
      return {
        connectionType: 'Mobile',
        packageType: packageType || 'Standard',
        dataAllowance: dataAllowance,
        data: dataAllowance,
        internetSpeed: '4G/5G',
        voice: voice
      };
    } else if (category === 'Business') {
      return {
        connectionType: 'Enterprise',
        packageType: packageType || 'Contract',
        dataAllowance: dataAllowance,
        data: dataAllowance,
        internetSpeed: '1 Gbps',
        voice: voice
      };
    } else if (category === 'Product') {
      return {
        connectionType: 'Product',
        packageType: '-',
        dataAllowance: 'Hardware/Software',
        data: 'Hardware/Software',
        internetSpeed: 'N/A',
        voice: 'N/A'
      };
    }

    return {
      connectionType: connectionType || 'Other',
      packageType: packageType || 'Standard',
      dataAllowance: dataAllowance,
      data: dataAllowance,
      internetSpeed: internetSpeed,
      voice: voice
    };
  };

  const getSpecDescription = (offering: ProductOffering) => {
    const specs = getOfferingSpecs(offering);
    const category = getOfferingCategory(offering);
    const name = offering.name.toLowerCase();
    
    // Generate a comprehensive spec description based on the offering's technical specifications
    if (category === 'Broadband' || name.includes('fibre') || name.includes('broadband')) {
      return `High-performance ${specs.connectionType} package featuring ${specs.data} data allocation with ${specs.internetSpeed} internet speeds. This comprehensive broadband solution includes ${specs.voice} for seamless communication, ensuring reliable connectivity for both personal and business use. The package is optimized for streaming, gaming, and high-bandwidth applications.`;
    } else if (category === 'Mobile' || name.includes('mobile')) {
      return `Advanced ${specs.connectionType} service providing ${specs.data} data with ${specs.internetSpeed} network coverage. Features ${specs.voice} capabilities for unlimited communication, perfect for on-the-go users who need reliable mobile connectivity with generous data allowances.`;
    } else if (category === 'Business') {
      return `Enterprise-grade ${specs.connectionType} solution delivering ${specs.data} data capacity and ${specs.internetSpeed} bandwidth. Includes ${specs.voice} services designed for business communication needs, offering scalable and reliable connectivity for corporate environments.`;
    } else if (category === 'Product') {
      return `Professional ${specs.connectionType} offering featuring ${specs.data} capabilities. This hardware/software solution is designed for enterprise deployment with comprehensive support and integration options.`;
    } else if (category === 'PEOTV') {
      return `Entertainment-focused service package with ${specs.data} data allocation and ${specs.internetSpeed} streaming capabilities. Includes ${specs.voice} features for a complete multimedia experience.`;
    } else if (category === 'Telephone') {
      return `Voice-centric communication package providing ${specs.voice} with ${specs.data} data support. Features ${specs.internetSpeed} connectivity for VoIP services and enhanced calling features.`;
    } else if (category === 'Gaming & Cloud') {
      return `Gaming-optimized ${specs.connectionType} package with ${specs.data} data and ${specs.internetSpeed} speeds. Includes ${specs.voice} for team communication, designed for low-latency gaming and cloud gaming services.`;
    } else if (category === 'IDD') {
      return `International communication package featuring ${specs.voice} with ${specs.data} data support. Provides ${specs.internetSpeed} connectivity for seamless international calling and data services.`;
    } else if (category === 'Cloud Service') {
      return `Cloud-focused ${specs.connectionType} solution with ${specs.data} storage and ${specs.internetSpeed} bandwidth. Includes ${specs.voice} integration for unified communications in cloud environments.`;
    } else if (category === 'Promotions') {
      return `Special promotional ${specs.connectionType} package offering ${specs.data} data with ${specs.internetSpeed} speeds. Includes ${specs.voice} features at competitive rates for limited-time offers.`;
    }
    
    // Default fallback description
    return `Comprehensive ${specs.connectionType} package featuring ${specs.data} data allocation, ${specs.internetSpeed} internet speeds, and ${specs.voice} capabilities. This versatile solution is designed to meet diverse connectivity needs with reliable performance and extensive coverage.`;
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName.toLowerCase());
    if (categoryName === 'Broadband') {
      setFilters({
        mainCategory: 'Broadband',
        subCategory: 'all',
        subSubCategory: 'all',
        searchTerm: ''
      });
      // Set default broadband filters to show all sub-sub categories
      setBroadbandFilters({
        connectionType: 'all',
        packageUsageType: 'all',
        packageType: 'all',
        dataBundle: 'all'
      });
    } else {
      setFilters({
        mainCategory: categoryName,
        subCategory: 'all',
        subSubCategory: 'all',
        searchTerm: ''
      });
    }
  };

  const groupOfferingsBySubSubCategory = (offerings: ProductOffering[]) => {
    const groups: { [key: string]: ProductOffering[] } = {};
    
    offerings.forEach(offering => {
      // Since subSubCategory doesn't exist in MongoDB, group by connection type from custom attributes
      let connectionType = 'Data/PEOTV & Voice Packages'; // Default category
      
      // Try to get connection type from custom attributes
      const customAttributes = (offering as any).customAttributes || [];
      const connectionTypeAttr = customAttributes.find((attr: any) =>
        attr.name.toLowerCase().includes('connection') ||
        attr.name.toLowerCase().includes('technology') ||
        attr.name.toLowerCase().includes('type')
      );
      
      if (connectionTypeAttr?.value) {
        connectionType = connectionTypeAttr.value;
      }
      
      // Map any remaining "Other" categories to "Data/PEOTV & Voice Packages"
      if (connectionType === 'Other') {
        connectionType = 'Data/PEOTV & Voice Packages';
      }
      
      if (!groups[connectionType]) {
        groups[connectionType] = [];
      }
      groups[connectionType].push(offering);
    });
    
    return groups;
  };

  const handleViewSpec = (offering: ProductOffering) => {
    setSelectedOffering(offering);
    setIsSpecViewOpen(true);
  };

  const closeSpecView = () => {
    setIsSpecViewOpen(false);
    setSelectedOffering(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading offerings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-white/90 via-blue-50/50 to-purple-50/50 backdrop-blur-md border-b border-white/20 shadow-lg shadow-blue-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/slt-log.jpg" 
                alt="SLT Logo" 
                className="h-12 w-auto animate-fade-in"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/30 text-gray-700 hover:bg-white/20 hover:border-white/50 transition-all duration-300 px-4 py-2 backdrop-blur-sm bg-white/10 rounded-xl font-medium animate-slide-in-right"
              >
                <Search className="w-4 h-4 mr-2 animate-pulse" />
                Filter
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 animate-bounce-in"
              >
                <ArrowRight className="h-4 w-4 mr-2 animate-pulse" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Category Navigation Bar */}
      <div className="bg-gradient-to-r from-white/80 via-blue-50/30 to-purple-50/30 backdrop-blur-md border-b border-white/20 sticky top-0 z-30 shadow-lg shadow-blue-500/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide pb-2">
              {categoryNavItems.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedCategory === item.name.toLowerCase();
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategorySelect(item.name)}
                    className={`whitespace-nowrap font-medium transition-all duration-300 relative group px-4 py-2 min-w-fit rounded-xl animate-fade-in-up ${
                      isSelected 
                        ? `bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/25` 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 transition-all duration-300 flex-shrink-0 ${
                      isSelected ? 'text-white' : `${item.color} group-hover:scale-110 group-hover:rotate-12`
                    }`} />
                    <span className="flex-shrink-0">{item.name}</span>
                    <ChevronDown className={`w-3 h-3 ml-2 transition-all duration-300 flex-shrink-0 ${
                      isSelected ? 'rotate-180' : ''
                    }`} />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb and Title */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">»</span>
            <span>{categoryNavItems.find(item => item.name.toLowerCase() === selectedCategory)?.name || selectedCategory}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedCategory === 'broadband' ? 'Broadband Packages' :
             categoryNavItems.find(item => item.name.toLowerCase() === selectedCategory)?.name + ' Packages' || 'Products'}
          </h1>
        </div>

        {/* Broadband Specific Filters */}
        {selectedCategory === 'broadband' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700">Filter By:</span>
              
              {/* Connection Type Filter (sub-sub-category) */}
              <Select 
                value={broadbandFilters.connectionType} 
                onValueChange={(value) => setBroadbandFilters(prev => ({ ...prev, connectionType: value }))}
              >
                <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                  <SelectValue placeholder="Connection Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Connection Types</SelectItem>
                  <SelectItem value="Data/PEOTV & Voice Packages">Data/PEOTV & Voice Packages</SelectItem>
                  <SelectItem value="Data Packages">Data Packages</SelectItem>
                  <SelectItem value="Data & Voice">Data & Voice</SelectItem>
                </SelectContent>
              </Select>

              {/* Package Usage Type Filter (sub-sub-category) */}
              <Select 
                value={broadbandFilters.packageUsageType} 
                onValueChange={(value) => setBroadbandFilters(prev => ({ ...prev, packageUsageType: value }))}
              >
                <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                  <SelectValue placeholder="Package Usage Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Usage Types</SelectItem>
                  <SelectItem value="Any Time">Any Time</SelectItem>
                  <SelectItem value="Time Based">Time Based</SelectItem>
                  <SelectItem value="Unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>

              {/* Package Type Filter (sub-sub-category) */}
              <Select 
                value={broadbandFilters.packageType} 
                onValueChange={(value) => setBroadbandFilters(prev => ({ ...prev, packageType: value }))}
              >
                <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                  <SelectValue placeholder="Package Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Package Types</SelectItem>
                  <SelectItem value="4G">4G</SelectItem>
                  <SelectItem value="ADSL">ADSL</SelectItem>
                  <SelectItem value="Fiber">Fiber</SelectItem>
                </SelectContent>
              </Select>

              {/* Data Bundle Filter */}
              <Select 
                value={broadbandFilters.dataBundle} 
                onValueChange={(value) => setBroadbandFilters(prev => ({ ...prev, dataBundle: value }))}
              >
                <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                  <SelectValue placeholder="Data Bundle" />
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
                </SelectContent>
              </Select>

              {/* Reset Button */}
              {(broadbandFilters.connectionType !== 'all' || broadbandFilters.packageUsageType !== 'all' || 
                broadbandFilters.packageType !== 'all' || broadbandFilters.dataBundle !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBroadbandFilters({
                    connectionType: 'all',
                    packageUsageType: 'all',
                    packageType: 'all',
                    dataBundle: 'all'
                  })}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search offerings..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>

        {/* Offerings Display */}
        {filteredOfferings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No offerings found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : selectedCategory === 'broadband' ? (
          // Grouped display for Broadband
          <div className="space-y-8">
            {(() => {
              const groupedOfferings = groupOfferingsBySubSubCategory(filteredOfferings);
              // Define the desired order for categories
              const categoryOrder = [
                'Data/PEOTV & Voice Packages',
                'Data Packages', 
                'Data & Voice'
              ];
              
              // Sort the entries based on the defined order
              const sortedEntries = Object.entries(groupedOfferings).sort(([a], [b]) => {
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
              
              return sortedEntries.map(([subSubCategory, categoryOfferings]) => (
              <div key={subSubCategory} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{subSubCategory}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryOfferings.map((offering) => {
                    const price = getOfferingPrice(offering);
                    const category = getOfferingCategory(offering);
                    const specs = getOfferingSpecs(offering);
                    
                    return (
                      <Card key={offering.id} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden h-[500px] flex flex-col max-w-xs bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl">
                        {/* Header Section */}
                        <div className="p-6 pb-4 flex-1">
                          <div className="mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {offering.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {offering.description || 'No description available'}
                              </p>
                            </div>
                            <div className="flex items-center justify-end">
                              <Badge 
                                variant="outline" 
                                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-xs font-semibold shadow-sm"
                              >
                                ACTIVE
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Category and Service Type */}
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Wifi className="h-4 w-4 text-orange-500" />
                              <span>{category}</span>
                            </div>
                            <span className="text-sm text-gray-600">•</span>
                                                         <span className="text-sm text-gray-600">
                               {(() => {
                                 const customAttributes = (offering as any).customAttributes || [];
                                 const connectionTypeAttr = customAttributes.find((attr: any) =>
                                   attr.name.toLowerCase().includes('connection') ||
                                   attr.name.toLowerCase().includes('technology') ||
                                   attr.name.toLowerCase().includes('type')
                                 );
                                 return connectionTypeAttr?.value || 'Data & Voice';
                               })()}
                             </span>
                          </div>
                          
                          {/* Specifications */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Connection Type:</span>
                              <span className="text-gray-900">{(specs as any).connectionType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Package Type:</span>
                              <span className="text-gray-900">{(specs as any).packageType || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Internet Speed:</span>
                              <span className="text-gray-900">{specs.internetSpeed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Data Allowance:</span>
                              <span className="text-gray-900">{(specs as any).dataAllowance || specs.data}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Section with Solid Blue */}
                        {price && (
                          <div className="bg-blue-600 text-white p-4 relative overflow-hidden h-32 flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/10"></div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                            <div className="text-center relative z-10">
                              <div className="text-2xl font-bold mb-1 drop-shadow-sm">
                                {price.currency} {price.amount.toLocaleString()}
                              </div>
                              <div className="text-sm opacity-90 mb-3">
                                {price.period}
                              </div>
                              <div className="text-xs space-y-1 opacity-80">
                                <div>Setup: {price.currency} {(offering as any).pricing?.setupFee?.toLocaleString() || 'N/A'}</div>
                                <div>Security Deposit: {price.currency} {(offering as any).pricing?.deposit?.toLocaleString() || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer Actions */}
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewSpec(offering)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:shadow-md transition-all duration-200 rounded-lg px-6 py-2 font-medium"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
          </div>
        ) : (
          // Regular grid display for other categories
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredOfferings.map((offering) => {
              const price = getOfferingPrice(offering);
              const category = getOfferingCategory(offering);
              const specs = getOfferingSpecs(offering);
              
              return (
                <Card key={offering.id} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden h-[500px] flex flex-col max-w-xs bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 rounded-2xl">
                  {/* Header Section */}
                  <div className="p-6 pb-4 flex-1">
                    <div className="mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {offering.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {offering.description || 'No description available'}
                        </p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Badge 
                          variant="outline" 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-xs font-semibold shadow-sm"
                        >
                          ACTIVE
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Category and Service Type */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        {category === 'Product' ? (
                          <Package className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <Wifi className="h-4 w-4 text-orange-500" />
                        )}
                        <span>{category}</span>
                      </div>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">
                        {category === 'Product' ? 'Hardware & Software' : 'Data & Voice'}
                      </span>
                    </div>
                    
                    {/* Specifications */}
                    <div className="space-y-2 text-sm">
                      {category === 'Product' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Product Type:</span>
                            <span className="text-gray-900">{(offering as any).customAttributes?.find((attr: any) => attr.name.toLowerCase() === 'product type')?.value || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Brand:</span>
                            <span className="text-gray-900">{(offering as any).customAttributes?.find((attr: any) => attr.name.toLowerCase() === 'brand')?.value || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Model:</span>
                            <span className="text-gray-900">{(offering as any).customAttributes?.find((attr: any) => attr.name.toLowerCase() === 'model')?.value || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Warranty:</span>
                            <span className="text-gray-900">{(offering as any).customAttributes?.find((attr: any) => attr.name.toLowerCase() === 'warranty')?.value || '-'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Connection Type:</span>
                            <span className="text-gray-900">{specs.connectionType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Data:</span>
                            <span className="text-gray-900">{specs.data}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Internet Speed:</span>
                            <span className="text-gray-900">{specs.internetSpeed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Voice:</span>
                            <span className="text-gray-900">{specs.voice}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pricing Section with Solid Blue */}
                  {price && (
                    <div className="bg-blue-600 text-white p-4 relative overflow-hidden h-32 flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/10"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                      <div className="text-center relative z-10">
                        <div className="text-2xl font-bold mb-1 drop-shadow-sm">
                          {price.currency} {price.amount.toLocaleString()}
                        </div>
                        <div className="text-sm opacity-90 mb-3">
                          {price.period}
                        </div>
                        <div className="text-xs space-y-1 opacity-80">
                          <div>Setup: {price.currency} {(offering as any).pricing?.setupFee?.toLocaleString() || 'N/A'}</div>
                          <div>Security Deposit: {price.currency} {(offering as any).pricing?.deposit?.toLocaleString() || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
                    <div className="flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewSpec(offering)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:shadow-md transition-all duration-200 rounded-lg px-6 py-2 font-medium"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 ProdigyHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Spec View Modal */}
      <Dialog open={isSpecViewOpen} onOpenChange={setIsSpecViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">{selectedOffering?.name}</DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    View complete specification information and characteristics
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSpecView}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedOffering && (
            <div className="space-y-6 p-6 pt-0">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <Badge className="bg-green-500 text-white border-0 text-xs font-semibold">
                    ACTIVE
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="text-gray-900">{getOfferingCategory(selectedOffering)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Brand & Version:</span>
                    <span className="text-gray-900 ml-2">ProdigyHub v1.0</span>
                  </div>
                </div>
              </div>

              {/* Specification Description */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specification Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {getSpecDescription(selectedOffering)}
                </p>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Connection Type:</span>
                    <span className="text-gray-900">{getOfferingSpecs(selectedOffering).connectionType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Package Type:</span>
                    <span className="text-gray-900">{(getOfferingSpecs(selectedOffering) as any).packageType || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Internet Speed:</span>
                    <span className="text-gray-900">{getOfferingSpecs(selectedOffering).internetSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Data Allowance:</span>
                    <span className="text-gray-900">{(getOfferingSpecs(selectedOffering) as any).dataAllowance || getOfferingSpecs(selectedOffering).data}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              {getOfferingPrice(selectedOffering) && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h3>
                  <div className="bg-blue-600 text-white p-6 relative overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-white/10"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <div className="text-center relative z-10">
                      <div className="text-3xl font-bold mb-2 drop-shadow-sm">
                        {getOfferingPrice(selectedOffering)!.currency} {getOfferingPrice(selectedOffering)!.amount.toLocaleString()}
                      </div>
                      <div className="text-lg opacity-90 mb-4">
                        {getOfferingPrice(selectedOffering)!.period}
                      </div>
                                               <div className="space-y-2 opacity-80">
                           <div className="text-sm">Setup: {getOfferingPrice(selectedOffering)!.currency} {(selectedOffering as any).pricing?.setupFee?.toLocaleString() || 'N/A'}</div>
                           <div className="text-sm">Security Deposit: {getOfferingPrice(selectedOffering)!.currency} {(selectedOffering as any).pricing?.deposit?.toLocaleString() || 'N/A'}</div>
                         </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                                         <span className="text-gray-900 ml-2">
                       {(selectedOffering as any).createdAt ? new Date((selectedOffering as any).createdAt).toLocaleString() : 'N/A'}
                     </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                                         <span className="text-gray-900 ml-2">
                       {(selectedOffering as any).updatedAt ? new Date((selectedOffering as any).updatedAt).toLocaleString() : 'N/A'}
                     </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 