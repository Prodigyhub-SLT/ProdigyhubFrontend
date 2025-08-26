// hooks/useMongoOfferingsLogic.ts - ENHANCED WITH ONE-WAY SYNC
import { useState, useEffect } from "react";
import { productCatalogApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CategoryHierarchy, SubCategory, SubSubCategory } from "../shared/product-order-types";

export interface CustomAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean';
}

export interface MongoProductOffering {
  _id?: string;
  id: string;
  name: string;
  description: string;
  category: string;
  categoryDescription?: string;
  subCategory?: string;
  subSubCategory?: string;
  // NEW: For Broadband offerings - multiple sub-category selections
  broadbandSelections?: SubCategorySelection[];
  // NEW: Hierarchical category structure
  hierarchicalCategory?: {
    mainCategory: CategoryHierarchy;
    subCategories: Array<{
      subCategory: SubCategory;
      subSubCategories: SubSubCategory[];
    }>;
  };
  lifecycleStatus: 'Active' | 'Draft' | 'Retired';
  isBundle: boolean;
  isSellable: boolean;
  customAttributes: CustomAttribute[];
  pricing: {
    amount: number;
    currency: string;
    period: string;
    setupFee: number;
    deposit: number;
  };
  createdAt: string;
  updatedAt?: string;
  // NEW: Link to auto-generated spec
  linkedSpecId?: string;
  // NEW: Link to auto-generated price
  linkedPriceId?: string;
  '@type': string;
}

interface SubCategorySelection {
  subCategory: string;
  subSubCategory: string;
}

