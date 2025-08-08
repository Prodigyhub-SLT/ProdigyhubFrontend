// Updated CreateOrder.tsx - Sequential ID Generation

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Trash2, Wifi, Building2, Smartphone, Cloud, Wrench, Search, Eye, Info } from 'lucide-react';
import { productOrderingApi, productCatalogApi } from '../lib/api';
import type { CreateProductOrderRequest, ProductOrderItem, Note, ProductOrder } from '@shared/product-order-types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

// Sequential ID Generator Class
class SequentialOrderIdGenerator {
  private static instance: SequentialOrderIdGenerator;
  private lastUsedNumber: number = 0;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): SequentialOrderIdGenerator {
    if (!SequentialOrderIdGenerator.instance) {
      SequentialOrderIdGenerator.instance = new SequentialOrderIdGenerator();
    }
    return SequentialOrderIdGenerator.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing sequential order ID generator...');
      
      // Get all existing orders to find the highest number
      const existingOrders = await productOrderingApi.getOrders();
      
      if (existingOrders && existingOrders.length > 0) {
        // Extract numbers from existing order IDs
        const orderNumbers = existingOrders
          .map(order => this.extractOrderNumber(order.id))
          .filter(num => num !== null) as number[];
        
        if (orderNumbers.length > 0) {
          this.lastUsedNumber = Math.max(...orderNumbers);
          console.log(`📊 Found ${orderNumbers.length} existing orders. Last used number: ${this.lastUsedNumber}`);
        } else {
          this.lastUsedNumber = 0;
          console.log('📊 No valid sequential order numbers found. Starting from 0.');
        }
      } else {
        this.lastUsedNumber = 0;
        console.log('📊 No existing orders found. Starting from 0.');
      }
      
      this.isInitialized = true;
      console.log('✅ Sequential order ID generator initialized');
    } catch (error) {
      console.error('❌ Failed to initialize sequential order ID generator:', error);
      // Fallback to 0 if we can't fetch existing orders
      this.lastUsedNumber = 0;
      this.isInitialized = true;
    }
  }

  private extractOrderNumber(orderId: string): number | null {
    if (!orderId) return null;
    
    // Try to extract number from different possible formats
    // Format: ORD-004, ORD-000001 (legacy), ORDER-000001, 000001, etc.
    const patterns = [
      /ORD-(\d+)$/,           // ORD-004, ORD-000001
      /ORDER-(\d+)$/,         // ORDER-000001
      /^(\d{3})$/,            // 004 (new format)
      /^(\d{6})$/,            // 000001 (legacy format)
      /^(\d+)$/               // Any number at the end
    ];
    
    for (const pattern of patterns) {
      const match = orderId.match(pattern);
      if (match) {
        const number = parseInt(match[1], 10);
        if (!isNaN(number)) {
          return number;
        }
      }
    }
    
    return null;
  }

  async generateNextOrderId(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    this.lastUsedNumber += 1;
    const paddedNumber = this.lastUsedNumber.toString().padStart(3, '0');
    const orderId = `ORD-${paddedNumber}`;
    
    console.log(`🆔 Generated new order ID: ${orderId}`);
    return orderId;
  }

  // Method to manually set the counter (useful for testing or data migration)
  setLastUsedNumber(number: number): void {
    this.lastUsedNumber = number;
    console.log(`🔧 Manually set last used number to: ${number}`);
  }

  // Method to get current counter value
  getCurrentCounter(): number {
    return this.lastUsedNumber;
  }

  // Method to reset (useful for testing)
  reset(): void {
    this.lastUsedNumber = 0;
    this.isInitialized = false;
    console.log('🔄 Sequential order ID generator reset');
  }
}

// Get singleton instance
const orderIdGenerator = SequentialOrderIdGenerator.getInstance();

// Category options with icons and colors (unchanged)
const categoryOptions = [
  {
    value: 'Broadband',
    label: 'Broadband',
    icon: Wifi,
    color: 'bg-purple-500 text-white',
    description: 'Internet and connectivity services'
  },
  {
    value: 'Business',
    label: 'Business',
    icon: Building2,
    color: 'bg-blue-500 text-white',
    description: 'Enterprise and business solutions'
  },
  {
    value: 'Mobile',
    label: 'Mobile',
    icon: Smartphone,
    color: 'bg-pink-500 text-white',
    description: 'Mobile plans and devices'
  },
  {
    value: 'Cloud Service',
    label: 'Cloud Service',
    icon: Cloud,
    color: 'bg-cyan-500 text-white',
    description: 'Cloud infrastructure and services'
  },
  {
    value: 'Product',
    label: 'Product',
    icon: Package,
    color: 'bg-indigo-500 text-white',
    description: 'Hardware, software, and physical products'
  }
];

