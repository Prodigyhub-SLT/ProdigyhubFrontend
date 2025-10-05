import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package, ArrowRight, ChevronDown, Wifi, Building, Smartphone, Cloud, Tv, Phone, Gamepad2, Globe, Gift, Eye, Filter, X, BookOpen } from 'lucide-react';
import { productCatalogApi } from '@/lib/api';
import { ProductOffering } from '../../shared/product-order-types';

// Category Navigation Data
const categoryNavItems = [
  { name: 'Broadband', icon: Wifi, color: 'text-orange-500', description: 'Internet & Data Services' },
  { name: 'Business', icon: Building, color: 'text-green-500', description: 'Enterprise Solutions' },
  { name: 'Mobile', icon: Smartphone, color: 'text-purple-500', description: 'Mobile Services' },
  { name: 'Cloud Service', icon: Cloud, color: 'text-red-500', description: 'Cloud & Storage' },
  { name: 'Product', icon: Package, color: 'text-indigo-500', description: 'Hardware & Software Products' },
  { name: 'PEOTV', icon: Tv, color: 'text-red-500', description: 'Entertainment Services' },
  { name: 'Telephone', icon: Phone, color: 'text-indigo-500', description: 'Voice Services' },
  { name: 'Gaming & Cloud', icon: Gamepad2, color: 'text-pink-500', description: 'Gaming Solutions' },
  { name: 'IDD', icon: Globe, color: 'text-cyan-500', description: 'International Services' },
  { name: 'Promotions', icon: Gift, color: 'text-yellow-500', description: 'Special Offers' }
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
  const [activeTab, setActiveTab] = useState<string>('broadband');
  
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

  const [peoTvFilters, setPeoTvFilters] = useState({
    subCategory: 'all'
  });

  // Spec view modal state
  const [isSpecViewOpen, setIsSpecViewOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<ProductOffering | null>(null);

  useEffect(() => {
    loadOfferings();
    handleCategorySelect('Broadband');
  }, []);

  useEffect(() => {
    filterOfferings();
  }, [offerings, filters, broadbandFilters, peoTvFilters, activeTab]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offeringsData = await productCatalogApi.getOfferings({ limit: 100 });
      
      // Filter only active offerings
      const activeOfferings = offeringsData.filter(
        (offering: any) => offering.lifecycleStatus === 'Active'
      );
      
      setOfferings(activeOfferings);
    } catch (error) {
      console.error('Error loading offerings:', error);
      setOfferings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOfferings = () => {
    let filtered = [...offerings];
    
    console.log('🔍 Starting filtering with:', { activeTab, filters, broadbandFilters });
    console.log('🔍 Total offerings to filter:', filtered.length);

    // Debug: Log all offerings and their detected categories
    console.log('🔍 All offerings with categories:', filtered.map(offering => ({
      name: offering.name,
      category: offering.category,
      categoryDescription: (offering as any).categoryDescription,
      detectedCategory: getOfferingCategory(offering)
    })));

    // Filter by active tab (main category)
    if (activeTab !== 'all') {
      filtered = filtered.filter(offering => {
        const category = getOfferingCategory(offering);
        const matches = category.toLowerCase() === activeTab.toLowerCase();
        if (!matches) {
          console.log('❌ Tab filter failed for:', offering.name, 'Expected:', activeTab, 'Got:', category);
        } else {
          console.log('✅ Tab filter passed for:', offering.name, 'Category:', category);
        }
        return matches;
      });
      console.log('🔍 After tab filter:', filtered.length);
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

    // Broadband-specific filters using current data structure
    if (filters.mainCategory === 'Broadband' || filters.mainCategory === 'broadband') {
      console.log('🔍 Applying broadband filters to:', filtered.length, 'offerings');
      
      // Filter by Connection Type (from categoryDescription)
      if (broadbandFilters.connectionType !== 'all') {
        filtered = filtered.filter(offering => {
          const categoryDescription = (offering as any).categoryDescription || '';
          let matches = false;
          
          if (broadbandFilters.connectionType === 'Data/PEOTV & Voice Packages') {
            // Only match if it contains "PEOTV" (Data/PEOTV & Voice Packages)
            matches = categoryDescription.includes('PEOTV');
          } else if (broadbandFilters.connectionType === 'Data Packages') {
            // Prefer explicit tag "Data Packages" OR (4G/ADSL) and NOT PEOTV
            const isTechData = categoryDescription.includes('4G') || categoryDescription.includes('ADSL');
            const isExplicitDataPackages = categoryDescription.includes('Data Packages');
            matches = (isExplicitDataPackages || isTechData) && !categoryDescription.includes('PEOTV');
          } else if (broadbandFilters.connectionType === 'Data & Voice') {
            // Must be Fiber but NOT PEOTV and NOT explicitly Data Packages
            const isFiber = categoryDescription.includes('Fiber') || categoryDescription.includes('Fibre');
            const isDataPackages = categoryDescription.includes('Data Packages');
            matches = isFiber && !categoryDescription.includes('PEOTV') && !isDataPackages;
          }
          
          if (!matches) {
            console.log('❌ Connection type filter failed for:', offering.name, 'Expected:', broadbandFilters.connectionType, 'Got:', categoryDescription);
          } else {
            console.log('✅ Connection type filter passed for:', offering.name, 'Filter:', broadbandFilters.connectionType, 'Description:', categoryDescription);
          }
          return matches;
        });
        console.log('🔍 After connection type filter:', filtered.length);
      }

      // Filter by Package Usage Type (from categoryDescription)
      if (broadbandFilters.packageUsageType !== 'all') {
        filtered = filtered.filter(offering => {
          const categoryDescription = (offering as any).categoryDescription || '';
          let matches = false;
          
          if (broadbandFilters.packageUsageType === 'Any Time') {
            matches = categoryDescription.includes('Any Time') || categoryDescription.includes('Anytime');
          } else if (broadbandFilters.packageUsageType === 'Time Based') {
            matches = categoryDescription.includes('Time Based');
          } else if (broadbandFilters.packageUsageType === 'Unlimited') {
            matches = categoryDescription.includes('Unlimited');
          }
          
          return matches;
        });
      }

      // Filter by Package Type (from categoryDescription)
      if (broadbandFilters.packageType !== 'all') {
        filtered = filtered.filter(offering => {
          const categoryDescription = (offering as any).categoryDescription || '';
          return categoryDescription.includes(broadbandFilters.packageType);
        });
      }

      // Filter by Data Bundle (from categoryDescription)
      if (broadbandFilters.dataBundle !== 'all') {
        filtered = filtered.filter(offering => {
          const categoryDescription = (offering as any).categoryDescription || '';
          // Convert "40 GB" to "40GB" for matching
          const normalizedDataBundle = broadbandFilters.dataBundle.replace(' ', '');
          return categoryDescription.includes(normalizedDataBundle);
        });
      }
    }

    // Apply PEO-TV specific filters
    if (activeTab === 'peo-tv') {
      console.log('🔍 Applying PEO-TV filters to:', filtered.length, 'offerings');
      
      // Sub-category filter (peocharges, peopackages)
      if (peoTvFilters.subCategory !== 'all') {
        filtered = filtered.filter(offering => {
          const subCategory = (offering as any).subCategory || '';
          const matches = subCategory.toLowerCase().includes(peoTvFilters.subCategory.toLowerCase());
          if (!matches) {
            console.log('❌ PEO-TV sub-category filter failed for:', offering.name, 'Expected:', peoTvFilters.subCategory, 'Got:', subCategory);
          }
          return matches;
        });
        console.log('🔍 After PEO-TV sub-category filter:', filtered.length);
      }
    }

    console.log('🔍 Final filtered result:', filtered.length, 'offerings');
    console.log('🔍 Filtered offerings:', filtered.map(o => ({ name: o.name, category: getOfferingCategory(o) })));
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
    // First, check the category array (this is the most reliable source)
    if (Array.isArray(offering.category) && offering.category.length > 0) {
      const categoryName = offering.category[0].name || offering.category[0].id || '';
      // Normalize the category name for comparison
      const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '');
      
      if (normalizedName.includes('broadband')) {
        return 'Broadband';
      } else if (normalizedName.includes('peotv') || normalizedName.includes('peo-tv') || normalizedName.includes('peotv')) {
        return 'PEO-TV';
      }
      
      return categoryName; // Return the original name if it doesn't match our known categories
    } else if (typeof offering.category === 'object' && offering.category) {
      const categoryName = (offering.category as any).name || (offering.category as any).id || '';
      const normalizedName = categoryName.toLowerCase().replace(/\s+/g, '');
      
      if (normalizedName.includes('broadband')) {
        return 'Broadband';
      } else if (normalizedName.includes('peotv') || normalizedName.includes('peo-tv') || normalizedName.includes('peotv')) {
        return 'PEO-TV';
      }
      
      return categoryName;
    } else if (typeof offering.category === 'string') {
      const normalizedName = (offering.category as string).toLowerCase().replace(/\s+/g, '');
      
      if (normalizedName.includes('broadband')) {
        return 'Broadband';
      } else if (normalizedName.includes('peotv') || normalizedName.includes('peo-tv') || normalizedName.includes('peotv')) {
        return 'PEO-TV';
      }
      
      return offering.category;
    }
    
    // Fallback: Check categoryDescription for PEO-TV offerings
    const categoryDescription = (offering as any).categoryDescription || '';
    if (categoryDescription.toLowerCase().includes('peo tv') || 
        categoryDescription.toLowerCase().includes('peotv') || 
        categoryDescription.toLowerCase().includes('peo-tv')) {
      return 'PEO-TV';
    }
    
    // Fallback: Check if it's a Broadband offering based on name or description
    const name = (offering.name || '').toLowerCase();
    const description = (offering.description || '').toLowerCase();
    
    if (name.includes('broadband') || description.includes('broadband') || 
        name.includes('fibre') || name.includes('fiber') || 
        name.includes('internet') || name.includes('data')) {
      return 'Broadband';
    }
    
    return 'Other';
  };





  const getOfferingSpecs = (offering: ProductOffering) => {
    // Extract Connection Type & Package Type from categoryDescription (for filtering consistency)
    const categoryDescription = (offering as any).categoryDescription || '';
    
    const connectionType = categoryDescription.includes('Fiber') ? 'Fiber' : 
                          categoryDescription.includes('4G') ? '4G' : 
                          categoryDescription.includes('ADSL') ? 'ADSL' : 'N/A';
    
    const packageType = categoryDescription.includes('Any Time') ? 'Any Time' : 
                       categoryDescription.includes('Time Based') ? 'Time Based' : 
                       categoryDescription.includes('Unlimited') ? 'Unlimited' : 'N/A';

    return {
      connectionType,
      packageType
    };
  };

  // Classify offering into a connection-type group for grouped display
  const getConnectionTypeGroup = (offering: ProductOffering): 'peotv' | 'dataPackages' | 'dataAndVoice' | 'unknown' => {
    const desc = (offering as any).categoryDescription || '';
    if (desc.includes('PEOTV')) return 'peotv';
    const isDataPackages = desc.includes('Data Packages') || desc.includes('4G') || desc.includes('ADSL');
    const isFiber = desc.includes('Fiber') || desc.includes('Fibre');
    if (isDataPackages && !desc.includes('PEOTV')) return 'dataPackages';
    if (isFiber && !desc.includes('PEOTV') && !isDataPackages) return 'dataAndVoice';
    return 'unknown';
  };

  const getPeoTvSubCategoryGroup = (offering: ProductOffering): 'peocharges' | 'peopackages' | 'other' => {
    const subCategory = (offering as any).subCategory || '';
    
    if (subCategory.toLowerCase().includes('peocharges')) {
      return 'peocharges';
    } else if (subCategory.toLowerCase().includes('peopackages')) {
      return 'peopackages';
    }
    
    return 'other';
  };

  const getPeoPackageColors = (offering: ProductOffering) => {
    const name = offering.name?.toLowerCase() || '';
    
    if (name.includes('titanium')) {
      return {
        gradient: 'from-gray-600 to-gray-800',
        shadow: 'shadow-gray-500/10',
        badge: 'from-gray-500 to-gray-700',
        bullet: 'bg-gray-500',
        features: 'bg-gray-50',
        hover: 'hover:bg-gray-600'
      };
    } else if (name.includes('platinum')) {
      return {
        gradient: 'from-pink-500 to-purple-700',
        shadow: 'shadow-pink-500/20',
        badge: 'from-pink-500 to-purple-700',
        bullet: 'bg-pink-500',
        features: 'bg-pink-100',
        hover: 'hover:bg-pink-600'
      };
    } else if (name.includes('gold')) {
      return {
        gradient: 'from-yellow-500 to-yellow-700',
        shadow: 'shadow-yellow-500/10',
        badge: 'from-yellow-500 to-yellow-700',
        bullet: 'bg-yellow-500',
        features: 'bg-yellow-50',
        hover: 'hover:bg-yellow-600'
      };
    } else if (name.includes('silver plus')) {
      return {
        gradient: 'from-gray-400 to-gray-600',
        shadow: 'shadow-gray-400/10',
        badge: 'from-gray-400 to-gray-600',
        bullet: 'bg-gray-400',
        features: 'bg-gray-50',
        hover: 'hover:bg-gray-500'
      };
    } else if (name.includes('silver')) {
      return {
        gradient: 'from-gray-400 to-gray-600',
        shadow: 'shadow-gray-400/10',
        badge: 'from-gray-400 to-gray-600',
        bullet: 'bg-gray-400',
        features: 'bg-gray-50',
        hover: 'hover:bg-gray-500'
      };
    }
    
    // Default orange theme for other packages
    return {
      gradient: 'from-orange-500 to-red-600',
      shadow: 'shadow-orange-500/10',
      badge: 'from-orange-500 to-red-600',
      bullet: 'bg-orange-500',
      features: 'bg-orange-50',
      hover: 'hover:bg-orange-600'
    };
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName.toLowerCase());
    setActiveTab(categoryName.toLowerCase());
    if (categoryName === 'Broadband') {
      setFilters({
        mainCategory: 'Broadband',
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
    } else {
      setFilters({
        mainCategory: categoryName,
        subCategory: 'all',
        subSubCategory: 'all',
        searchTerm: ''
      });
    }
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    setSelectedCategory(tabValue);
    if (tabValue === 'broadband') {
      setFilters({
        mainCategory: 'Broadband',
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
    } else if (tabValue === 'peo-tv') {
      setFilters({
        mainCategory: 'PEO-TV',
        subCategory: 'all',
        subSubCategory: 'all',
        searchTerm: ''
      });
      setPeoTvFilters({
        subCategory: 'all'
      });
    }
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
      {/* Header */}
      <header className="bg-gradient-to-r from-white/90 via-blue-50/50 to-purple-50/50 backdrop-blur-md border-b border-white/20 shadow-lg shadow-blue-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/slt-log.jpg" 
                alt="SLT Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/30 text-gray-700 hover:bg-white/20 hover:border-white/50 transition-all duration-300 px-4 py-2 backdrop-blur-sm bg-white/10 rounded-xl font-medium"
              >
                <Search className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gradient-to-r from-white/80 via-blue-50/30 to-purple-50/30 backdrop-blur-md border-b border-white/20 sticky top-0 z-30 shadow-lg shadow-blue-500/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-2xl">
              <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-white/20">
                <TabsTrigger 
                  value="broadband" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Wifi className="w-4 h-4" />
                  Broadband
                </TabsTrigger>
                <TabsTrigger 
                  value="peo-tv" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Tv className="w-4 h-4" />
                  PEO-TV
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
            <span>{activeTab === 'broadband' ? 'Broadband' : activeTab === 'peo-tv' ? 'PEO-TV' : activeTab}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeTab === 'broadband' ? 'Broadband Packages' :
             activeTab === 'peo-tv' ? 'PEO-TV Packages' : 'Products'}
          </h1>
        </div>

        {/* PEO-TV Specific Filters */}
        {activeTab === 'peo-tv' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700">Filter By:</span>
              
              {/* Sub-Category Filter */}
              <Select 
                value={peoTvFilters.subCategory} 
                onValueChange={(value) => setPeoTvFilters(prev => ({ ...prev, subCategory: value }))}
              >
                <SelectTrigger className="w-48 bg-orange-600 text-white border-orange-600 rounded-full">
                  <SelectValue placeholder="Sub-Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All PEO-TV Packages</SelectItem>
                  <SelectItem value="peocharges">PEO Charges</SelectItem>
                  <SelectItem value="peopackages">PEO Packages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Broadband Specific Filters */}
        {activeTab === 'broadband' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700">Filter By:</span>
              
              {/* Connection Type Filter */}
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

              {/* Package Usage Type Filter */}
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

              {/* Package Type Filter */}
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
        ) : (
          // Always show grouped display for broadband category
          (activeTab === 'broadband') ? (
            <div className="space-y-10 max-w-6xl mx-auto">
              {/* Group 1: Data/PEOTV & Voice Packages */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Tv className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Data/PEOTV & Voice Packages</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'peotv').map((offering) => {
                    const price = getOfferingPrice(offering);
                    const category = getOfferingCategory(offering);
                    const specs = getOfferingSpecs(offering);
                    return (
                      <Card key={offering.id} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white border-0 shadow-xl shadow-blue-500/10 rounded-2xl max-w-xs flex flex-col">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold">{offering.name}</h3>
                            <Badge className="bg-green-500 text-white border-0 text-xs font-semibold">ACTIVE</Badge>
                          </div>
                          <p className="text-xs text-blue-100 opacity-90">{offering.description || 'No description available'}</p>
                        </div>
                        <div className="p-3 bg-white flex-1">
                          <div className="mb-3"><Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm">{getOfferingCategory(offering).toUpperCase()}</Badge></div>
                          <div className="space-y-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <div className="text-xs text-gray-600 mb-1">Connection Type</div>
                              <div className="text-base font-bold text-gray-900">{specs.connectionType}</div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">Package Type</span><span className="text-sm text-gray-900 font-semibold">{specs.packageType}</span></div>
                            {(offering as any).customAttributes && (offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance') && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">Data Bundle</span><span className="text-sm text-gray-900 font-semibold">{(offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance')?.value || 'N/A'}</span></div>
                            )}
                          </div>
                          {(offering as any).customAttributes && (offering as any).customAttributes.length > 0 && (
                            <div className="space-y-2">{(offering as any).customAttributes.filter((attr: any) => !['Connection Type', 'Package Type', 'Data Allowance'].includes(attr.name)).map((attr: any, index: number) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">{attr.name}</span><span className="text-sm text-gray-900 font-semibold">{attr.value}</span></div>
                            ))}</div>
                          )}
                        </div>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 mt-auto">
                          <div className="text-center mb-2"><div className="text-xs text-blue-100 mb-1">Monthly Rental</div><div className="text-2xl font-bold">{price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}</div></div>
                          <Button variant="ghost" size="sm" onClick={() => handleViewSpec(offering)} className="w-full text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm">Connection Speed & Terms &gt;</Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>

              {/* Group 2: Data Packages */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Data Packages</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataPackages').map((offering) => {
                    const price = getOfferingPrice(offering);
                    const category = getOfferingCategory(offering);
                    const specs = getOfferingSpecs(offering);
                    return (
                      <Card key={offering.id} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white border-0 shadow-xl shadow-blue-500/10 rounded-2xl max-w-xs flex flex-col">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3">
                          <div className="flex items-center justify-between mb-1"><h3 className="text-lg font-bold">{offering.name}</h3><Badge className="bg-green-500 text-white border-0 text-xs font-semibold">ACTIVE</Badge></div>
                          <p className="text-xs text-blue-100 opacity-90">{offering.description || 'No description available'}</p>
                        </div>
                        <div className="p-3 bg-white flex-1">
                          <div className="mb-3"><Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm">{getOfferingCategory(offering).toUpperCase()}</Badge></div>
                          <div className="space-y-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg"><div className="text-xs text-gray-600 mb-1">Connection Type</div><div className="text-base font-bold text-gray-900">{specs.connectionType}</div></div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">Package Type</span><span className="text-sm text-gray-900 font-semibold">{specs.packageType}</span></div>
                            {(offering as any).customAttributes && (offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance') && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">Data Bundle</span><span className="text-sm text-gray-900 font-semibold">{(offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance')?.value || 'N/A'}</span></div>
                            )}
                          </div>
                          {(offering as any).customAttributes && (offering as any).customAttributes.length > 0 && (
                            <div className="space-y-2">{(offering as any).customAttributes.filter((attr: any) => !['Connection Type', 'Package Type', 'Data Allowance'].includes(attr.name)).map((attr: any, index: number) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">{attr.name}</span><span className="text-sm text-gray-900 font-semibold">{attr.value}</span></div>
                            ))}</div>
                          )}
                        </div>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 mt-auto"><div className="text-center mb-2"><div className="text-xs text-blue-100 mb-1">Monthly Rental</div><div className="text-2xl font-bold">{price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}</div></div><Button variant="ghost" size="sm" onClick={() => handleViewSpec(offering)} className="w-full text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm">Connection Speed & Terms &gt;</Button></div>
                      </Card>
                    );
                  })}
                </div>
              </section>

              {/* Group 3: Data & Voice */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Data & Voice</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataAndVoice').map((offering) => {
                    const price = getOfferingPrice(offering);
                    const category = getOfferingCategory(offering);
                    const specs = getOfferingSpecs(offering);
                    return (
                      <Card key={offering.id} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white border-0 shadow-xl shadow-blue-500/10 rounded-2xl max-w-xs flex flex-col">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3"><div className="flex items-center justify-between mb-1"><h3 className="text-lg font-bold">{offering.name}</h3><Badge className="bg-green-500 text-white border-0 text-xs font-semibold">ACTIVE</Badge></div><p className="text-xs text-blue-100 opacity-90">{offering.description || 'No description available'}</p></div>
                        <div className="p-3 bg-white flex-1">
                          <div className="mb-3"><Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm">{getOfferingCategory(offering).toUpperCase()}</Badge></div>
                          <div className="space-y-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg"><div className="text-xs text-gray-600 mb-1">Connection Type</div><div className="text-base font-bold text-gray-900">{specs.connectionType}</div></div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">Package Type</span><span className="text-sm text-gray-900 font-semibold">{specs.packageType}</span></div>
                            {(offering as any).customAttributes && (offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance') && (<div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">Data Bundle</span><span className="text-sm text-gray-900 font-semibold">{(offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance')?.value || 'N/A'}</span></div>)}
                          </div>
                          {(offering as any).customAttributes && (offering as any).customAttributes.length > 0 && (
                            <div className="space-y-2">{(offering as any).customAttributes.filter((attr: any) => !['Connection Type', 'Package Type', 'Data Allowance'].includes(attr.name)).map((attr: any, index: number) => (<div key={index} className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm font-medium text-gray-600">{attr.name}</span><span className="text-sm text-gray-900 font-semibold">{attr.value}</span></div>))}</div>
                          )}
                        </div>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 mt-auto"><div className="text-center mb-2"><div className="text-xs text-blue-100 mb-1">Monthly Rental</div><div className="text-2xl font-bold">{price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}</div></div><Button variant="ghost" size="sm" onClick={() => handleViewSpec(offering)} className="w-full text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm">Connection Speed & Terms &gt;</Button></div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : activeTab === 'peo-tv' ? (
            // PEO-TV specific display
            <div className="space-y-10 max-w-6xl mx-auto">
              {peoTvFilters.subCategory === 'all' ? (
                // Grouped display when "All PEO-TV Packages" is selected
                <>
                  {/* PEO Packages Section */}
                  {filteredOfferings.filter(o => getPeoTvSubCategoryGroup(o) === 'peopackages').length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                          <Tv className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">PEO Packages</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOfferings.filter(o => getPeoTvSubCategoryGroup(o) === 'peopackages').map((offering) => {
                          const price = getOfferingPrice(offering);
                          const category = getOfferingCategory(offering);
                          const specs = getOfferingSpecs(offering);
                          const colors = getPeoPackageColors(offering);
                          
                          // Extract features and includes from custom attributes
                          const features = (offering as any).customAttributes?.find((attr: any) => 
                            attr.name.toLowerCase().includes('feature') || attr.name.toLowerCase().includes('service')
                          )?.value || '';
                          const includes = (offering as any).customAttributes?.find((attr: any) => 
                            attr.name.toLowerCase().includes('include') || attr.name.toLowerCase().includes('equipment')
                          )?.value || '';
                          
                          return (
                            <Card key={offering.id} className={`hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white border-0 shadow-xl ${colors.shadow} rounded-2xl max-w-xs flex flex-col`}>
                              <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <Tv className="w-6 h-6 text-white" />
                                  </div>
                                  <Badge className="bg-green-500 text-white border-0 text-xs font-semibold">ACTIVE</Badge>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{offering.name}</h3>
                                <p className="text-xs text-white/80 opacity-90 mb-3">{offering.description || 'No description available'}</p>
                              </div>

                              <div className="p-4 bg-white flex-1">
                                <div className="mb-3">
                                  <Badge variant="outline" className={`bg-gradient-to-r ${colors.badge} text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
                                    PEO-TV
                                  </Badge>
                                </div>
                                
                                {/* Key features */}
                                {features && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features</h4>
                                    <div className={`${colors.features} p-3 rounded text-sm text-gray-600`}>
                                      {features}
                                    </div>
                                  </div>
                                )}

                                {/* Included equipment */}
                                {includes && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Included Equipment</h4>
                                    <div className="space-y-1">
                                      {includes.split(',').map((item: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <div className={`w-1.5 h-1.5 ${colors.bullet} rounded-full`}></div>
                                          <span className="text-sm text-gray-600">{item.trim()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Other custom attributes */}
                                {(offering as any).customAttributes && (offering as any).customAttributes.length > 0 && (
                                  <div className="space-y-2">
                                    {(offering as any).customAttributes
                                      .filter((attr: any) => 
                                        !['Connection Type', 'Package Type', 'Data Allowance'].includes(attr.name) &&
                                        !attr.name.toLowerCase().includes('feature') &&
                                        !attr.name.toLowerCase().includes('include') &&
                                        !attr.name.toLowerCase().includes('equipment') &&
                                        attr.name.trim() !== '' &&
                                        attr.value.trim() !== ''
                                      )
                                      .map((attr: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                          <span className="text-sm font-medium text-gray-600">{attr.name}</span>
                                          <span className="text-sm text-gray-900 font-semibold">{attr.value}</span>
                                        </div>
                                      ))
                                    }
                                  </div>
                                )}
                              </div>

                              <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4`}>
                                <div className="text-center mb-2">
                                  <div className="text-xs text-white/80 mb-1">Monthly Rental</div>
                                  <div className="text-2xl font-bold">
                                    {price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleViewSpec(offering)}
                                  className={`w-full text-white ${colors.hover} hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm`}
                                >
                                  View Details &gt;
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* PEO Charges Section */}
                  {filteredOfferings.filter(o => getPeoTvSubCategoryGroup(o) === 'peocharges').length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                          <Tv className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">PEO Charges</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                      </div>
                      <div className="space-y-6 max-w-4xl mx-auto">
                        {filteredOfferings.filter(o => getPeoTvSubCategoryGroup(o) === 'peocharges').map((offering) => {
                          const price = getOfferingPrice(offering);
                          const category = getOfferingCategory(offering);
                          const specs = getOfferingSpecs(offering);
                          
                          // Extract features and includes from custom attributes
                          const features = (offering as any).customAttributes?.find((attr: any) => 
                            attr.name.toLowerCase().includes('feature') || attr.name.toLowerCase().includes('service')
                          )?.value || '';
                          const includes = (offering as any).customAttributes?.find((attr: any) => 
                            attr.name.toLowerCase().includes('include') || attr.name.toLowerCase().includes('equipment')
                          )?.value || '';
                          
                          return (
                            <Card key={offering.id} className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white border-0 shadow-xl shadow-orange-500/10 rounded-2xl">
                              {/* Top Header - Orange Background */}
                              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3">
                                <div className="flex items-center justify-center relative">
                                  <div className="absolute left-0">
                                    <Badge className="bg-green-500 text-white border-0 text-xs font-semibold px-2 py-1 rounded-full">
                                      ACTIVE
                                    </Badge>
                                  </div>
                                  <h3 className="text-xl font-bold text-center">{offering.name}</h3>
                                </div>
                              </div>

                              {/* Main Content Area - White Background */}
                              <div className="p-3 bg-white">
                                <div className="flex items-center gap-4 h-44">
                                  {/* Left Column - PEO-TV Text and Icon */}
                                  <div className="flex flex-col items-center gap-1 ml-6">
                                    <h3 className="text-2xl font-bold text-gray-900">PEOTV</h3>
                                    <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
                                      <Tv className="w-8 h-8 text-white" />
                                    </div>
                                  </div>

                                  {/* Middle Column - Features and Equipment */}
                                  <div className="flex-1 space-y-3 pl-40">
                                    {/* Description */}
                                    <p className="text-gray-700 text-sm font-bold -mt-2">
                                      {offering.description || 'Applicable for existing Fibre or Megaline connections'}
                                    </p>

                                    {/* Key Features */}
                                    {features && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Key Features</h4>
                                        <div className="bg-gray-100 border border-gray-300 rounded p-2 w-fit">
                                          <p className="text-gray-700 text-sm">{features}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Included Equipment */}
                                    {includes && (
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Included Equipment</h4>
                                        <p className="text-gray-700 text-sm">{includes}</p>
                                      </div>
                                    )}

                                    {/* Other custom attributes */}
                                    {(offering as any).customAttributes && (offering as any).customAttributes.length > 0 && (
                                      <div className="space-y-1">
                                        {(offering as any).customAttributes
                                          .filter((attr: any) => 
                                            !['Connection Type', 'Package Type', 'Data Allowance'].includes(attr.name) &&
                                            !attr.name.toLowerCase().includes('feature') &&
                                            !attr.name.toLowerCase().includes('include') &&
                                            !attr.name.toLowerCase().includes('equipment') &&
                                            attr.name.trim() !== '' &&
                                            attr.value.trim() !== ''
                                          )
                                          .map((attr: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                                              <span className="text-gray-600 font-medium text-xs">{attr.name}</span>
                                              <span className="text-gray-900 font-semibold text-xs">{attr.value}</span>
                                            </div>
                                          ))
                                        }
                                      </div>
                                    )}
                                  </div>

                                  {/* Right Column - Pricing Badge */}
                                  <div className="flex flex-col items-center justify-center mr-8">
                                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex flex-col items-center justify-center text-white shadow-lg">
                                      <div className="text-sm font-medium mb-1">Monthly</div>
                                      <div className="text-lg font-bold">
                                        {price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Action Bar - Orange Background */}
                              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3">
                                <div className="flex gap-3">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewSpec(offering)}
                                    className="flex-1 text-white hover:bg-orange-600 hover:text-white transition-all duration-200 rounded-lg py-2 font-medium border border-white/20"
                                  >
                                    View Details
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewSpec(offering)}
                                    className="flex-1 text-white hover:bg-orange-600 hover:text-white transition-all duration-200 rounded-lg py-2 font-medium border border-white/20"
                                  >
                                    View Channels
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                // Single grid display when specific filter is selected
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                      <Tv className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">PEO-TV Packages</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOfferings.map((offering) => {
                  const price = getOfferingPrice(offering);
                  const category = getOfferingCategory(offering);
                  const specs = getOfferingSpecs(offering);
                  const colors = getPeoPackageColors(offering);
                  
                  // Extract features and includes from custom attributes
                  const features = (offering as any).customAttributes?.find((attr: any) => 
                    attr.name.toLowerCase().includes('feature') || attr.name.toLowerCase().includes('service')
                  )?.value || '';
                  const includes = (offering as any).customAttributes?.find((attr: any) => 
                    attr.name.toLowerCase().includes('include') || attr.name.toLowerCase().includes('equipment')
                  )?.value || '';
                  
                  return (
                    <Card key={offering.id} className={`hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white border-0 shadow-xl ${colors.shadow} rounded-2xl max-w-xs flex flex-col`}>
                      <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Tv className="w-6 h-6 text-white" />
                          </div>
                          <Badge className="bg-green-500 text-white border-0 text-xs font-semibold">ACTIVE</Badge>
                        </div>
                        <h3 className="text-lg font-bold mb-2">{offering.name}</h3>
                        <p className="text-xs text-white/80 opacity-90 mb-3">{offering.description || 'No description available'}</p>
                      </div>

                      <div className="p-4 bg-white flex-1">
                        <div className="mb-3">
                          <Badge variant="outline" className={`bg-gradient-to-r ${colors.badge} text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
                            PEO-TV
                          </Badge>
                        </div>
                        
                        {/* Key features */}
                        {features && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features</h4>
                            <div className={`${colors.features} p-3 rounded text-sm text-gray-600`}>
                              {features}
                            </div>
                          </div>
                        )}

                        {/* Included equipment */}
                        {includes && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Included Equipment</h4>
                            <div className="space-y-1">
                              {includes.split(',').map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 ${colors.bullet} rounded-full`}></div>
                                  <span className="text-sm text-gray-600">{item.trim()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Other custom attributes */}
                        {(offering as any).customAttributes && (offering as any).customAttributes.length > 0 && (
                          <div className="space-y-2">
                            {(offering as any).customAttributes
                              .filter((attr: any) => 
                                !['Connection Type', 'Package Type', 'Data Allowance'].includes(attr.name) &&
                                !attr.name.toLowerCase().includes('feature') &&
                                !attr.name.toLowerCase().includes('include') &&
                                !attr.name.toLowerCase().includes('equipment') &&
                                attr.name.trim() !== '' &&
                                attr.value.trim() !== ''
                              )
                              .map((attr: any, index: number) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                  <span className="text-sm font-medium text-gray-600">{attr.name}</span>
                                  <span className="text-sm text-gray-900 font-semibold">{attr.value}</span>
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>

                      <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4`}>
                        <div className="text-center mb-2">
                          <div className="text-xs text-white/80 mb-1">Monthly Rental</div>
                          <div className="text-2xl font-bold">
                            {price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewSpec(offering)}
                          className={`w-full text-white ${colors.hover} hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm`}
                        >
                          View Details &gt;
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                  </div>
                </section>
              )}
            </div>
          ) : (
            // Regular grid display for other categories
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredOfferings.map((offering) => {
                const price = getOfferingPrice(offering);
                const category = getOfferingCategory(offering);
                const specs = getOfferingSpecs(offering);
                
                return (
                                 <Card key={offering.id} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-white border-0 shadow-xl shadow-blue-500/10 rounded-2xl max-w-xs flex flex-col">
                    {/* Top Header - Dark Blue */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold">{offering.name}</h3>
                        <Badge className="bg-green-500 text-white border-0 text-xs font-semibold">
                          ACTIVE
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-100 opacity-90">
                        {offering.description || 'No description available'}
                      </p>
                    </div>

                    {/* Middle Section - White Background */}
                    <div className="p-3 bg-white flex-1">
                      {/* Main Category Badge */}
                      <div className="mb-3">
                        <Badge 
                          variant="outline" 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm"
                        >
                          {getOfferingCategory(offering).toUpperCase()}
                        </Badge>
                      </div>

                      {/* Key Specifications */}
                      <div className="space-y-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Connection Type</div>
                          <div className="text-base font-bold text-gray-900">{specs.connectionType}</div>
                        </div>
                       
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Package Type</span>
                          <span className="text-sm text-gray-900 font-semibold">{specs.packageType}</span>
                        </div>

                        {/* Data Bundle - if available */}
                        {(offering as any).customAttributes && (offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance') && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Data Bundle</span>
                            <span className="text-sm text-gray-900 font-semibold">
                              {(offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance')?.value || 'N/A'}
                            </span>
                          </div>
                        )}
                     </div>

                     {/* Other Custom Attributes */}
                     {(offering as any).customAttributes && (offering as any).customAttributes.length > 0 && (
                       <div className="space-y-2">
                         {(offering as any).customAttributes
                           .filter((attr: any) => 
                             !['Connection Type', 'Package Type', 'Data Allowance'].includes(attr.name)
                           )
                           .map((attr: any, index: number) => (
                             <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                               <span className="text-sm font-medium text-gray-600">{attr.name}</span>
                               <span className="text-sm text-gray-900 font-semibold">{attr.value}</span>
                             </div>
                           ))
                         }
                       </div>
                     )}
                 </div>
                    {/* Bottom Section - Dark Blue Footer */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 mt-auto">
                      <div className="text-center mb-2">
                        <div className="text-xs text-blue-100 mb-1">Monthly Rental</div>
                        <div className="text-2xl font-bold">
                          {price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}
                        </div>
                      </div>
                     
                      <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => handleViewSpec(offering)}
                         className="w-full text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm"
                       >
                         Connection Speed & Terms &gt;
                       </Button>
                   </div>
                 </Card>
              );
            })}
            </div>
          )
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
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

              {/* Description */}
              {selectedOffering.description && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{selectedOffering.description}</p>
                  </div>
                </div>
              )}

              {/* Connection Type & Package Type */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection & Package Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Connection Type:</span>
                    <span className="text-gray-900">{getOfferingSpecs(selectedOffering).connectionType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Package Type:</span>
                    <span className="text-gray-900">{getOfferingSpecs(selectedOffering).packageType}</span>
                  </div>
                </div>
              </div>

               {/* Custom Attributes */}
               {(selectedOffering as any).customAttributes && (selectedOffering as any).customAttributes.length > 0 ? (
                 <div className="bg-white rounded-lg border border-gray-200 p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Attributes</h3>
                   <div className="space-y-3">
                     {(selectedOffering as any).customAttributes.map((attr: any, index: number) => (
                       <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                         <span className="font-medium text-gray-700">{attr.name}:</span>
                         <span className="text-gray-900">{attr.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ) : null}

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