export const useMongoOfferingsLogic = () => {
  const { toast } = useToast();
  
  const [mongoOfferings, setMongoOfferings] = useState<MongoProductOffering[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingOffering, setEditingOffering] = useState<MongoProductOffering | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<MongoProductOffering | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<{
    name: string;
    lifecycleStatus: 'Active' | 'Draft' | 'Retired';
    category: string;
    categoryDescription: string;
    subCategory: string;
    subSubCategory: string;
    broadbandSelections?: SubCategorySelection[];
    hierarchicalCategory?: {
      mainCategory: CategoryHierarchy;
      subCategories: Array<{
        subCategory: SubCategory;
        subSubCategories: SubSubCategory[];
      }>;
    };
    description: string;
    customAttributes: CustomAttribute[];
    isBundle: boolean;
    isSellable: boolean;
    pricing: {
      amount: number;
      currency: string;
      period: string;
      setupFee: number;
      deposit: number;
    };
  }>({
    name: '',
    lifecycleStatus: 'Active',
    category: '',
    categoryDescription: '',
    subCategory: '',
    subSubCategory: '',
    broadbandSelections: [],
    description: '',
    customAttributes: [],
    isBundle: false,
    isSellable: true,
    pricing: {
      amount: 0,
      currency: 'LKR',
      period: 'per month',
      setupFee: 0,
      deposit: 0,
    }
  });

  // Load existing offerings from TMF620 MongoDB on mount
  useEffect(() => {
    loadOfferingsFromTMF620();
  }, []);

  const loadOfferingsFromTMF620 = async () => {
    try {
      console.log('📥 Loading offerings from TMF620...');
      // Add a higher limit to get all offerings
      const offerings = await productCatalogApi.getOfferings({ limit: 100 });
      console.log('📥 Raw TMF620 offerings from MongoDB:', JSON.stringify(offerings, null, 2));
      
      // Convert TMF620 offerings to MongoDB format
      const mongoFormattedOfferings: MongoProductOffering[] = offerings.map(offering => {
        // Extract custom attributes from productSpecification if available
        const customAttributes: CustomAttribute[] = [];
        if (offering.productSpecification && (offering.productSpecification as any).productSpecCharacteristic) {
          const characteristics = (offering.productSpecification as any).productSpecCharacteristic;
          characteristics.forEach((char: any, index: number) => {
            customAttributes.push({
              id: char.id || `attr_${index}`,
              name: char.name || '',
              value: char.productSpecCharacteristicValue?.[0]?.value || '',
              type: 'text'
            });
          });
        }

        // Extract pricing from productOfferingPrice if available
        const pricing = {
          amount: (offering as any).productOfferingPrice?.[0]?.price?.taxIncludedAmount?.value || 0,
          currency: (offering as any).productOfferingPrice?.[0]?.price?.taxIncludedAmount?.unit || 'LKR',
          period: (offering as any).productOfferingPrice?.[0]?.priceType === 'oneTime' ? 'one-time' : 'per month',
          setupFee: 0,
          deposit: 0
        };

        // Handle category properly - extract name from category object or array
        const mongoOffering: MongoProductOffering = {
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
          categoryDescription: (offering as any).categoryDescription || '', // Extract category description
          subCategory: (() => {
            if (typeof (offering as any).subCategory === 'string') {
              return (offering as any).subCategory;
            } else if (Array.isArray((offering as any).subCategory) && (offering as any).subCategory[0]) {
              return (offering as any).subCategory[0].name || (offering as any).subCategory[0].id || 'Other';
            } else if ((offering as any).subCategory && typeof (offering as any).subCategory === 'object') {
              return ((offering as any).subCategory as any).name || ((offering as any).subCategory as any).id || 'Other';
            } else {
              return undefined;
            }
          })(),
          subSubCategory: (() => {
            if (typeof (offering as any).subSubCategory === 'string') {
              return (offering as any).subSubCategory;
            } else if (Array.isArray((offering as any).subSubCategory) && (offering as any).subSubCategory[0]) {
              return (offering as any).subSubCategory[0].name || (offering as any).subSubCategory[0].id || 'Other';
            } else if ((offering as any).subSubCategory && typeof (offering as any).subSubCategory === 'object') {
              return ((offering as any).subSubCategory as any).name || ((offering as any).subSubCategory[0] as any).id || 'Other';
            } else {
              return undefined;
            }
          })(),
          broadbandSelections: (offering as any).broadbandSelections || [], // Extract broadband selections
          hierarchicalCategory: (offering as any).hierarchicalCategory, // Extract hierarchical category
          lifecycleStatus: offering.lifecycleStatus as 'Active' | 'Draft' | 'Retired',
          isBundle: offering.isBundle || false,
          isSellable: offering.isSellable !== false,
          customAttributes: (offering as any).customAttributes || customAttributes,
          pricing: (offering as any).pricing || pricing,
          createdAt: (offering as any).createdAt || new Date().toISOString(),
          updatedAt: (offering as any).updatedAt,
          linkedSpecId: (offering as any).linkedSpecId, // Preserve linked spec ID
          linkedPriceId: (offering as any).linkedPriceId, // Preserve linked price ID
          '@type': 'ProductOffering'
        };

        return mongoOffering;
      });

      setMongoOfferings(mongoFormattedOfferings);
      console.log('✅ Loaded and converted MongoDB offerings:', mongoFormattedOfferings);
      
    } catch (error) {
      console.error('❌ Error loading offerings from TMF620:', error);
      toast({
        title: "Warning",
        description: "Could not load existing offerings from database.",
        variant: "destructive",
      });
    }
  };

  // NEW: Function to find and update linked specification
  const updateLinkedSpecification = async (offeringName: string, offeringCategory: string, offeringDescription: string, offeringLifecycleStatus: string, linkedSpecId?: string) => {
    try {
      console.log('🔄 Updating linked specification for offering:', offeringName);
      
      // First, try to find existing spec by name if no linkedSpecId
      let specToUpdate = null;
      
      if (linkedSpecId) {
        // Use the stored linkedSpecId
        console.log('🔍 Using stored linkedSpecId:', linkedSpecId);
      } else {
        // Find spec by matching name (fallback for older offerings)
        const allSpecs = await productCatalogApi.getSpecifications();
        specToUpdate = allSpecs.find((spec: any) => spec.name === offeringName);
        console.log('🔍 Found spec by name match:', specToUpdate?.id);
      }

      const specIdToUpdate = linkedSpecId || specToUpdate?.id;
      
      if (!specIdToUpdate) {
        console.log('⚠️ No linked specification found for offering:', offeringName);
        return null;
      }

      // Update the specification with new offering data
      const updateData = {
        name: offeringName, // Sync name
        description: `Product specification for ${offeringName}. ${offeringDescription}`, // Sync description
        lifecycleStatus: offeringLifecycleStatus, // Sync status
        // Keep existing category and other fields
        updatedAt: new Date().toISOString(),
        '@type': 'ProductSpecification'
      };

      console.log('🔄 Updating spec with data:', updateData);
      const updatedSpec = await productCatalogApi.updateSpecification(specIdToUpdate, updateData);
      console.log('✅ Successfully updated linked specification:', updatedSpec);
      
      return updatedSpec;
      
    } catch (error) {
      console.error('❌ Error updating linked specification:', error);
      // Don't throw error - just log it since spec update is secondary
      return null;
    }
  };

  // ENHANCED: Direct spec creation function with linking
  const createSpecificationForOffering = async (offeringName: string, offeringCategory: string, offeringDescription: string, offeringLifecycleStatus: string) => {
    try {
      console.log('🔄 Auto-creating specification for offering:', offeringName);
      
      // Get category default characteristics
      const getCategoryDefaultCharacteristics = (category: string) => {
        const baseId = Date.now();
        switch (category) {
          case 'Broadband':
            return [
              { 
                id: `${baseId}_1`, 
                name: 'Internet Speed', 
                description: 'Maximum internet speed provided',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_2`, 
                name: 'TV Channels', 
                description: 'Number and type of TV channels included',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_3`, 
                name: 'Contract Term', 
                description: 'Minimum contract duration',
                valueType: 'string' as const,
                configurable: false
              },
              { 
                id: `${baseId}_4`, 
                name: 'Installation', 
                description: 'Installation service details',
                valueType: 'string' as const,
                configurable: false
              },
            ];
          case 'Business':
            return [
              { 
                id: `${baseId}_1`, 
                name: 'Bandwidth', 
                description: 'Dedicated bandwidth allocation',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_2`, 
                name: 'Static IPs', 
                description: 'Number of static IP addresses',
                valueType: 'number' as const,
                configurable: true
              },
              { 
                id: `${baseId}_3`, 
                name: 'SLA Uptime', 
                description: 'Service level agreement uptime guarantee',
                valueType: 'string' as const,
                configurable: false
              },
              { 
                id: `${baseId}_4`, 
                name: 'Support', 
                description: 'Technical support level',
                valueType: 'string' as const,
                configurable: false
              },
            ];
          case 'Mobile':
            return [
              { 
                id: `${baseId}_1`, 
                name: 'Data', 
                description: 'Data allowance and speed',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_2`, 
                name: 'Calls', 
                description: 'Voice call allowance',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_3`, 
                name: 'SMS', 
                description: 'SMS message allowance',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_4`, 
                name: 'Roaming', 
                description: 'International roaming allowance',
                valueType: 'string' as const,
                configurable: true
              },
            ];
          case 'Cloud Service':
            return [
              { 
                id: `${baseId}_1`, 
                name: 'Storage', 
                description: 'Cloud storage capacity',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_2`, 
                name: 'Compute', 
                description: 'Virtual CPU resources',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_3`, 
                name: 'Bandwidth', 
                description: 'Monthly data transfer allowance',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_4`, 
                name: 'Support Level', 
                description: 'Technical support tier',
                valueType: 'string' as const,
                configurable: false
              },
            ];
          case 'Product':
            return [
              { 
                id: `${baseId}_1`, 
                name: 'Product Type', 
                description: 'Type of product (Hardware, Software, Accessory, Service)',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_2`, 
                name: 'Brand', 
                description: 'Product brand or manufacturer',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_3`, 
                name: 'Model', 
                description: 'Product model or version',
                valueType: 'string' as const,
                configurable: true
              },
              { 
                id: `${baseId}_4`, 
                name: 'Warranty', 
                description: 'Warranty period and terms',
                valueType: 'string' as const,
                configurable: false
              },
            ];
          default:
            return [];
        }
      };

      // Create the spec data
      const specData = {
        id: `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: offeringName, // Same name as offering
        description: `Product specification for ${offeringName}. ${offeringDescription}`,
        category: offeringCategory, // Same category as offering
        lifecycleStatus: offeringLifecycleStatus as 'Active' | 'Draft' | 'Retired', // Same status as offering
        brand: 'ProdigyHub',
        version: '1.0',
        characteristics: getCategoryDefaultCharacteristics(offeringCategory),
        createdAt: new Date().toISOString(),
        // NEW: Mark this as auto-generated from offering
        parentOfferingName: offeringName,
        '@type': 'ProductSpecification'
      };

      // Create TMF620 compliant object with MongoDB extensions
      const tmf620SpecWithExtensions = {
        // Standard TMF620 fields
        name: specData.name,
        description: specData.description,
        lifecycleStatus: specData.lifecycleStatus,
        brand: specData.brand,
        version: specData.version,
        validFor: {
          startDateTime: new Date().toISOString(),
          endDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        
        // Category reference
        category: [{
          id: `cat_${offeringCategory.toLowerCase().replace(/\s+/g, '_')}`,
          name: offeringCategory,
          '@type': 'CategoryRef'
        }],

        // Product specification characteristics
        productSpecCharacteristic: specData.characteristics.map(char => ({
          id: char.id,
          name: char.name,
          description: char.description,
          valueType: char.valueType,
          configurable: char.configurable,
          validFor: {
            startDateTime: new Date().toISOString()
          },
          '@type': 'ProductSpecCharacteristic'
        })),

        // MongoDB Extensions
        characteristics: specData.characteristics,
        createdAt: specData.createdAt,
        parentOfferingName: specData.parentOfferingName, // Track parent offering

        '@type': 'ProductSpecification'
      };

      // Save to TMF620 MongoDB
      console.log('🔄 Sending auto-created spec to TMF620:', JSON.stringify(tmf620SpecWithExtensions, null, 2));
      const savedSpec = await productCatalogApi.createSpecification(tmf620SpecWithExtensions);
      console.log('✅ Auto-created specification saved:', savedSpec);
      
      return savedSpec;
      
    } catch (error) {
      console.error('❌ Error auto-creating specification:', error);
      throw error;
    }
  };

  // ENHANCED: Auto-create price for offering
  const createPriceForOffering = async (offeringName: string, offeringId: string, pricing: any) => {
    try {
      console.log('🔄 Auto-creating price for offering:', offeringName);
      
      // Determine price type based on period
      const priceType: 'recurring' | 'oneTime' | 'usage' = pricing.period === 'one-time' ? 'oneTime' : 'recurring';
      
      // Create price data
      const priceData = {
        name: `${offeringName} Price`,
        description: `Pricing for ${offeringName} - ${pricing.amount} ${pricing.currency} ${pricing.period}`,
        priceType: priceType,
        value: pricing.amount,
        unit: pricing.currency
      };

      console.log('🔄 Creating price with data:', priceData);
      
      // Create the price using the API
      const createdPrice = await productCatalogApi.createPrice(priceData);
      console.log('✅ Auto-created price:', createdPrice);
      
      return createdPrice;
      
    } catch (error) {
      console.error('❌ Error auto-creating price:', error);
      throw error;
    }
  };

  // Create MongoDB offering with auto-spec creation
  const createMongoOffering = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the offering.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate required fields first
      if (!formData.name || !formData.category || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Name, Category, Description)",
          variant: "destructive",
        });
        return;
      }

      if (formData.pricing.amount <= 0) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid price amount",
          variant: "destructive",
        });
        return;
      }

      // Create MongoDB offering object with EXACT form data
      const mongoOffering: MongoProductOffering = {
        id: `mongo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        categoryDescription: formData.categoryDescription,
        subCategory: formData.subCategory,
        subSubCategory: formData.subSubCategory,
        broadbandSelections: formData.broadbandSelections || [], // Include broadband selections
        hierarchicalCategory: formData.hierarchicalCategory, // Include hierarchical category
        lifecycleStatus: formData.lifecycleStatus,
        isBundle: formData.isBundle,
        isSellable: formData.isSellable,
        customAttributes: formData.customAttributes.map(attr => ({
          id: attr.id,
          name: attr.name.trim(),
          value: attr.value.trim(),
          type: attr.type
        })),
        pricing: {
          amount: Number(formData.pricing.amount),
          currency: formData.pricing.currency,
          period: formData.pricing.period,
          setupFee: Number(formData.pricing.setupFee),
          deposit: Number(formData.pricing.deposit),
        },
        createdAt: new Date().toISOString(),
        '@type': 'ProductOffering'
      };

      console.log('📝 Creating MongoDB offering with ACTUAL data:', mongoOffering);

      // Create TMF620 compliant object with MongoDB extensions
      const tmf620OfferingWithExtensions = {
        // Standard TMF620 fields
        name: mongoOffering.name,
        description: mongoOffering.description,
        lifecycleStatus: mongoOffering.lifecycleStatus,
        isBundle: mongoOffering.isBundle,
        isSellable: mongoOffering.isSellable,
        version: "1.0",
        validFor: {
          startDateTime: new Date().toISOString(),
          endDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        
        // Category reference
        category: [{
          id: `cat_${formData.category.toLowerCase().replace(/\s+/g, '_')}`,
          name: formData.category,
          '@type': 'CategoryRef'
        }],

        // Product specification with custom attributes
        productSpecification: formData.customAttributes.length > 0 ? {
          id: `spec_${Date.now()}`,
          name: `${formData.name} Specification`,
          productSpecCharacteristic: formData.customAttributes.map(attr => ({
            id: attr.id,
            name: attr.name,
            valueType: attr.type,
            productSpecCharacteristicValue: [{
              value: attr.value,
              isDefault: true
            }]
          })),
          '@type': 'ProductSpecification'
        } : undefined,

        // Pricing information
        productOfferingPrice: [{
          id: `price_${Date.now()}`,
          name: `${formData.name} Price`,
          description: `Pricing for ${formData.name}`,
          priceType: formData.pricing.period === 'one-time' ? 'oneTime' : 'recurring',
          price: {
            taxIncludedAmount: {
              unit: formData.pricing.currency,
              value: Number(formData.pricing.amount)
            }
          },
          lifecycleStatus: 'Active',
          '@type': 'ProductOfferingPrice'
        }],

        // MongoDB Extensions (your backend should preserve these)
        customAttributes: mongoOffering.customAttributes,
        pricing: mongoOffering.pricing,
        createdAt: mongoOffering.createdAt,
        broadbandSelections: mongoOffering.broadbandSelections, // Include broadband selections

        '@type': 'ProductOffering'
      };

      try {
        // Save to TMF620 MongoDB with extensions
        console.log('🔄 About to send to TMF620 API:', JSON.stringify(tmf620OfferingWithExtensions, null, 2));
        
        const savedOffering = await productCatalogApi.createOffering(tmf620OfferingWithExtensions);
        console.log('✅ TMF620 API Response:', JSON.stringify(savedOffering, null, 2));
        
        // 🚀 AUTO-CREATE SPECIFICATION WITH LINKING
        let linkedSpecId = null;
        try {
          console.log('🔄 Auto-creating specification for offering:', formData.name);
          
          const createdSpec = await createSpecificationForOffering(
            formData.name,           // Same name as offering
            formData.category,       // Same category
            formData.description,    // Same description  
            formData.lifecycleStatus // Same status
          );
          
          linkedSpecId = createdSpec.id;
          console.log('✅ Auto-created specification with ID:', linkedSpecId);
          
        } catch (specError) {
          console.warn('⚠️ Could not auto-create specification:', specError);
        }

        // 🚀 AUTO-CREATE PRICE FOR OFFERING
        let linkedPriceId = null;
        try {
          console.log('🔄 Auto-creating price for offering:', formData.name);
          
          const createdPrice = await createPriceForOffering(
            formData.name,           // Same name as offering
            savedOffering.id,        // Use the saved offering ID
            formData.pricing         // Use the pricing from form data
          );
          
          linkedPriceId = createdPrice.id;
          console.log('✅ Auto-created price with ID:', linkedPriceId);
          
        } catch (priceError) {
          console.warn('⚠️ Could not auto-create price:', priceError);
        }

        // Convert response back to MongoDB format WITH linked spec ID and price ID
        const mongoFormattedOffering: MongoProductOffering = {
          _id: (savedOffering as any)._id,
          id: savedOffering.id,
          name: savedOffering.name,
          description: savedOffering.description || '',
          category: formData.category,
          subCategory: formData.subCategory,
          subSubCategory: formData.subSubCategory,
          broadbandSelections: formData.broadbandSelections || [], // Include broadband selections
          lifecycleStatus: savedOffering.lifecycleStatus as 'Active' | 'Draft' | 'Retired',
          isBundle: savedOffering.isBundle || false,
          isSellable: savedOffering.isSellable !== false,
          customAttributes: (savedOffering as any).customAttributes || mongoOffering.customAttributes,
          pricing: (savedOffering as any).pricing || mongoOffering.pricing,
          createdAt: (savedOffering as any).createdAt || mongoOffering.createdAt,
          updatedAt: (savedOffering as any).updatedAt,
          linkedSpecId: linkedSpecId, // Store the linked spec ID
          linkedPriceId: linkedPriceId, // Store the linked price ID
          '@type': 'ProductOffering'
        };
        
        // IMPORTANT: Update the offering in DB with linkedSpecId and linkedPriceId
        if (linkedSpecId || linkedPriceId) {
          try {
            const updateData: any = {
              updatedAt: new Date().toISOString()
            };
            
            if (linkedSpecId) {
              updateData.linkedSpecId = linkedSpecId;
            }
            
            if (linkedPriceId) {
              updateData.linkedPriceId = linkedPriceId;
            }
            
            await productCatalogApi.updateOffering(savedOffering.id, updateData);
            console.log('✅ Updated offering with linked IDs:', { linkedSpecId, linkedPriceId });
          } catch (linkError) {
            console.warn('⚠️ Could not store linked IDs in offering:', linkError);
          }
        }
        
        // Update local state
        setMongoOfferings(prev => [mongoFormattedOffering, ...prev]);

        // Success message
        let successMessage = `Offering "${formData.name}" created successfully!`;
        if (linkedSpecId && linkedPriceId) {
          successMessage += ' Specification and price auto-created and linked.';
        } else if (linkedSpecId) {
          successMessage += ' Specification auto-created and linked.';
        } else if (linkedPriceId) {
          successMessage += ' Price auto-created and linked.';
        } else {
          successMessage += ' Note: Auto-creation of specification and price failed.';
        }

        toast({
          title: "✅ Success",
          description: successMessage,
        });

        // Reset form and close dialog
        resetForm();
        setIsCreateDialogOpen(false);
        
      } catch (apiError) {
        console.error('❌ TMF620 MongoDB save failed:', apiError);
        
        toast({
          title: "❌ Error",
          description: "Failed to save to MongoDB via TMF620. Please check your backend configuration.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Error creating MongoDB offering:', error);
      
      toast({
        title: "❌ Error",
        description: "Failed to create offering. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ENHANCED: Update offering with spec sync
  const updateMongoOffering = async () => {
    if (!editingOffering) return;

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Create TMF620 update object with MongoDB extensions
      const updateData = {
        name: formData.name,
        description: formData.description,
        lifecycleStatus: formData.lifecycleStatus,
        isBundle: formData.isBundle,
        isSellable: formData.isSellable,
        
        // MongoDB Extensions
        customAttributes: formData.customAttributes.map(attr => ({
          id: attr.id,
          name: attr.name.trim(),
          value: attr.value.trim(),
          type: attr.type
        })),
        pricing: {
          amount: Number(formData.pricing.amount),
          currency: formData.pricing.currency,
          period: formData.pricing.period,
          setupFee: Number(formData.pricing.setupFee),
          deposit: Number(formData.pricing.deposit),
        },
        broadbandSelections: formData.broadbandSelections || [], // Include broadband selections
        hierarchicalCategory: formData.hierarchicalCategory, // Include hierarchical category
        updatedAt: new Date().toISOString(),
        
        '@type': 'ProductOffering'
      };

      console.log('📝 Updating MongoDB offering via TMF620:', updateData);

      // Update via TMF620 MongoDB
      const updatedOffering = await productCatalogApi.updateOffering(editingOffering.id, updateData);
      console.log('✅ Successfully updated in TMF620 MongoDB:', updatedOffering);
      
      // 🔄 AUTO-UPDATE LINKED SPECIFICATION (ONE-WAY SYNC)
      try {
        console.log('🔄 Auto-updating linked specification...');
        
        await updateLinkedSpecification(
          formData.name,           // Updated name
          formData.category,       // Updated category
          formData.description,    // Updated description
          formData.lifecycleStatus, // Updated status
          editingOffering.linkedSpecId // Use stored linked spec ID
        );
        
        console.log('✅ Successfully updated linked specification');
        
      } catch (specError) {
        console.warn('⚠️ Could not update linked specification:', specError);
        // Don't fail the offering update if spec update fails
      }
      
      // Convert response back to MongoDB format
      const mongoFormattedOffering: MongoProductOffering = {
        ...editingOffering,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        categoryDescription: formData.categoryDescription,
        subCategory: formData.subCategory,
        subSubCategory: formData.subSubCategory,
        broadbandSelections: formData.broadbandSelections || [], // Include broadband selections
        hierarchicalCategory: formData.hierarchicalCategory, // Include hierarchical category
        lifecycleStatus: formData.lifecycleStatus,
        isBundle: formData.isBundle,
        isSellable: formData.isSellable,
        customAttributes: formData.customAttributes,
        pricing: {
          amount: Number(formData.pricing.amount),
          currency: formData.pricing.currency,
          period: formData.pricing.period,
          setupFee: Number(formData.pricing.setupFee),
          deposit: Number(formData.pricing.deposit),
        },
        updatedAt: new Date().toISOString(),
      };
      
      // Update local state
      setMongoOfferings(prev => prev.map(o => 
        o.id === editingOffering.id ? mongoFormattedOffering : o
      ));

      // Reset and close
      resetForm();
      setIsEditDialogOpen(false);
      
      toast({
        title: "✅ Success",
        description: `Offering "${formData.name}" updated successfully! Linked specification auto-updated.`,
      });
      
    } catch (error) {
      console.error('❌ Error updating MongoDB offering:', error);
      toast({
        title: "❌ Error",
        description: "Failed to update offering. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteMongoOffering = async (id: string) => {
    try {
      // First, find the offering to get its linkedSpecId
      const offeringToDelete = mongoOfferings.find(o => o.id === id);
      const linkedSpecId = offeringToDelete?.linkedSpecId;
      const linkedPriceId = offeringToDelete?.linkedPriceId;
      const offeringName = offeringToDelete?.name || 'Unknown';
      
      console.log('🗑️ Deleting offering:', offeringName, 'with linkedSpecId:', linkedSpecId, 'and linkedPriceId:', linkedPriceId);

      // Delete the offering via TMF620 MongoDB
      await productCatalogApi.deleteOffering(id);
      console.log('✅ Successfully deleted offering from TMF620 MongoDB');

      // If there's a linked specification, delete it too
      if (linkedSpecId) {
        try {
          console.log('🗑️ Deleting linked specification:', linkedSpecId);
          await productCatalogApi.deleteSpecification(linkedSpecId);
          console.log('✅ Successfully deleted linked specification');
        } catch (specError) {
          console.warn('⚠️ Could not delete linked specification:', specError);
          // Don't fail the offering deletion if spec deletion fails
        }
      } else {
        // Fallback: Try to find and delete spec by name match
        try {
          console.log('🔍 Looking for specification with matching name:', offeringName);
          const allSpecs = await productCatalogApi.getSpecifications();
          const matchingSpec = allSpecs.find((spec: any) => spec.name === offeringName);
          
          if (matchingSpec) {
            console.log('🗑️ Found matching spec by name, deleting:', matchingSpec.id);
            await productCatalogApi.deleteSpecification(matchingSpec.id);
            console.log('✅ Successfully deleted matching specification');
          }
        } catch (specError) {
          console.warn('⚠️ Could not find/delete specification by name:', specError);
        }
      }

      // If there's a linked price, delete it too
      if (linkedPriceId) {
        try {
          console.log('🗑️ Deleting linked price:', linkedPriceId);
          await productCatalogApi.deletePrice(linkedPriceId);
          console.log('✅ Successfully deleted linked price');
        } catch (priceError) {
          console.warn('⚠️ Could not delete linked price:', priceError);
        }
      } else {
        // Fallback: Try to find and delete price by name match
        try {
          console.log('🔍 Looking for price with matching name:', offeringName);
          const allPrices = await productCatalogApi.getPrices();
          const matchingPrice = allPrices.find((price: any) => price.name === offeringName);
          
          if (matchingPrice) {
            console.log('🗑️ Found matching price by name, deleting:', matchingPrice.id);
            await productCatalogApi.deletePrice(matchingPrice.id);
            console.log('✅ Successfully deleted matching price');
          }
        } catch (priceError) {
          console.warn('⚠️ Could not find/delete price by name:', priceError);
        }
      }

      // Update local state
      setMongoOfferings(prev => prev.filter(o => o.id !== id));
      
      toast({
        title: "✅ Success",
        description: linkedSpecId || linkedPriceId 
          ? `Offering "${offeringName}" and its linked specification/price deleted successfully!`
          : `Offering "${offeringName}" deleted successfully!`,
      });
      
    } catch (error) {
      console.error('❌ Error deleting MongoDB offering:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete offering. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get category default attributes
  const getCategoryDefaultAttributes = (category: string, subCategory?: string, subSubCategory?: string): CustomAttribute[] => {
    switch (category) {
      case 'Broadband':
        return [
          { id: Date.now() + '_1', name: 'Connection Type', value: subSubCategory || 'Fiber', type: 'text' },
          { id: Date.now() + '_2', name: 'Package Type', value: subCategory || 'Unlimited', type: 'text' },
          { id: Date.now() + '_3', name: 'Internet Speed', value: '100 Mbps', type: 'text' },
          { id: Date.now() + '_4', name: 'Data Allowance', value: 'Unlimited', type: 'text' },
          { id: Date.now() + '_5', name: 'Contract Term', value: '12 months', type: 'text' },
          { id: Date.now() + '_6', name: 'Installation', value: 'Free', type: 'text' },
        ];
      case 'Business':
        return [
          { id: Date.now() + '_1', name: 'Service Type', value: subCategory || 'Dedicated Internet', type: 'text' },
          { id: Date.now() + '_2', name: 'Business Size', value: subSubCategory || 'SME', type: 'text' },
          { id: Date.now() + '_3', name: 'Bandwidth', value: '200 Mbps Dedicated', type: 'text' },
          { id: Date.now() + '_4', name: 'Static IPs', value: '5 Included', type: 'text' },
          { id: Date.now() + '_5', name: 'SLA Uptime', value: '99.9%', type: 'text' },
          { id: Date.now() + '_6', name: 'Support', value: '24/7 Priority', type: 'text' },
        ];
      case 'Mobile':
        return [
          { id: Date.now() + '_1', name: 'Plan Type', value: subCategory || 'Postpaid', type: 'text' },
          { id: Date.now() + '_2', name: 'Data Plan', value: subSubCategory || 'Unlimited', type: 'text' },
          { id: Date.now() + '_3', name: 'Data', value: 'Unlimited 5G', type: 'text' },
          { id: Date.now() + '_4', name: 'Calls', value: 'Unlimited Local', type: 'text' },
          { id: Date.now() + '_5', name: 'SMS', value: 'Unlimited', type: 'text' },
          { id: Date.now() + '_6', name: 'Roaming', value: '10GB Free', type: 'text' },
        ];
      case 'Cloud Service':
        return [
          { id: Date.now() + '_1', name: 'Service Category', value: subCategory || 'Infrastructure', type: 'text' },
          { id: Date.now() + '_2', name: 'Resource Type', value: subSubCategory || 'Storage', type: 'text' },
          { id: Date.now() + '_3', name: 'Storage', value: '1TB Cloud', type: 'text' },
          { id: Date.now() + '_4', name: 'Compute', value: '4 vCPUs', type: 'text' },
          { id: Date.now() + '_5', name: 'Bandwidth', value: '100GB Transfer', type: 'text' },
          { id: Date.now() + '_6', name: 'Support Level', value: 'Business', type: 'text' },
        ];
      case 'Product':
        return [
          { id: Date.now() + '_1', name: 'Product Category', value: subCategory || 'Hardware', type: 'text' },
          { id: Date.now() + '_2', name: 'Brand', value: subSubCategory || 'SLT Branded', type: 'text' },
          { id: Date.now() + '_3', name: 'Product Type', value: 'Hardware', type: 'text' },
          { id: Date.now() + '_4', name: 'Model', value: 'Standard', type: 'text' },
          { id: Date.now() + '_5', name: 'Warranty', value: '1 Year', type: 'text' },
        ];
      default:
        return [];
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      lifecycleStatus: 'Active',
      category: '',
      subCategory: '',
      subSubCategory: '',
      broadbandSelections: [],
      description: '',
      customAttributes: [],
      isBundle: false,
      isSellable: true,
      pricing: {
        amount: 0,
        currency: 'LKR',
        period: 'per month',
        setupFee: 0,
        deposit: 0,
      }
    });
    setCurrentStep(1);
    setEditingOffering(null);
  };

  const loadOfferingForEdit = (offering: MongoProductOffering, pricingOnly: boolean = false) => {
    setFormData({
      name: offering.name,
      lifecycleStatus: offering.lifecycleStatus,
      category: offering.category,
      categoryDescription: offering.categoryDescription || '',
      subCategory: offering.subCategory || '',
      subSubCategory: offering.subSubCategory || '',
      broadbandSelections: offering.broadbandSelections || [], // Deep copy
      hierarchicalCategory: offering.hierarchicalCategory, // Include hierarchical category
      description: offering.description,
      customAttributes: [...offering.customAttributes], // Deep copy
      isBundle: offering.isBundle,
      isSellable: offering.isSellable,
      pricing: { ...offering.pricing } // Deep copy
    });
    setEditingOffering(offering);
    setCurrentStep(pricingOnly ? 3 : 1); // Start at pricing step if pricingOnly, otherwise at step 1
    setIsEditDialogOpen(true);
  };

  const addCustomAttribute = () => {
    const newAttribute: CustomAttribute = {
      id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: '',
      value: '',
      type: 'text'
    };
    setFormData(prev => ({
      ...prev,
      customAttributes: [...prev.customAttributes, newAttribute]
    }));
  };

  const updateCustomAttribute = (id: string, field: keyof CustomAttribute, value: any) => {
    setFormData(prev => ({
      ...prev,
      customAttributes: prev.customAttributes.map(attr =>
        attr.id === id ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeCustomAttribute = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customAttributes: prev.customAttributes.filter(attr => attr.id !== id)
    }));
  };

  const handleCategoryChange = (selection: {
    mainCategory: CategoryHierarchy;
    subCategories: Array<{
      subCategory: SubCategory;
      subSubCategories: SubSubCategory[];
    }>;
  }) => {
    // Create a comprehensive category description that includes all selected sub-categories
    let categoryDescription = selection.mainCategory.name || selection.mainCategory.label;
    
    if (selection.subCategories.length > 0) {
      const subCategoryDescriptions = selection.subCategories.map(item => {
        let desc = item.subCategory.name || item.subCategory.label;
        if (item.subSubCategories.length > 0) {
          const subSubDescriptions = item.subSubCategories.map(subSub => 
            subSub.name || subSub.label
          ).join(', ');
          desc += ` (${subSubDescriptions})`;
        }
        return desc;
      }).join(' + ');
      
      categoryDescription += ` - ${subCategoryDescriptions}`;
    }
    
    // For backward compatibility, also set the individual fields
    const firstSubCategory = selection.subCategories[0];
    const firstSubSubCategory = firstSubCategory?.subSubCategories[0];
    
    const mainCategoryName = selection.mainCategory.name || selection.mainCategory.label || '';
    const defaultAttributes = getCategoryDefaultAttributes(
      mainCategoryName,
      firstSubCategory?.name || firstSubCategory?.label || '', 
      firstSubSubCategory?.name || firstSubSubCategory?.label || ''
    );
    
    setFormData(prev => ({
      ...prev,
      category: mainCategoryName,
      categoryDescription: categoryDescription,
      subCategory: firstSubCategory?.name || firstSubCategory?.label || '',
      subSubCategory: firstSubSubCategory?.name || firstSubSubCategory?.label || '',
      hierarchicalCategory: selection,
      customAttributes: defaultAttributes
    }));
  };

  const handleBroadbandSelectionsChange = (selections: SubCategorySelection[]) => {
    setFormData(prev => ({
      ...prev,
      broadbandSelections: selections
    }));
  };

  const setIsCreateDialogOpen = (open: boolean) => {
    // This should be passed from parent component
    console.log('setIsCreateDialogOpen called:', open);
  };

  return {
    mongoOfferings,
    formData,
    currentStep,
    editingOffering,
    selectedOffering,
    isEditDialogOpen,
    isViewDialogOpen,
    setMongoOfferings,
    setFormData,
    setCurrentStep,
    setEditingOffering,
    setSelectedOffering,
    setIsEditDialogOpen,
    setIsViewDialogOpen,
    createMongoOffering,
    updateMongoOffering,
    deleteMongoOffering,
    resetForm,
    loadOfferingForEdit,
    addCustomAttribute,
    updateCustomAttribute,
    removeCustomAttribute,
    handleCategoryChange,
    handleBroadbandSelectionsChange,
    setIsCreateDialogOpen,
    loadOfferingsFromTMF620, // For manual refresh
    createSpecificationForOffering, // Export the direct spec creation function
    updateLinkedSpecification, // Export the spec update function
    createPriceForOffering // Export the price creation function
  }};