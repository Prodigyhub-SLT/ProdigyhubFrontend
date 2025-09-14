import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Package, Wifi, Eye, Filter, X, Tv, BookOpen } from 'lucide-react';
import { productCatalogApi } from '@/lib/api';
import { ProductOffering } from '../../shared/product-order-types';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerPackagesTab() {
  const { user } = useAuth();
  const [offerings, setOfferings] = useState<ProductOffering[]>([]);
  const [filteredOfferings, setFilteredOfferings] = useState<ProductOffering[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    connectionType: 'all',
    packageUsageType: 'all',
    packageType: 'all',
    dataBundle: 'all',
    searchTerm: ''
  });

  // Spec view modal state
  const [isSpecViewOpen, setIsSpecViewOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<ProductOffering | null>(null);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Debug: Log success message changes
  useEffect(() => {
    console.log('📢 Success message changed:', successMessage);
  }, [successMessage]);

  useEffect(() => {
    loadOfferings();
  }, []);

  useEffect(() => {
    filterOfferings();
  }, [offerings, filters]);

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
    
    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(offering =>
        offering.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        offering.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filter by Connection Type
    if (filters.connectionType !== 'all') {
      filtered = filtered.filter(offering => {
        const categoryDescription = (offering as any).categoryDescription || '';
        let matches = false;
        
        if (filters.connectionType === 'Data/PEOTV & Voice Packages') {
          matches = categoryDescription.includes('PEOTV');
        } else if (filters.connectionType === 'Data Packages') {
          const isTechData = categoryDescription.includes('4G') || categoryDescription.includes('ADSL');
          const isExplicitDataPackages = categoryDescription.includes('Data Packages');
          matches = (isExplicitDataPackages || isTechData) && !categoryDescription.includes('PEOTV');
        } else if (filters.connectionType === 'Data & Voice') {
          const isFiber = categoryDescription.includes('Fiber') || categoryDescription.includes('Fibre');
          const isDataPackages = categoryDescription.includes('Data Packages');
          matches = isFiber && !categoryDescription.includes('PEOTV') && !isDataPackages;
        }
        
        return matches;
      });
    }

    // Filter by Package Usage Type
    if (filters.packageUsageType !== 'all') {
      filtered = filtered.filter(offering => {
        const categoryDescription = (offering as any).categoryDescription || '';
        let matches = false;
        
        if (filters.packageUsageType === 'Any Time') {
          matches = categoryDescription.includes('Any Time') || categoryDescription.includes('Anytime');
        } else if (filters.packageUsageType === 'Time Based') {
          matches = categoryDescription.includes('Time Based');
        } else if (filters.packageUsageType === 'Unlimited') {
          matches = categoryDescription.includes('Unlimited');
        }
        
        return matches;
      });
    }

    // Filter by Package Type
    if (filters.packageType !== 'all') {
      filtered = filtered.filter(offering => {
        const categoryDescription = (offering as any).categoryDescription || '';
        return categoryDescription.includes(filters.packageType);
      });
    }

    // Filter by Data Bundle
    if (filters.dataBundle !== 'all') {
      filtered = filtered.filter(offering => {
        const categoryDescription = (offering as any).categoryDescription || '';
        return categoryDescription.includes(filters.dataBundle);
      });
    }

    setFilteredOfferings(filtered);
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

  const resetFilters = () => {
    setFilters({
      connectionType: 'all',
      packageUsageType: 'all',
      packageType: 'all',
      dataBundle: 'all',
      searchTerm: ''
    });
  };

  const handleViewSpec = (offering: ProductOffering) => {
    setSelectedOffering(offering);
    setIsSpecViewOpen(true);
  };

  const handleUpgrade = async (offering: ProductOffering) => {
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      
      // Debug: Log user data
      console.log('🔍 User data in handleUpgrade:', {
        user: user,
        name: user?.name,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        nic: user?.nic,
        profile: user?.profile
      });
      
      // Always fetch complete user data from MongoDB using email lookup
      let userData = user;
      if (user && user.email) {
        try {
          const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          console.log('🔍 Looking up user by email:', user.email);
          
          const response = await fetch(`${backendURL}/users/email/${encodeURIComponent(user.email)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const mongoUserData = await response.json();
            console.log('✅ Fetched complete MongoDB user data:', mongoUserData);
            
            // Use the complete user data from MongoDB
            userData = {
              ...user,
              // Use MongoDB data for all fields
              name: mongoUserData.firstName && mongoUserData.lastName 
                ? `${mongoUserData.firstName} ${mongoUserData.lastName}`.trim()
                : user.name,
              firstName: mongoUserData.firstName,
              lastName: mongoUserData.lastName,
              phoneNumber: mongoUserData.phoneNumber || '',
              nic: mongoUserData.nic || '',
              address: mongoUserData.address,
              profile: {
                ...user.profile,
                phone: mongoUserData.phoneNumber || '',
                nic: mongoUserData.nic || '',
              }
            };
          } else {
            console.warn('Failed to fetch user data from MongoDB, using existing data');
          }
        } catch (error) {
          console.warn('Failed to fetch user profile from MongoDB:', error);
        }
      }
      
      // Import the order creation API
      const { createOrderWithRetry } = await import('@/lib/api');
      
      // Create order data with complete user information
      const orderData = {
        category: 'B2C product order',
        description: `Package upgrade request for ${offering.name} by ${userData?.name || 'Customer'}`,
        priority: '2', // High priority for upgrades
        productOrderItem: [{
          action: 'add' as const,
          quantity: 1,
          productOffering: {
            id: offering.id,
            name: offering.name,
            '@type': 'ProductOfferingRef'
          }
        }],
        relatedParty: userData ? [{
          id: userData.id || userData.uid || 'unknown',
          name: userData.name || 'Unknown User',
          role: 'customer',
          '@type': 'RelatedParty'
        }] : [],
        // Store complete customer details in the custom field
        customerDetails: userData ? {
          name: userData.name || 'Unknown',
          email: userData.email || '',
          phone: userData.phoneNumber || userData.profile?.phone || '',
          nic: userData.nic || userData.profile?.nic || '',
          id: userData.id || userData.uid || 'unknown',
          // Add additional details
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          address: userData.address || null
        } : undefined,
        note: [{
          text: `Customer upgrade request for ${offering.name}. Customer: ${userData?.name || 'Unknown'} (${userData?.email || 'No email'})`,
          author: 'Customer',
          date: new Date().toISOString(),
          '@type': 'Note'
        }],
        '@type': 'ProductOrder'
      };

      // Create the order
      const order = await createOrderWithRetry(orderData);
      
      // Show success message
      const successMsg = `Upgrade order created successfully! Order ID: ${order.id}`;
      console.log('🎉 Setting success message:', successMsg);
      setSuccessMessage(successMsg);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        console.log('🕐 Auto-hiding success message');
        setSuccessMessage(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error creating upgrade order:', error);
      setSuccessMessage('Failed to create upgrade order. Please try again.');
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } finally {
      console.log('🏁 Finally block - setting loading to false');
      setIsLoading(false);
    }
  };

  const closeSpecView = () => {
    setIsSpecViewOpen(false);
    setSelectedOffering(null);
  };

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className={`p-4 rounded-lg border ${
          successMessage.includes('successfully') 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{successMessage}</span>
            <button
              onClick={() => {
                console.log('❌ Manually closing success message');
                setSuccessMessage(null);
              }}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Debug: Show success message state */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          Debug - Success Message: {successMessage || 'null'} | Loading: {isLoading ? 'true' : 'false'}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Broadband Packages</h2>
        
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700">Filter By:</span>
            
            {/* Connection Type Filter */}
            <Select 
              value={filters.connectionType} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, connectionType: value }))}
            >
              <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                <SelectValue placeholder="All Connection Types" />
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
              value={filters.packageUsageType} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, packageUsageType: value }))}
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
              value={filters.packageType} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, packageType: value }))}
            >
              <SelectTrigger className="w-48 bg-blue-600 text-white border-blue-600 rounded-full">
                <SelectValue placeholder="All Package Types" />
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
              value={filters.dataBundle} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dataBundle: value }))}
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

            {/* Reset Button */}
            {(filters.connectionType !== 'all' || filters.packageUsageType !== 'all' || 
              filters.packageType !== 'all' || filters.searchTerm !== '' || filters.dataBundle !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading packages...</p>
          </div>
        ) : filteredOfferings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-10 max-w-6xl mx-auto">
            {/* Group 1: Data/PEOTV & Voice Packages */}
            {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'peotv').length > 0 && (
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
                          <div className="mb-3">
                            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                              {getOfferingCategory(offering).toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <div className="text-xs text-gray-600 mb-1">Connection Type</div>
                              <div className="text-base font-bold text-gray-900">{specs.connectionType}</div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">Package Type</span>
                              <span className="text-sm text-gray-900 font-semibold">{specs.packageType}</span>
                            </div>
                            {(offering as any).customAttributes && (offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance') && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Data Bundle</span>
                                <span className="text-sm text-gray-900 font-semibold">
                                  {(offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance')?.value || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
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
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 mt-auto">
                          <div className="text-center mb-2">
                            <div className="text-xs text-blue-100 mb-1">Monthly Rental</div>
                            <div className="text-2xl font-bold">
                              {price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewSpec(offering)}
                              className="flex-1 text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm"
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleUpgrade(offering)}
                              disabled={isLoading}
                              className="flex-1 text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? 'Processing...' : 'Upgrade'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Group 2: Data Packages */}
            {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataPackages').length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
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
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold">{offering.name}</h3>
                            <Badge className="bg-green-500 text-white border-0 text-xs font-semibold">ACTIVE</Badge>
                          </div>
                          <p className="text-xs text-blue-100 opacity-90">{offering.description || 'No description available'}</p>
                        </div>
                        <div className="p-3 bg-white flex-1">
                          <div className="mb-3">
                            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                              {getOfferingCategory(offering).toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <div className="text-xs text-gray-600 mb-1">Connection Type</div>
                              <div className="text-base font-bold text-gray-900">{specs.connectionType}</div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">Package Type</span>
                              <span className="text-sm text-gray-900 font-semibold">{specs.packageType}</span>
                            </div>
                            {(offering as any).customAttributes && (offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance') && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Data Bundle</span>
                                <span className="text-sm text-gray-900 font-semibold">
                                  {(offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance')?.value || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
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
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 mt-auto">
                          <div className="text-center mb-2">
                            <div className="text-xs text-blue-100 mb-1">Monthly Rental</div>
                            <div className="text-2xl font-bold">
                              {price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewSpec(offering)}
                              className="flex-1 text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm"
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleUpgrade(offering)}
                              disabled={isLoading}
                              className="flex-1 text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? 'Processing...' : 'Upgrade'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Group 3: Data & Voice */}
            {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataAndVoice').length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-white" />
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
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold">{offering.name}</h3>
                            <Badge className="bg-green-500 text-white border-0 text-xs font-semibold">ACTIVE</Badge>
                          </div>
                          <p className="text-xs text-blue-100 opacity-90">{offering.description || 'No description available'}</p>
                        </div>
                        <div className="p-3 bg-white flex-1">
                          <div className="mb-3">
                            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                              {getOfferingCategory(offering).toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <div className="text-xs text-gray-600 mb-1">Connection Type</div>
                              <div className="text-base font-bold text-gray-900">{specs.connectionType}</div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-600">Package Type</span>
                              <span className="text-sm text-gray-900 font-semibold">{specs.packageType}</span>
                            </div>
                            {(offering as any).customAttributes && (offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance') && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Data Bundle</span>
                                <span className="text-sm text-gray-900 font-semibold">
                                  {(offering as any).customAttributes.find((attr: any) => attr.name === 'Data Allowance')?.value || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
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
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 mt-auto">
                          <div className="text-center mb-2">
                            <div className="text-xs text-blue-100 mb-1">Monthly Rental</div>
                            <div className="text-2xl font-bold">
                              {price ? `${price.currency} ${price.amount.toLocaleString()}` : 'N/A'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewSpec(offering)}
                              className="flex-1 text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm"
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleUpgrade(offering)}
                              disabled={isLoading}
                              className="flex-1 text-white hover:bg-blue-700 hover:text-white transition-all duration-200 rounded-lg py-1.5 font-medium border border-white/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? 'Processing...' : 'Upgrade'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

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