// Interface for MongoDB offerings (unchanged)
interface MongoOffering {
  _id?: string;
  id: string;
  name: string;
  description: string;
  category: string;
  lifecycleStatus: 'Active' | 'Draft' | 'Retired';
  isBundle: boolean;
  isSellable: boolean;
  customAttributes: Array<{
    id: string;
    name: string;
    value: string;
    type: string;
  }>;
  pricing: {
    amount: number;
    currency: string;
    period: string;
    setupFee: number;
    deposit: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [initializingIdGenerator, setInitializingIdGenerator] = useState(true);
  
  // Search state for offering dropdown
  const [offeringSearchTerms, setOfferingSearchTerms] = useState<{[key: number]: string}>({});
  
  // Available offerings from MongoDB
  const [availableOfferings, setAvailableOfferings] = useState<MongoOffering[]>([]);
  const [filteredOfferings, setFilteredOfferings] = useState<MongoOffering[]>([]);
  
  // Preview dialog state
  const [previewOffering, setPreviewOffering] = useState<MongoOffering | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [offeringToAdd, setOfferingToAdd] = useState<{ offering: MongoOffering; itemIndex: number } | null>(null);
  
  const [formData, setFormData] = useState<CreateProductOrderRequest>({
    category: '',
    description: '',
    priority: '1',
    productOrderItem: [{
      action: 'add',
      quantity: 1,
      productOffering: {
        id: '',
        name: '',
        '@type': 'ProductOfferingRef'
      }
    }],
    note: []
  });

  // Initialize ID generator when component mounts
  useEffect(() => {
    const initializeGenerator = async () => {
      try {
        setInitializingIdGenerator(true);
        await orderIdGenerator.initialize();
        console.log(`📊 Order ID generator ready. Current counter: ${orderIdGenerator.getCurrentCounter()}`);
      } catch (error) {
        console.error('❌ Failed to initialize order ID generator:', error);
        toast({
          title: "Warning",
          description: "Order ID generator initialization failed. IDs may not be sequential.",
          variant: "destructive"
        });
      } finally {
        setInitializingIdGenerator(false);
      }
    };

    initializeGenerator();
  }, [toast]);

  // Load offerings from MongoDB when component mounts
  useEffect(() => {
    loadAvailableOfferings();
  }, []);

  // Filter offerings when category changes
  useEffect(() => {
    if (formData.category) {
      const categoryOfferings = availableOfferings.filter(
        offering => offering.category === formData.category && 
                   offering.lifecycleStatus === 'Active' && 
                   offering.isSellable
      );
      setFilteredOfferings(categoryOfferings);
      // Reset search terms when category changes
      setOfferingSearchTerms({});
    } else {
      setFilteredOfferings([]);
      setOfferingSearchTerms({});
    }
  }, [formData.category, availableOfferings]);

  const loadAvailableOfferings = async () => {
    try {
      setLoadingOfferings(true);
      console.log('🔄 Loading offerings from TMF620 MongoDB...');
      
      const offerings = await productCatalogApi.getOfferings({ limit: 100 });
      console.log('📥 Raw offerings from MongoDB:', offerings);
      
      // Convert TMF620 offerings to our format
      const mongoFormattedOfferings: MongoOffering[] = offerings.map(offering => ({
        _id: (offering as any)._id,
        id: offering.id,
        name: offering.name,
        description: offering.description || '',
        category: (() => {
          if (typeof (offering as any).category === 'string') {
            return (offering as any).category;
          } else if (Array.isArray(offering.category) && offering.category[0]) {
            return offering.category[0].name || offering.category[0].id || 'Other';
          } else if (offering.category && typeof offering.category === 'object') {
            return (offering.category as any).name || (offering.category as any).id || 'Other';
          } else {
            return 'Other';
          }
        })(),
        lifecycleStatus: offering.lifecycleStatus as 'Active' | 'Draft' | 'Retired',
        isBundle: offering.isBundle || false,
        isSellable: offering.isSellable !== false,
        customAttributes: (offering as any).customAttributes || [],
        pricing: (offering as any).pricing || {
          amount: 0,
          currency: 'LKR',
          period: 'per month',
          setupFee: 0,
          deposit: 0
        },
        createdAt: (offering as any).createdAt || new Date().toISOString(),
        updatedAt: (offering as any).updatedAt,
      }));

      setAvailableOfferings(mongoFormattedOfferings);
      console.log('✅ Loaded MongoDB offerings:', mongoFormattedOfferings.length);
      
    } catch (error) {
      console.error('❌ Error loading offerings:', error);
      toast({
        title: "Warning",
        description: "Could not load available offerings. Manual entry will be available.",
        variant: "destructive"
      });
    } finally {
      setLoadingOfferings(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      // Reset product items when category changes
      productOrderItem: [{
        action: 'add',
        quantity: 1,
        productOffering: {
          id: '',
          name: '',
          '@type': 'ProductOfferingRef'
        }
      }]
    }));
    // Reset search terms when category changes
    setOfferingSearchTerms({});
  };

