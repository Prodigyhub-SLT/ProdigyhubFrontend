import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Package, Wifi, Eye, Filter, X } from 'lucide-react';
import { productCatalogApi } from '@/lib/api';
import { ProductOffering } from '../../shared/product-order-types';

export default function CustomerPackagesTab() {
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
    try {
      if (!offering.productOfferingPrice || offering.productOfferingPrice.length === 0) {
        return null;
      }
      
      const price = offering.productOfferingPrice[0];
      return {
        currency: price.price?.dutyFreeAmount?.unit || 'LKR',
        amount: price.price?.dutyFreeAmount?.value || 0,
        period: 'per month'
      };
    } catch (error) {
      console.error('Error getting offering price:', error);
      return null;
    }
  };

  const getOfferingCategory = (offering: ProductOffering) => {
    try {
      if (!offering.productSpecification) {
        return 'Broadband';
      }
      
      return offering.productSpecification.name || 'Broadband';
    } catch (error) {
      console.error('Error getting offering category:', error);
      return 'Broadband';
    }
  };

  const getOfferingSpecs = (offering: ProductOffering) => {
    try {
      // Since we don't have detailed specs in the current data structure,
      // we'll extract information from the offering name and description
      const name = offering.name?.toLowerCase() || '';
      const description = offering.description?.toLowerCase() || '';
      
      // Try to determine connection type from name/description
      let connectionType = 'Broadband';
      if (name.includes('4g') || name.includes('lte')) {
        connectionType = '4G';
      } else if (name.includes('adsl')) {
        connectionType = 'ADSL';
      } else if (name.includes('fiber') || name.includes('fibre')) {
        connectionType = 'Fiber';
      }
      
      // Try to determine package type from name/description
      let packageType = 'Unlimited';
      if (name.includes('any time') || description.includes('any time')) {
        packageType = 'Any Time';
      } else if (name.includes('time based') || description.includes('time based')) {
        packageType = 'Time Based';
      }
      
      // Try to determine data allowance from name/description
      let dataAllowance = 'Unlimited';
      if (name.includes('40gb') || description.includes('40gb')) {
        dataAllowance = '40GB';
      } else if (name.includes('50gb') || description.includes('50gb')) {
        dataAllowance = '50GB';
      } else if (name.includes('85gb') || description.includes('85gb')) {
        dataAllowance = '85GB';
      } else if (name.includes('100gb') || description.includes('100gb')) {
        dataAllowance = '100GB';
      } else if (name.includes('115gb') || description.includes('115gb')) {
        dataAllowance = '115GB';
      } else if (name.includes('200gb') || description.includes('200gb')) {
        dataAllowance = '200GB';
      } else if (name.includes('400gb') || description.includes('400gb')) {
        dataAllowance = '400GB';
      }
      
      // Try to determine internet speed from name/description
      let internetSpeed = '300 Mbps';
      if (name.includes('8mbps') || description.includes('8mbps')) {
        internetSpeed = '8 Mbps';
      } else if (name.includes('10mbps') || description.includes('10mbps')) {
        internetSpeed = '10 Mbps';
      } else if (name.includes('25mbps') || description.includes('25mbps')) {
        internetSpeed = '25 Mbps';
      } else if (name.includes('100mbps') || description.includes('100mbps')) {
        internetSpeed = '100 Mbps';
      } else if (name.includes('1gbps') || description.includes('1gbps')) {
        internetSpeed = '1 Gbps';
      }

      return {
        connectionType,
        packageType,
        dataAllowance,
        data: dataAllowance,
        internetSpeed,
        voice: 'Unlimited Calls'
      };
    } catch (error) {
      console.error('Error getting offering specs:', error);
      return {
        connectionType: 'Broadband',
        packageType: 'Unlimited',
        dataAllowance: 'Unlimited',
        data: 'Unlimited',
        internetSpeed: '300 Mbps',
        voice: 'Unlimited Calls'
      };
    }
  };

  const getConnectionTypeGroup = (offering: ProductOffering) => {
    const specs = getOfferingSpecs(offering);
    const connectionType = specs.connectionType.toLowerCase();
    
    if (connectionType.includes('peotv')) {
      return 'dataAndPEOTV';
    } else if (connectionType.includes('4g') || connectionType.includes('adsl')) {
      return 'dataOnly';
    } else if (connectionType.includes('fiber') || connectionType.includes('fibre')) {
      return 'dataAndVoice';
    }
    
    return 'dataAndVoice';
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

  return (
    <div className="space-y-8">
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

            {/* Search Input */}
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search offerings..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="flex-1 max-w-xs"
              />
            </div>

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
          <div className="space-y-8">
            {/* Data/PEOTV & Voice Packages */}
            {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataAndPEOTV').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Data/PEOTV & Voice Packages</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataAndPEOTV').map((offering) => {
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
                              {specs.connectionType}
                            </span>
                          </div>
                          
                          {/* Specifications */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Connection Type:</span>
                              <span className="text-gray-900">{specs.connectionType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Package Type:</span>
                              <span className="text-gray-900">{specs.packageType || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Internet Speed:</span>
                              <span className="text-gray-900">{specs.internetSpeed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Data Allowance:</span>
                              <span className="text-gray-900">{specs.dataAllowance || specs.data}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Section */}
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
                                <div>Setup: {price.currency} {(offering as any).pricing?.setupFee?.toLocaleString() || '1,000'}</div>
                                <div>Security Deposit: {price.currency} {(offering as any).pricing?.deposit?.toLocaleString() || '100'}</div>
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
                              className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:shadow-md transition-all duration-200 rounded-lg px-6 py-2 font-medium"
                              onClick={() => {
                                setSelectedOffering(offering);
                                setIsSpecViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Data Packages */}
            {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataOnly').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Data Packages</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataOnly').map((offering) => {
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
                              {specs.connectionType}
                            </span>
                          </div>
                          
                          {/* Specifications */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Connection Type:</span>
                              <span className="text-gray-900">{specs.connectionType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Package Type:</span>
                              <span className="text-gray-900">{specs.packageType || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Internet Speed:</span>
                              <span className="text-gray-900">{specs.internetSpeed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Data Allowance:</span>
                              <span className="text-gray-900">{specs.dataAllowance || specs.data}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Section */}
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
                                <div>Setup: {price.currency} {(offering as any).pricing?.setupFee?.toLocaleString() || '1,000'}</div>
                                <div>Security Deposit: {price.currency} {(offering as any).pricing?.deposit?.toLocaleString() || '100'}</div>
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
                              className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:shadow-md transition-all duration-200 rounded-lg px-6 py-2 font-medium"
                              onClick={() => {
                                setSelectedOffering(offering);
                                setIsSpecViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Data & Voice */}
            {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataAndVoice').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Data & Voice</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOfferings.filter(o => getConnectionTypeGroup(o) === 'dataAndVoice').map((offering) => {
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
                              {specs.connectionType}
                            </span>
                          </div>
                          
                          {/* Specifications */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Connection Type:</span>
                              <span className="text-gray-900">{specs.connectionType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Package Type:</span>
                              <span className="text-gray-900">{specs.packageType || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Internet Speed:</span>
                              <span className="text-gray-900">{specs.internetSpeed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Data Allowance:</span>
                              <span className="text-gray-900">{specs.dataAllowance || specs.data}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Section */}
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
                                <div>Setup: {price.currency} {(offering as any).pricing?.setupFee?.toLocaleString() || '1,000'}</div>
                                <div>Security Deposit: {price.currency} {(offering as any).pricing?.deposit?.toLocaleString() || '100'}</div>
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
                              className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:shadow-md transition-all duration-200 rounded-lg px-6 py-2 font-medium"
                              onClick={() => {
                                setSelectedOffering(offering);
                                setIsSpecViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spec View Modal */}
      <Dialog open={isSpecViewOpen} onOpenChange={setIsSpecViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedOffering?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedOffering?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffering && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-900">{selectedOffering.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Category:</span>
                        <span className="text-gray-900">{getOfferingCategory(selectedOffering)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className="text-gray-900">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Connection Type:</span>
                        <span className="text-gray-900">{getOfferingSpecs(selectedOffering).connectionType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Package Type:</span>
                        <span className="text-gray-900">{getOfferingSpecs(selectedOffering).packageType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Internet Speed:</span>
                        <span className="text-gray-900">{getOfferingSpecs(selectedOffering).internetSpeed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Data Allowance:</span>
                        <span className="text-gray-900">{getOfferingSpecs(selectedOffering).dataAllowance}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Pricing Information</h4>
                    {getOfferingPrice(selectedOffering) && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {getOfferingPrice(selectedOffering)!.currency} {getOfferingPrice(selectedOffering)!.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-blue-600 mb-3">
                            {getOfferingPrice(selectedOffering)!.period}
                          </div>
                          <div className="text-xs space-y-1 text-blue-700">
                            <div>Setup: {getOfferingPrice(selectedOffering)!.currency} {(selectedOffering as any).pricing?.setupFee?.toLocaleString() || 'N/A'}</div>
                            <div>Security Deposit: {getOfferingPrice(selectedOffering)!.currency} {(selectedOffering as any).pricing?.deposit?.toLocaleString() || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">
                      {selectedOffering.description || 'No description available'}
                    </p>
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
