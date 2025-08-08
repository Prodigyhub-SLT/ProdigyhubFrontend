// hooks/useMongoSpecsLogic.ts - TMF620 MongoDB Specs Solution
import { useState, useEffect } from "react";
import { productCatalogApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface SpecCharacteristic {
  id: string;
  name: string;
  description: string;
  valueType: 'string' | 'number' | 'boolean' | 'array' | 'object';
  configurable: boolean;
  validFor?: {
    startDateTime: string;
    endDateTime?: string;
  };
}

export interface MongoProductSpec {
  _id?: string;
  id: string;
  name: string;
  description: string;
  category: string;
  lifecycleStatus: 'Active' | 'Draft' | 'Retired';
  brand?: string;
  version: string;
  characteristics: SpecCharacteristic[];
  createdAt: string;
  updatedAt?: string;
  '@type': string;
}

export const useMongoSpecsLogic = () => {
  const { toast } = useToast();
  
  const [mongoSpecs, setMongoSpecs] = useState<MongoProductSpec[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingSpec, setEditingSpec] = useState<MongoProductSpec | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<MongoProductSpec | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    lifecycleStatus: 'Active' as 'Active' | 'Draft' | 'Retired',
    brand: '',
    version: '1.0',
    characteristics: [] as SpecCharacteristic[]
  });

  // Load existing specs from TMF620 MongoDB on mount
  useEffect(() => {
    loadSpecsFromTMF620();
  }, []);

  const loadSpecsFromTMF620 = async () => {
    try {
      console.log('📥 Loading specs from TMF620...');
      const specs = await productCatalogApi.getSpecifications({ limit: 100 });
      console.log('📥 Raw TMF620 specs from MongoDB:', JSON.stringify(specs, null, 2));
      
      // Convert TMF620 specs to MongoDB format
      const mongoFormattedSpecs: MongoProductSpec[] = specs.map(spec => {
        // Extract characteristics
      const characteristics: SpecCharacteristic[] = [];
if ((spec as any).productSpecCharacteristic) {
  (spec as any).productSpecCharacteristic.forEach((char: any, index: number) => {
    characteristics.push({
      id: char.id || `char_${index}`,
      name: char.name || '',
      description: char.description || '',
      valueType: char.valueType || 'string',
      configurable: char.configurable !== false,
      validFor: char.validFor
    });
  });
}
        // Convert to MongoDB format
        const mongoSpec: MongoProductSpec = {
          _id: (spec as any)._id,
          id: spec.id,
          name: spec.name,
          description: spec.description || '',
        category: (() => {
  if (typeof (spec as any).category === 'string') {
    return (spec as any).category;
  } else if (Array.isArray((spec as any).category) && (spec as any).category[0]) {
    return (spec as any).category[0].name || (spec as any).category[0].id || 'Other';
  } else if ((spec as any).category && typeof (spec as any).category === 'object') {
    return ((spec as any).category as any).name || ((spec as any).category as any).id || 'Other';
  } else {
    return 'Other';
  }
})(),
          lifecycleStatus: spec.lifecycleStatus as 'Active' | 'Draft' | 'Retired',
          brand: spec.brand || '',
          version: spec.version || '1.0',
          characteristics: (spec as any).characteristics || characteristics,
          createdAt: (spec as any).createdAt || new Date().toISOString(),
          updatedAt: (spec as any).updatedAt,
          '@type': 'ProductSpecification'
        };

        return mongoSpec;
      });

      setMongoSpecs(mongoFormattedSpecs);
      console.log('✅ Loaded and converted MongoDB specs:', mongoFormattedSpecs);
      
    } catch (error) {
      console.error('❌ Error loading specs from TMF620:', error);
      toast({
        title: "Warning",
        description: "Could not load existing specifications from database.",
        variant: "destructive",
      });
    }
  };

  // Function to automatically create spec when offering is created
  const createSpecForOffering = async (offeringName: string, offeringCategory: string, offeringDescription: string) => {
    try {
      const specData = {
        name: offeringName, // Same name as offering
        description: `Product specification for ${offeringName}. ${offeringDescription}`,
        category: offeringCategory,
        lifecycleStatus: 'Active' as 'Active' | 'Draft' | 'Retired',
        brand: 'ProdigyHub',
        version: '1.0',
        characteristics: getCategoryDefaultCharacteristics(offeringCategory)
      };

      console.log('🔄 Auto-creating spec for offering:', specData);
      const createdSpec = await createMongoSpecInternal(specData);
      
      toast({
        title: "✅ Auto-Created",
        description: `Specification "${offeringName}" automatically created for the offering.`,
      });

      return createdSpec;
    } catch (error) {
      console.error('❌ Error auto-creating spec for offering:', error);
      // Don't show error toast for auto-creation failure
    }
  };

  const createMongoSpec = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Name, Category, Description)",
          variant: "destructive",
        });
        return;
      }

      const result = await createMongoSpecInternal(formData);
      
      if (result) {
        // Reset form and close dialog
        resetForm();
        setIsCreateDialogOpen(false);
        
        toast({
          title: "✅ Success",
          description: `MongoDB specification "${formData.name}" created successfully!`,
        });
      }
      
    } catch (error) {
      console.error('❌ Error creating MongoDB spec:', error);
      toast({
        title: "❌ Error",
        description: "Failed to create specification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createMongoSpecInternal = async (specFormData: typeof formData) => {
    // Create MongoDB spec object
    const mongoSpec: MongoProductSpec = {
      id: `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: specFormData.name.trim(),
      description: specFormData.description.trim(),
      category: specFormData.category,
      lifecycleStatus: specFormData.lifecycleStatus,
      brand: specFormData.brand || 'ProdigyHub',
      version: specFormData.version || '1.0',
      characteristics: specFormData.characteristics.map(char => ({
        id: char.id,
        name: char.name.trim(),
        description: char.description.trim(),
        valueType: char.valueType,
        configurable: char.configurable
      })),
      createdAt: new Date().toISOString(),
      '@type': 'ProductSpecification'
    };

    console.log('📝 Creating MongoDB spec with data:', mongoSpec);

    // Create TMF620 compliant object with MongoDB extensions
    const tmf620SpecWithExtensions = {
      // Standard TMF620 fields
      name: mongoSpec.name,
      description: mongoSpec.description,
      lifecycleStatus: mongoSpec.lifecycleStatus,
      brand: mongoSpec.brand,
      version: mongoSpec.version,
      validFor: {
        startDateTime: new Date().toISOString(),
        endDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // Category reference
      category: [{
        id: `cat_${specFormData.category.toLowerCase().replace(/\s+/g, '_')}`,
        name: specFormData.category,
        '@type': 'CategoryRef'
      }],

      // Product specification characteristics
      productSpecCharacteristic: specFormData.characteristics.map(char => ({
        id: char.id,
        name: char.name,
        description: char.description,
        valueType: char.valueType,
        configurable: char.configurable,
        validFor: char.validFor || {
          startDateTime: new Date().toISOString()
        },
        '@type': 'ProductSpecCharacteristic'
      })),

      // MongoDB Extensions
      characteristics: mongoSpec.characteristics,
      createdAt: mongoSpec.createdAt,

      '@type': 'ProductSpecification'
    };

    try {
      // Save to TMF620 MongoDB with extensions
      console.log('🔄 About to send spec to TMF620 API:', JSON.stringify(tmf620SpecWithExtensions, null, 2));
      
      const savedSpec = await productCatalogApi.createSpecification(tmf620SpecWithExtensions);
      console.log('✅ TMF620 Spec API Response:', JSON.stringify(savedSpec, null, 2));
      
      // Convert response back to MongoDB format
      const mongoFormattedSpec: MongoProductSpec = {
        _id: (savedSpec as any)._id,
        id: savedSpec.id,
        name: savedSpec.name,
        description: savedSpec.description || '',
        category: specFormData.category,
        lifecycleStatus: savedSpec.lifecycleStatus as 'Active' | 'Draft' | 'Retired',
        brand: savedSpec.brand || 'ProdigyHub',
        version: savedSpec.version || '1.0',
        characteristics: (savedSpec as any).characteristics || mongoSpec.characteristics,
        createdAt: (savedSpec as any).createdAt || mongoSpec.createdAt,
        updatedAt: (savedSpec as any).updatedAt,
        '@type': 'ProductSpecification'
      };
      
      // Update local state
      setMongoSpecs(prev => [mongoFormattedSpec, ...prev]);
      
      return mongoFormattedSpec;
      
    } catch (apiError) {
      console.error('❌ TMF620 MongoDB spec save failed:', apiError);
      throw apiError;
    }
  };

  const updateMongoSpec = async () => {
    if (!editingSpec) return;

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
        brand: formData.brand,
        version: formData.version,
        
        // MongoDB Extensions
        characteristics: formData.characteristics.map(char => ({
          id: char.id,
          name: char.name.trim(),
          description: char.description.trim(),
          valueType: char.valueType,
          configurable: char.configurable
        })),
        updatedAt: new Date().toISOString(),
        
        '@type': 'ProductSpecification'
      };

      console.log('📝 Updating MongoDB spec via TMF620:', updateData);

      // Update via TMF620 MongoDB
      const updatedSpec = await productCatalogApi.updateSpecification(editingSpec.id, updateData);
      console.log('✅ Successfully updated spec in TMF620 MongoDB:', updatedSpec);
      
      // Convert response back to MongoDB format
      const mongoFormattedSpec: MongoProductSpec = {
        ...editingSpec,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        lifecycleStatus: formData.lifecycleStatus,
        brand: formData.brand,
        version: formData.version,
        characteristics: formData.characteristics,
        updatedAt: new Date().toISOString(),
      };
      
      // Update local state
      setMongoSpecs(prev => prev.map(s => 
        s.id === editingSpec.id ? mongoFormattedSpec : s
      ));

      // Reset and close
      resetForm();
      setIsEditDialogOpen(false);
      
      toast({
        title: "✅ Success",
        description: `MongoDB specification "${formData.name}" updated successfully!`,
      });
      
    } catch (error) {
      console.error('❌ Error updating MongoDB spec:', error);
      toast({
        title: "❌ Error",
        description: "Failed to update specification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteMongoSpec = async (id: string) => {
    try {
      // Delete via TMF620 MongoDB
      await productCatalogApi.deleteSpecification(id);
      console.log('✅ Successfully deleted spec from TMF620 MongoDB');

      // Update local state
      setMongoSpecs(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: "✅ Success",
        description: "MongoDB specification deleted successfully!",
      });
      
    } catch (error) {
      console.error('❌ Error deleting MongoDB spec:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete specification. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get category default characteristics
  const getCategoryDefaultCharacteristics = (category: string): SpecCharacteristic[] => {
    const baseId = Date.now();
    switch (category) {
      case 'Broadband':
        return [
          { 
            id: `${baseId}_1`, 
            name: 'Internet Speed', 
            description: 'Maximum internet speed provided',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_2`, 
            name: 'TV Channels', 
            description: 'Number and type of TV channels included',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_3`, 
            name: 'Contract Term', 
            description: 'Minimum contract duration',
            valueType: 'string',
            configurable: false
          },
          { 
            id: `${baseId}_4`, 
            name: 'Installation', 
            description: 'Installation service details',
            valueType: 'string',
            configurable: false
          },
        ];
      case 'Business':
        return [
          { 
            id: `${baseId}_1`, 
            name: 'Bandwidth', 
            description: 'Dedicated bandwidth allocation',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_2`, 
            name: 'Static IPs', 
            description: 'Number of static IP addresses',
            valueType: 'number',
            configurable: true
          },
          { 
            id: `${baseId}_3`, 
            name: 'SLA Uptime', 
            description: 'Service level agreement uptime guarantee',
            valueType: 'string',
            configurable: false
          },
          { 
            id: `${baseId}_4`, 
            name: 'Support', 
            description: 'Technical support level',
            valueType: 'string',
            configurable: false
          },
        ];
      case 'Mobile':
        return [
          { 
            id: `${baseId}_1`, 
            name: 'Data', 
            description: 'Data allowance and speed',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_2`, 
            name: 'Calls', 
            description: 'Voice call allowance',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_3`, 
            name: 'SMS', 
            description: 'SMS message allowance',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_4`, 
            name: 'Roaming', 
            description: 'International roaming allowance',
            valueType: 'string',
            configurable: true
          },
        ];
      case 'Cloud Service':
        return [
          { 
            id: `${baseId}_1`, 
            name: 'Storage', 
            description: 'Cloud storage capacity',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_2`, 
            name: 'Compute', 
            description: 'Virtual CPU resources',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_3`, 
            name: 'Bandwidth', 
            description: 'Monthly data transfer allowance',
            valueType: 'string',
            configurable: true
          },
          { 
            id: `${baseId}_4`, 
            name: 'Support Level', 
            description: 'Technical support tier',
            valueType: 'string',
            configurable: false
          },
        ];
      default:
        return [];
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      lifecycleStatus: 'Active' as 'Active' | 'Draft' | 'Retired',
      brand: '',
      version: '1.0',
      characteristics: []
    });
    setCurrentStep(1);
    setEditingSpec(null);
  };

  const loadSpecForEdit = (spec: MongoProductSpec) => {
    setFormData({
      name: spec.name,
      description: spec.description,
      category: spec.category,
      lifecycleStatus: spec.lifecycleStatus,
      brand: spec.brand || '',
      version: spec.version || '1.0',
      characteristics: [...spec.characteristics] // Deep copy
    });
    setEditingSpec(spec);
    setCurrentStep(1);
    setIsEditDialogOpen(true);
  };

  const addCharacteristic = () => {
    const newCharacteristic: SpecCharacteristic = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: '',
      description: '',
      valueType: 'string',
      configurable: true
    };
    setFormData(prev => ({
      ...prev,
      characteristics: [...prev.characteristics, newCharacteristic]
    }));
  };

  const updateCharacteristic = (id: string, field: keyof SpecCharacteristic, value: any) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.map(char =>
        char.id === id ? { ...char, [field]: value } : char
      )
    }));
  };

  const removeCharacteristic = (id: string) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.filter(char => char.id !== id)
    }));
  };

  const handleCategoryChange = (category: string) => {
    const defaultCharacteristics = getCategoryDefaultCharacteristics(category);
    
    setFormData(prev => ({
      ...prev,
      category,
      characteristics: defaultCharacteristics
    }));
  };

  const setIsCreateDialogOpen = (open: boolean) => {
    // This should be passed from parent component
    console.log('setIsCreateDialogOpen called:', open);
  };

  return {
    mongoSpecs,
    formData,
    currentStep,
    editingSpec,
    selectedSpec,
    isEditDialogOpen,
    isViewDialogOpen,
    setMongoSpecs,
    setFormData,
    setCurrentStep,
    setEditingSpec,
    setSelectedSpec,
    setIsEditDialogOpen,
    setIsViewDialogOpen,
    createMongoSpec,
    updateMongoSpec,
    deleteMongoSpec,
    resetForm,
    loadSpecForEdit,
    addCharacteristic,
    updateCharacteristic,
    removeCharacteristic,
    handleCategoryChange,
    setIsCreateDialogOpen,
    loadSpecsFromTMF620,
    createSpecForOffering // Export this for offering creation
  };
};