  const addProductItem = () => {
    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category first before adding items",
        variant: "destructive"
      });
      return;
    }

    const newIndex = formData.productOrderItem.length;
    setFormData(prev => ({
      ...prev,
      productOrderItem: [
        ...prev.productOrderItem,
        {
          action: 'add',
          quantity: 1,
          productOffering: {
            id: '',
            name: '',
            '@type': 'ProductOfferingRef'
          }
        }
      ]
    }));
    // Initialize search term for new item
    setOfferingSearchTerms(prev => ({ ...prev, [newIndex]: '' }));
  };

  const removeProductItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productOrderItem: prev.productOrderItem.filter((_, i) => i !== index)
    }));
    // Remove search term for this item and adjust indices
    setOfferingSearchTerms(prev => {
      const newTerms = { ...prev };
      delete newTerms[index];
      // Shift down the indices for items after the removed one
      const adjustedTerms: {[key: number]: string} = {};
      Object.keys(newTerms).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          adjustedTerms[keyNum - 1] = newTerms[keyNum];
        } else {
          adjustedTerms[keyNum] = newTerms[keyNum];
        }
      });
      return adjustedTerms;
    });
  };

  const updateProductItem = (index: number, updates: Partial<ProductOrderItem>) => {
    setFormData(prev => ({
      ...prev,
      productOrderItem: prev.productOrderItem.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }));
  };

  // Filter offerings based on search term for specific item
  const getFilteredOfferingsForItem = (itemIndex: number) => {
    const searchTerm = offeringSearchTerms[itemIndex] || '';
    if (!searchTerm.trim()) {
      return filteredOfferings;
    }
    
    return filteredOfferings.filter(offering =>
      offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.pricing.amount.toString().includes(searchTerm)
    );
  };

  const handleOfferingSelect = (offering: MongoOffering, itemIndex: number) => {
    setOfferingToAdd({ offering, itemIndex });
    setPreviewOffering(offering);
    setShowPreviewDialog(true);
  };

  const confirmAddOffering = () => {
    if (offeringToAdd) {
      const { offering, itemIndex } = offeringToAdd;
      updateProductItem(itemIndex, {
        productOffering: {
          id: offering.id,
          name: offering.name,
          '@type': 'ProductOfferingRef'
        }
      });
      
      toast({
        title: "Item Added",
        description: `${offering.name} has been added to your order`,
      });
    }
    
    setShowPreviewDialog(false);
    setOfferingToAdd(null);
    setPreviewOffering(null);
  };

  const addNote = () => {
    setFormData(prev => ({
      ...prev,
      note: [
        ...(prev.note || []),
        {
          author: '',
          date: new Date().toISOString(),
          text: '',
          '@type': 'Note'
        }
      ]
    }));
  };

  const removeNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      note: prev.note?.filter((_, i) => i !== index)
    }));
  };

  const updateNote = (index: number, updates: Partial<Note>) => {
    setFormData(prev => ({
      ...prev,
      note: prev.note?.map((note, i) => 
        i === index ? { ...note, ...updates } : note
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.description?.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category?.trim()) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.productOrderItem.some(item => !item.productOffering?.id || !item.productOffering?.name)) {
      toast({
        title: "Validation Error", 
        description: "All product items must have valid product offering selected",
        variant: "destructive"
      });
      return;
    }

    if (initializingIdGenerator) {
      toast({
        title: "Please Wait",
        description: "Order ID generator is still initializing. Please wait a moment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Generate sequential order ID
      const orderId = await orderIdGenerator.generateNextOrderId();
      console.log(`🆔 Using sequential order ID: ${orderId}`);
      
      // Generate unique IDs for items (can still be random since they're not user-facing)
      const generateItemId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare order data with sequential ID
      const orderData: CreateProductOrderRequest = {
        ...formData,
        id: orderId, // Use sequential ID
        orderDate: new Date().toISOString(),
        state: 'acknowledged',
        productOrderItem: formData.productOrderItem.map(item => ({
          ...item,
          id: generateItemId(), // Item IDs can still be random
        })),
        '@type': 'ProductOrder'
      };

      console.log('Creating order with sequential ID:', JSON.stringify(orderData, null, 2));

      const order = await productOrderingApi.createOrder(orderData) as ProductOrder;
      
      toast({
        title: "Success",
        description: `Product order created successfully with ID: ${orderId}`,
      });
      navigate(`/admin/orders/${order.id}`);
    } catch (err) {
      console.error('Error creating order:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create order',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);

  // Show loading state while initializing ID generator
  if (initializingIdGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                          <div className="flex items-center space-x-3">
              <Link to="/admin/ordering">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Create New Order</h1>
                  <p className="text-sm text-slate-500">Initializing order system...</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Initializing Order System</h3>
            <p className="text-slate-600">Setting up sequential order numbering...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/admin/ordering">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Create New Order</h1>
                <p className="text-sm text-slate-500">
                  Next Order ID: ORD-{(orderIdGenerator.getCurrentCounter() + 1).toString().padStart(6, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for the product order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category">
                        {selectedCategory && (
                          <div className="flex items-center space-x-2">
                            <div className={`flex items-center justify-center w-5 h-5 rounded ${selectedCategory.color}`}>
                              <selectedCategory.icon className="w-3 h-3" />
                            </div>
                            <span>{selectedCategory.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center space-x-3 py-2">
                              <div className={`flex items-center justify-center w-8 h-8 rounded ${category.color}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium">{category.label}</div>
                                <div className="text-xs text-muted-foreground">{category.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">High (1)</SelectItem>
                      <SelectItem value="2">Medium (2)</SelectItem>
                      <SelectItem value="3">Low (3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter order description..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Rest of the component remains the same - Product Items section and other components */}
          {/* Product Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Items</CardTitle>
                  <CardDescription>
                    {formData.category 
                      ? `Select ${formData.category} offerings to be ordered` 
                      : "Select a category first to see available offerings"
                    }
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  onClick={addProductItem} 
                  variant="outline" 
                  size="sm"
                  disabled={!formData.category}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!formData.category && (
                <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Select Category First</h3>
                  <p className="text-slate-500">Please select a category in Basic Information to see available offerings</p>
                </div>
              )}

              {formData.category && loadingOfferings && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading available offerings...</p>
                </div>
              )}

              {formData.category && !loadingOfferings && filteredOfferings.length === 0 && (
                <div className="text-center py-8 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
                  <Info className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-orange-700 mb-2">No Offerings Available</h3>
                  <p className="text-orange-600">No active offerings found for {formData.category} category</p>
                </div>
              )}

              {formData.category && !loadingOfferings && filteredOfferings.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded ${selectedCategory?.color}`}>
                      {selectedCategory && <selectedCategory.icon className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-green-800">
                      {filteredOfferings.length} {formData.category} offering(s) available
                    </span>
                  </div>
                </div>
              )}

              {formData.productOrderItem.map((item, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900">Item #{index + 1}</h4>
                    {formData.productOrderItem.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProductItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Select Offering *</Label>
                      {formData.category && filteredOfferings.length > 0 ? (
                        <div className="mt-1">
                          <Select 
                            value={item.productOffering?.id || ''} 
                            onValueChange={(offeringId) => {
                              const selectedOffering = filteredOfferings.find(o => o.id === offeringId);
                              if (selectedOffering) {
                                handleOfferingSelect(selectedOffering, index);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${formData.category} offering...`}>
                                {item.productOffering?.name && (
                                  <div className="flex items-center space-x-2">
                                    <span>{item.productOffering.name}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent side="bottom" className="w-full">
                              {/* Search Input */}
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search offerings..."
                                    value={offeringSearchTerms[index] || ''}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      setOfferingSearchTerms(prev => ({
                                        ...prev,
                                        [index]: newValue
                                      }));
                                    }}
                                    className="pl-8"
                                    onKeyDown={(e) => {
                                      // Prevent Select from closing when typing
                                      e.stopPropagation();
                                    }}
                                  />
                                </div>
                                {offeringSearchTerms[index] && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {getFilteredOfferingsForItem(index).length} offering(s) found
                                  </div>
                                )}
                              </div>
                              
                              {/* Offerings List */}
                              <div className="max-h-60 overflow-y-auto">
                                {getFilteredOfferingsForItem(index).length === 0 ? (
                                  <div className="p-4 text-center text-muted-foreground">
                                    {offeringSearchTerms[index] 
                                      ? `No offerings found for "${offeringSearchTerms[index]}"` 
                                      : "No offerings available"
                                    }
                                  </div>
                                ) : (
                                  getFilteredOfferingsForItem(index).map((offering) => (
                                    <SelectItem key={offering.id} value={offering.id}>
                                      <div className="flex items-center justify-between w-full min-w-0 pr-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">{offering.name}</div>
                                          <div className="text-sm text-muted-foreground truncate">
                                            {offering.pricing.currency} {offering.pricing.amount.toLocaleString()} {offering.pricing.period}
                                          </div>
                                        </div>
                                        <Badge 
                                          variant="outline" 
                                          className="ml-2 flex-shrink-0 bg-green-100 text-green-800"
                                        >
                                          {offering.lifecycleStatus}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="mt-1 p-3 border border-slate-200 rounded-md bg-slate-50 text-slate-500">
                          {!formData.category 
                            ? "Select category first" 
                            : loadingOfferings 
                              ? "Loading offerings..." 
                              : "No offerings available"
                          }
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateProductItem(index, { quantity: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link to="/admin/ordering">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading || initializingIdGenerator}>
              {loading ? 'Creating...' : initializingIdGenerator ? 'Initializing...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </main>

      {/* Offering Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Add Offering</DialogTitle>
            <DialogDescription>
              Review the offering details before adding to your order
            </DialogDescription>
          </DialogHeader>
          
          {previewOffering && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{previewOffering.name}</h3>
                <Badge className="bg-green-100 text-green-800">{previewOffering.lifecycleStatus}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center justify-center w-5 h-5 rounded ${selectedCategory?.color}`}>
                    {selectedCategory && <selectedCategory.icon className="w-3 h-3" />}
                  </div>
                  <span className="text-sm text-muted-foreground">{previewOffering.category}</span>
                </div>
                
                <p className="text-sm text-slate-600">{previewOffering.description}</p>
              </div>

              {/* Custom Attributes */}
              {previewOffering.customAttributes && previewOffering.customAttributes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Features & Specifications</h4>
                  <div className="space-y-2">
                    {previewOffering.customAttributes.slice(0, 4).map((attr) => (
                      <div key={attr.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">{attr.name}</span>
                        <span className="text-gray-600">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {previewOffering.pricing.currency} {previewOffering.pricing.amount.toLocaleString()}
                  </span>
                  <span className="text-blue-100 text-sm">
                    {previewOffering.pricing.period}
                  </span>
                </div>
                
                {(previewOffering.pricing.setupFee > 0 || previewOffering.pricing.deposit > 0) && (
                  <div className="mt-2 text-right">
                    {previewOffering.pricing.setupFee > 0 && (
                      <div className="text-sm text-blue-100">
                        Setup Fee: {previewOffering.pricing.currency} {previewOffering.pricing.setupFee.toLocaleString()}
                      </div>
                    )}
                    {previewOffering.pricing.deposit > 0 && (
                      <div className="text-sm text-blue-100">
                        Security Deposit: {previewOffering.pricing.currency} {previewOffering.pricing.deposit.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPreviewDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={confirmAddOffering}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}