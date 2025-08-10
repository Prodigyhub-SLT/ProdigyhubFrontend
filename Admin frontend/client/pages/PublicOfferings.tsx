import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, DollarSign, Clock, Shield, ArrowRight, LogIn, ChevronDown, Wifi, Building, Smartphone, Cloud, Tv, Phone, Gamepad2, Globe, Gift, Eye, Edit, Trash2, Filter, X } from 'lucide-react';
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
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
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
    color: 'text-green-500',
    bgColor: 'bg-green-50',
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

  useEffect(() => {
    loadOfferings();
    // Set initial Broadband selection
    handleCategorySelect('Broadband');
  }, []);

  useEffect(() => {
    filterOfferings();
  }, [offerings, filters, broadbandFilters]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offeringsData = await productCatalogApi.getOfferings({ limit: 100 });
      const activeOfferings = offeringsData.filter(
        (offering: ProductOffering) => offering.lifecycleStatus === 'Active'
      );
      
      // If no offerings from API, add mock data for testing
      if (activeOfferings.length === 0) {
        const mockOfferings: ProductOffering[] = [
          {
            id: 'broadband-1',
            name: 'TRIO VIBE',
            description: '40GB Anytime Data & 40GB Anytime Upload + PEOTV 75 Channels + Unlimited',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-1',
              price: {
                taxIncludedAmount: { value: 3530, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-2',
            name: 'TRIO VIBE PLUS',
            description: '40GB Anytime Data & 40GB Anytime Upload + PEOTV 75 Channels + Unlimited',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-2',
              price: {
                taxIncludedAmount: { value: 4100, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-3',
            name: 'TRIO SHINE',
            description: '100GB Anytime Data & 100GB Anytime Upload + PEOTV 75 Channels + Unlimited',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-3',
              price: {
                taxIncludedAmount: { value: 4950, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-4',
            name: 'HBB ANYTIME 50GB',
            description: '50GB Anytime Data with 4G connection',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-4',
              price: {
                taxIncludedAmount: { value: 1290, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-5',
            name: 'ANY BEAT',
            description: '36GB Anytime Data with ADSL connection',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-5',
              price: {
                taxIncludedAmount: { value: 1550, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-6',
            name: 'HBB ANYTIME 85GB',
            description: '85GB Anytime Data with 4G connection',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-6',
              price: {
                taxIncludedAmount: { value: 1890, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-7',
            name: 'ANY FLIX',
            description: '50GB Anytime Data with Fiber connection',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-7',
              price: {
                taxIncludedAmount: { value: 2150, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-8',
            name: 'HBB ANYTIME 115GB',
            description: '115GB Anytime Data with 4G connection',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-8',
              price: {
                taxIncludedAmount: { value: 2590, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-9',
            name: 'ANY TIDE',
            description: '130GB Fiber + 100GB ADSL data',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-9',
              price: {
                taxIncludedAmount: { value: 3890, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-10',
            name: 'HBB ANYTIME 200GB',
            description: '200GB Anytime Data with 4G connection',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-10',
              price: {
                taxIncludedAmount: { value: 3990, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-11',
            name: 'HBB ANYTIME 400GB',
            description: '400GB Anytime Data with 4G connection',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-11',
              price: {
                taxIncludedAmount: { value: 7990, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-12',
            name: 'ULTRA FLASH PRIME',
            description: '200GB per day + unlimited Entertainment Bundle + Unlimited Calls',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-12',
              price: {
                taxIncludedAmount: { value: 75000, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any,
          {
            id: 'broadband-13',
            name: 'ULTRA PRIME',
            description: '5TB + unlimited Entertainment Bundle + Unlimited Calls',
            lifecycleStatus: 'Active',
            category: [{ name: 'Broadband', id: 'broadband' }],
            productOfferingPrice: [{
              id: 'price-13',
              price: {
                taxIncludedAmount: { value: 75000, unit: 'LKR' },
                priceType: 'recurring'
              }
            }],
            '@type': 'ProductOffering'
          } as any
        ];

        // Add hierarchical category data to mock offerings
        (mockOfferings[0] as any).subCategory = 'Connection Type';
        (mockOfferings[0] as any).subSubCategory = 'Data/PEOTV & Voice Packages';
        (mockOfferings[0] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data/PEOTV & Voice Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Any Time' },
          { subCategory: 'Package Type', subSubCategory: '4G' }
        ];
        
        (mockOfferings[1] as any).subCategory = 'Connection Type';
        (mockOfferings[1] as any).subSubCategory = 'Data/PEOTV & Voice Packages';
        (mockOfferings[1] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data/PEOTV & Voice Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Time Based' },
          { subCategory: 'Package Type', subSubCategory: 'ADSL' }
        ];
        
        (mockOfferings[2] as any).subCategory = 'Connection Type';
        (mockOfferings[2] as any).subSubCategory = 'Data/PEOTV & Voice Packages';
        (mockOfferings[2] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data/PEOTV & Voice Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Unlimited' },
          { subCategory: 'Package Type', subSubCategory: 'Fiber' }
        ];
        
        (mockOfferings[3] as any).subCategory = 'Connection Type';
        (mockOfferings[3] as any).subSubCategory = 'Data Packages';
        (mockOfferings[3] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Any Time' },
          { subCategory: 'Package Type', subSubCategory: '4G' }
        ];
        
        (mockOfferings[4] as any).subCategory = 'Connection Type';
        (mockOfferings[4] as any).subSubCategory = 'Data & Voice';
        (mockOfferings[4] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data & Voice' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Time Based' },
          { subCategory: 'Package Type', subSubCategory: 'ADSL' }
        ];

        (mockOfferings[5] as any).subCategory = 'Connection Type';
        (mockOfferings[5] as any).subSubCategory = 'Data Packages';
        (mockOfferings[5] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Any Time' },
          { subCategory: 'Package Type', subSubCategory: '4G' }
        ];

        (mockOfferings[6] as any).subCategory = 'Connection Type';
        (mockOfferings[6] as any).subSubCategory = 'Data Packages';
        (mockOfferings[6] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Any Time' },
          { subCategory: 'Package Type', subSubCategory: 'Fiber' }
        ];

        (mockOfferings[7] as any).subCategory = 'Connection Type';
        (mockOfferings[7] as any).subSubCategory = 'Data Packages';
        (mockOfferings[7] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Any Time' },
          { subCategory: 'Package Type', subSubCategory: '4G' }
        ];

        (mockOfferings[8] as any).subCategory = 'Connection Type';
        (mockOfferings[8] as any).subSubCategory = 'Data & Voice';
        (mockOfferings[8] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data & Voice' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Time Based' },
          { subCategory: 'Package Type', subSubCategory: 'Fiber' }
        ];

        (mockOfferings[9] as any).subCategory = 'Connection Type';
        (mockOfferings[9] as any).subSubCategory = 'Data Packages';
        (mockOfferings[9] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Any Time' },
          { subCategory: 'Package Type', subSubCategory: '4G' }
        ];

        (mockOfferings[10] as any).subCategory = 'Connection Type';
        (mockOfferings[10] as any).subSubCategory = 'Data Packages';
        (mockOfferings[10] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Any Time' },
          { subCategory: 'Package Type', subSubCategory: '4G' }
        ];

        (mockOfferings[11] as any).subCategory = 'Connection Type';
        (mockOfferings[11] as any).subSubCategory = 'Data/PEOTV & Voice Packages';
        (mockOfferings[11] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data/PEOTV & Voice Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Unlimited' },
          { subCategory: 'Package Type', subSubCategory: 'Fiber' }
        ];

        (mockOfferings[12] as any).subCategory = 'Connection Type';
        (mockOfferings[12] as any).subSubCategory = 'Data/PEOTV & Voice Packages';
        (mockOfferings[12] as any).broadbandSelections = [
          { subCategory: 'Connection Type', subSubCategory: 'Data/PEOTV & Voice Packages' },
          { subCategory: 'Package Usage Type', subSubCategory: 'Unlimited' },
          { subCategory: 'Package Type', subSubCategory: 'Fiber' }
        ];

        // Add pricing data
        mockOfferings.forEach((offering, index) => {
          (offering as any).pricing = {
            setupFee: 1000,
            deposit: 100
          };
        });

        setOfferings(mockOfferings);
      } else {
        setOfferings(activeOfferings);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOfferings = () => {
    let filtered = offerings;

    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(offering =>
        offering.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        offering.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filter by main category
    if (filters.mainCategory && filters.mainCategory !== 'all') {
      filtered = filtered.filter(offering => {
        const offeringCategory = getOfferingCategory(offering);
        return offeringCategory === filters.mainCategory;
      });
    }

    // Filter by sub-category
    if (filters.subCategory && filters.subCategory !== 'all') {
      filtered = filtered.filter(offering => {
        const offeringSubCategory = (offering as any).subCategory;
        return offeringSubCategory === filters.subCategory;
      });
    }

    // Filter by sub-sub-category
    if (filters.subSubCategory && filters.subSubCategory !== 'all') {
      filtered = filtered.filter(offering => {
        const offeringSubSubCategory = (offering as any).subSubCategory;
        return offeringSubSubCategory === filters.subSubCategory;
      });
    }

    // Broadband specific filters
    if (filters.mainCategory === 'Broadband') {
      // Filter by Connection Type (sub-sub-category under "Connection Type" sub-category)
      if (broadbandFilters.connectionType !== 'all') {
        filtered = filtered.filter(offering => {
          const offeringBroadbandSelections = (offering as any).broadbandSelections || [];
          // Check if any broadband selection has the matching connection type
          return offeringBroadbandSelections.some((selection: any) => 
            selection.subCategory === 'Connection Type' && 
            selection.subSubCategory === broadbandFilters.connectionType
          );
        });
      }

      // Filter by Package Usage Type (sub-sub-category under "Package Usage Type" sub-category)
      if (broadbandFilters.packageUsageType !== 'all') {
        filtered = filtered.filter(offering => {
          const offeringBroadbandSelections = (offering as any).broadbandSelections || [];
          // Check if any broadband selection has the matching package usage type
          return offeringBroadbandSelections.some((selection: any) => 
            selection.subCategory === 'Package Usage Type' && 
            selection.subSubCategory === broadbandFilters.packageUsageType
          );
        });
      }

      // Filter by Package Type (sub-sub-category under "Package Type" sub-category)
      if (broadbandFilters.packageType !== 'all') {
        filtered = filtered.filter(offering => {
          const offeringBroadbandSelections = (offering as any).broadbandSelections || [];
          // Check if any broadband selection has the matching package type
          return offeringBroadbandSelections.some((selection: any) => 
            selection.subCategory === 'Package Type' && 
            selection.subSubCategory === broadbandFilters.packageType
          );
        });
      }

      // Filter by Data Bundle (sub-sub-category under "Package Usage Type" sub-category)
      if (broadbandFilters.dataBundle !== 'all') {
        filtered = filtered.filter(offering => {
          const offeringBroadbandSelections = (offering as any).broadbandSelections || [];
          // Check if any broadband selection has the matching data bundle
          return offeringBroadbandSelections.some((selection: any) => 
            selection.subCategory === 'Package Usage Type' && 
            selection.subSubCategory === broadbandFilters.dataBundle
          );
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
    // Try to get actual specifications from the offering data
    const customAttributes = (offering as any).customAttributes || [];
    
    // Extract connection type from broadband selections first
    let connectionType = 'Data/PEOTV & Voice Packages'; // Default
    const broadbandSelections = (offering as any).broadbandSelections || [];
    const connectionTypeSelection = broadbandSelections.find((selection: any) => 
      selection.subCategory === 'Connection Type'
    );
    
    if (connectionTypeSelection) {
      connectionType = connectionTypeSelection.subSubCategory;
    } else {
      // Fallback to custom attributes or category
      const connectionTypeAttr = customAttributes.find((attr: any) => 
        attr.name.toLowerCase().includes('connection') || 
        attr.name.toLowerCase().includes('type')
      );
      connectionType = connectionTypeAttr?.value || getOfferingCategory(offering);
    }
    
    // Extract data information from custom attributes
    const dataAttr = customAttributes.find((attr: any) => 
      attr.name.toLowerCase().includes('data') || 
      attr.name.toLowerCase().includes('usage')
    );
    const data = dataAttr?.value || 'Unlimited';
    
    // Extract speed information from custom attributes
    const speedAttr = customAttributes.find((attr: any) => 
      attr.name.toLowerCase().includes('speed') || 
      attr.name.toLowerCase().includes('bandwidth') ||
      attr.name.toLowerCase().includes('mbps')
    );
    const internetSpeed = speedAttr?.value || '300 Mbps/100 Mbps +';
    
    // Extract voice information from custom attributes
    const voiceAttr = customAttributes.find((attr: any) => 
      attr.name.toLowerCase().includes('voice') || 
      attr.name.toLowerCase().includes('calls')
    );
    const voice = voiceAttr?.value || 'Unlimited Calls';
    
    // Fallback to category-based defaults if no custom attributes found
    const category = getOfferingCategory(offering);
    const name = offering.name.toLowerCase();
    
    if (category === 'Broadband' || name.includes('fibre') || name.includes('broadband')) {
      return {
        connectionType: connectionType,
        data: data,
        internetSpeed: internetSpeed,
        voice: voice
      };
    } else if (category === 'Mobile' || name.includes('mobile')) {
      return {
        connectionType: 'Mobile',
        data: data,
        internetSpeed: '4G/5G',
        voice: voice
      };
    } else if (category === 'Business') {
      return {
        connectionType: 'Enterprise',
        data: data,
        internetSpeed: '1 Gbps',
        voice: voice
      };
    } else if (category === 'Product') {
      return {
        connectionType: 'Product',
        data: 'Hardware/Software',
        internetSpeed: 'N/A',
        voice: 'N/A'
      };
    }
    
    return {
      connectionType: connectionType,
      data: data,
      internetSpeed: internetSpeed,
      voice: voice
    };
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
      // Get the connection type from broadband selections or fallback to subSubCategory
      let connectionType = 'Data/PEOTV & Voice Packages'; // Default category
      
      const broadbandSelections = (offering as any).broadbandSelections || [];
      const connectionTypeSelection = broadbandSelections.find((selection: any) => 
        selection.subCategory === 'Connection Type'
      );
      
      if (connectionTypeSelection) {
        connectionType = connectionTypeSelection.subSubCategory;
      } else {
        // Fallback to subSubCategory if no broadband selections
        const subSubCategory = (offering as any).subSubCategory;
        if (subSubCategory && subSubCategory !== 'Other') {
          connectionType = subSubCategory;
        }
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
                                const broadbandSelections = (offering as any).broadbandSelections || [];
                                const connectionTypeSelection = broadbandSelections.find((selection: any) => 
                                  selection.subCategory === 'Connection Type'
                                );
                                return connectionTypeSelection ? connectionTypeSelection.subSubCategory : 'Data & Voice';
                              })()}
                            </span>
                          </div>
                          
                          {/* Specifications */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700">Connection Type:</span>
                              <span className="text-gray-900">
                                {(() => {
                                  const broadbandSelections = (offering as any).broadbandSelections || [];
                                  const connectionTypeSelection = broadbandSelections.find((selection: any) => 
                                    selection.subCategory === 'Connection Type'
                                  );
                                  return connectionTypeSelection ? connectionTypeSelection.subSubCategory : specs.connectionType;
                                })()}
                              </span>
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
                          </div>
                        </div>

                        {/* Pricing Section with Gradient */}
                        {price && (
                          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-4 relative overflow-hidden h-32 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
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

                  {/* Pricing Section with Gradient */}
                  {price && (
                    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-4 relative overflow-hidden h-32 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
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
    </div>
  );
} 