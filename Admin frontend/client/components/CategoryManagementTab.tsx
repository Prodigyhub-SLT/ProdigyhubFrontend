import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderTree, 
  FolderOpen, 
  Folder,
  Settings,
  Smartphone,
  Wifi,
  Building,
  Building2,
  Cloud,
  Package,
  Tv,
  Phone,
  Gamepad2,
  Globe,
  Gift,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productCatalogApi } from '@/lib/api';
import { CategoryHierarchy, SubCategory, SubSubCategory } from '../../shared/product-order-types';

interface CategoryManagementTabProps {
  onCategoriesChange?: (categories: CategoryHierarchy[]) => void;
}

export function CategoryManagementTab({ onCategoriesChange }: CategoryManagementTabProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [createMainDialogOpen, setCreateMainDialogOpen] = useState(false);
  const [editMainDialogOpen, setEditMainDialogOpen] = useState(false);
  const [createSubDialogOpen, setCreateSubDialogOpen] = useState(false);
  const [editSubDialogOpen, setEditSubDialogOpen] = useState(false);
  const [createSubSubDialogOpen, setCreateSubSubDialogOpen] = useState(false);
  const [editSubSubDialogOpen, setEditSubSubDialogOpen] = useState(false);
  
  // Form states
  const [mainCategoryForm, setMainCategoryForm] = useState({
    name: '',
    value: '',
    label: '',
    description: '',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: 'Folder'
  });
  
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    value: '',
    label: '',
    description: '',
    parentCategory: ''
  });
  
  const [subSubCategoryForm, setSubSubCategoryForm] = useState({
    name: '',
    value: '',
    label: '',
    description: '',
    parentCategory: '',
    parentSubCategory: ''
  });
  
  const [editingMainCategory, setEditingMainCategory] = useState<CategoryHierarchy | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editingSubSubCategory, setEditingSubSubCategory] = useState<SubSubCategory | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<CategoryHierarchy | null>(null);
  const [selectedParentSubCategory, setSelectedParentSubCategory] = useState<SubCategory | null>(null);
  const [categoryUsage, setCategoryUsage] = useState<Map<string, boolean>>(new Map());

  // Load categories from MongoDB on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-expand categories that have sub-categories for better visibility
  useEffect(() => {
    if (categories.length > 0) {
      const categoriesWithSubs = categories.filter(cat => cat.subCategories && cat.subCategories.length > 0);
      const subCategoriesWithSubs = categories.flatMap(cat => 
        cat.subCategories?.filter(sub => sub.subSubCategories && sub.subSubCategories.length > 0) || []
      );
      
      // Auto-expand main categories with sub-categories
      const newExpandedCategories = new Set(categoriesWithSubs.map(cat => cat.id));
      setExpandedCategories(newExpandedCategories);
      
      // Auto-expand sub-categories with sub-sub-categories
      const newExpandedSubCategories = new Set(subCategoriesWithSubs.map(sub => sub.id));
      setExpandedSubCategories(newExpandedSubCategories);
    }
  }, [categories]);

  // Load initial categories if none exist (migrate from hardcoded to MongoDB)
  useEffect(() => {
    const initializeDefaultCategories = async () => {
      try {
        const existingCategories = await productCatalogApi.getHierarchicalCategories();
        if (existingCategories.length === 0) {
          console.log('No categories found in MongoDB, initializing with default categories...');
          await loadDefaultCategoriesToMongoDB();
        }
      } catch (error) {
        console.error('Error checking for existing categories:', error);
      }
    };

    initializeDefaultCategories();
  }, []);

  // Load category usage information
  const loadCategoryUsage = async (categories: CategoryHierarchy[]) => {
    try {
      const offerings = await productCatalogApi.getOfferings();
      const usageMap = new Map<string, boolean>();
      
      categories.forEach(category => {
        const isUsed = offerings.some(offering => 
          offering.category?.some(cat => cat.name === category.name)
        );
        usageMap.set(category.id, isUsed);
      });
      
      setCategoryUsage(usageMap);
    } catch (error) {
      console.error('Error loading category usage:', error);
    }
  };

  // Check if categories are being used by offerings (synchronous from state)
  const checkCategoryUsage = (categoryId: string): boolean => {
    return categoryUsage.get(categoryId) || false;
  };

  // Get category usage statistics
  const getCategoryUsageStats = () => {
    // TODO: Integrate with offerings data to get actual usage statistics
    return {
      totalOfferings: 0,
      categoriesInUse: 0,
      mostUsedCategory: null
    };
  };

  // Load categories from MongoDB hierarchical category API
  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Load categories from MongoDB hierarchical category API
      const hierarchicalCategories = await productCatalogApi.getHierarchicalCategories();
      console.log('Loaded hierarchical categories from MongoDB:', hierarchicalCategories);
      
      if (hierarchicalCategories.length === 0) {
        console.log('No hierarchical categories found in MongoDB');
        setCategories([]);
      } else {
        console.log('Loaded hierarchical categories from MongoDB:', hierarchicalCategories);
        setCategories(hierarchicalCategories);
        if (onCategoriesChange) {
          onCategoriesChange(hierarchicalCategories);
        }
        
        // Load category usage information
        await loadCategoryUsage(hierarchicalCategories);
      }
    } catch (error) {
      console.error('Error loading hierarchical categories from MongoDB:', error);
      toast({
        title: "Error",
        description: "Failed to load hierarchical categories from MongoDB. The backend API may not be fully implemented yet.",
        variant: "destructive",
      });
      setCategories([]);
      
      console.warn('Backend API not responding. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Wifi,
    Settings,
    Smartphone,
    Globe,
    Package,
    Tv,
    Phone,
    Gamepad2,
    Gift,
    Folder,
    FolderOpen,
    FolderTree,
    Building,
    Building2,
    Cloud
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Folder;
  };

  // Load default categories to MongoDB (migrate from hardcoded)
  const loadDefaultCategoriesToMongoDB = async () => {
    try {
      setLoading(true);
      
      // Helper function to generate temporary IDs
      const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const defaultCategories: CategoryHierarchy[] = [
        {
          id: generateTempId(),
          name: 'broadband',
          value: 'broadband',
          label: 'Broadband',
          description: 'Fiber, ADSL, and wireless internet services',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          icon: 'Wifi',
          subCategories: [
            {
              id: generateTempId(),
              name: 'connection_type',
              value: 'connection_type',
              label: 'Connection Type',
              description: 'Type of internet connection',
              subSubCategories: [
                {
                  id: generateTempId(),
                  name: 'fiber',
                  value: 'fiber',
                  label: 'Fiber',
                  description: 'Fiber optic connection'
                },
                {
                  id: generateTempId(),
                  name: 'adsl',
                  value: 'adsl',
                  label: 'ADSL',
                  description: 'ADSL connection'
                }
              ]
            }
          ],
          '@type': 'HierarchicalCategory'
        },
        {
          id: generateTempId(),
          name: 'mobile',
          value: 'mobile',
          label: 'Mobile',
          description: 'Mobile data plans and voice services',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          icon: 'Smartphone',
          subCategories: [
            {
              id: generateTempId(),
              name: 'plan_type',
              value: 'plan_type',
              label: 'Plan Type',
              description: 'Type of mobile plan',
              subSubCategories: [
                {
                  id: generateTempId(),
                  name: 'prepaid',
                  value: 'prepaid',
                  label: 'Prepaid',
                  description: 'Prepaid mobile plan'
                },
                {
                  id: generateTempId(),
                  name: 'postpaid',
                  value: 'postpaid',
                  label: 'Postpaid',
                  description: 'Postpaid mobile plan'
                }
              ]
            }
          ],
          '@type': 'HierarchicalCategory'
        },
        {
          id: generateTempId(),
          name: 'business',
          value: 'business',
          label: 'Business',
          description: 'Enterprise solutions and dedicated services',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: 'Building2',
          subCategories: [
            {
              id: generateTempId(),
              name: 'service_type',
              value: 'service_type',
              label: 'Service Type',
              description: 'Type of business service',
              subSubCategories: [
                {
                  id: generateTempId(),
                  name: 'dedicated',
                  value: 'dedicated',
                  label: 'Dedicated',
                  description: 'Dedicated business service'
                },
                {
                  id: generateTempId(),
                  name: 'shared',
                  value: 'shared',
                  label: 'Shared',
                  description: 'Shared business service'
                }
              ]
            }
          ],
          '@type': 'HierarchicalCategory'
        },
        {
          id: generateTempId(),
          name: 'cloud_service',
          value: 'cloud_service',
          label: 'Cloud Service',
          description: 'Cloud hosting, storage, and computing services',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: 'Globe',
          subCategories: [
            {
              id: generateTempId(),
              name: 'service_category',
              value: 'service_category',
              label: 'Service Category',
              description: 'Category of cloud service',
              subSubCategories: [
                {
                  id: generateTempId(),
                  name: 'hosting',
                  value: 'hosting',
                  label: 'Hosting',
                  description: 'Cloud hosting service'
                },
                {
                  id: generateTempId(),
                  name: 'storage',
                  value: 'storage',
                  label: 'Storage',
                  description: 'Cloud storage service'
                }
              ]
            }
          ],
          '@type': 'HierarchicalCategory'
        }
      ];
      
      // Save each default category to MongoDB
      for (const category of defaultCategories) {
        try {
          await productCatalogApi.createHierarchicalCategory(category);
          console.log(`Default category saved to MongoDB: ${category.name}`);
        } catch (error) {
          console.warn(`Failed to save default category ${category.name}:`, error);
        }
      }
      
      // Reload categories from MongoDB
      await loadCategories();
      
      toast({
        title: "Success",
        description: "Default categories loaded to MongoDB successfully!",
      });
    } catch (error) {
      console.error('Error loading default categories to MongoDB:', error);
      toast({
        title: "Error",
        description: "Failed to load default categories to MongoDB.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load sample data to MongoDB for testing
  const loadSampleDataToMongoDB = async () => {
    try {
      setLoading(true);
      const sampleCategories = getSampleCategories();
      
      // Save each sample category to MongoDB
      for (const category of sampleCategories) {
        try {
          await productCatalogApi.createHierarchicalCategory(category);
          console.log(`Sample category saved to MongoDB: ${category.name}`);
        } catch (error) {
          console.warn(`Failed to save sample category ${category.name}:`, error);
        }
      }
      
      // Reload categories from MongoDB
      await loadCategories();
      
      toast({
        title: "Success",
        description: "Sample data loaded to MongoDB successfully.",
      });
    } catch (error) {
      console.error('Error loading sample data to MongoDB:', error);
      toast({
        title: "Error",
        description: "Failed to load sample data to MongoDB.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryValue: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryValue)) {
      newExpanded.delete(categoryValue);
    } else {
      newExpanded.add(categoryValue);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubCategoryExpansion = (subCategoryValue: string) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(subCategoryValue)) {
      newExpanded.delete(subCategoryValue);
    } else {
      newExpanded.add(subCategoryValue);
    }
    setExpandedSubCategories(newExpanded);
  };

  const resetMainCategoryForm = () => {
    setMainCategoryForm({
      name: '',
      value: '',
      label: '',
      description: '',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: 'Folder'
    });
    setEditingMainCategory(null);
  };

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      name: '',
      value: '',
      label: '',
      description: '',
      parentCategory: ''
    });
    setEditingSubCategory(null);
  };

  const resetSubSubCategoryForm = () => {
    setSubSubCategoryForm({
      name: '',
      value: '',
      label: '',
      description: '',
      parentCategory: '',
      parentSubCategory: ''
    });
    setEditingSubSubCategory(null);
  };

  const handleCreateMainCategory = async () => {
    if (!mainCategoryForm.name || !mainCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a unique value if not provided or if it might conflict
      let uniqueValue = mainCategoryForm.value;
      if (!uniqueValue || categories.some(cat => cat.value === uniqueValue)) {
        // Generate a unique value based on name with timestamp
        const timestamp = Date.now();
        uniqueValue = `${mainCategoryForm.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
      }

      const newCategory: Omit<CategoryHierarchy, 'id'> = {
        name: mainCategoryForm.name,
        value: uniqueValue,
        label: mainCategoryForm.label,
        description: mainCategoryForm.description,
        color: mainCategoryForm.color,
        bgColor: mainCategoryForm.bgColor,
        icon: mainCategoryForm.icon,
        subCategories: []
      };

      // Create the category locally first
      const createdCategory: CategoryHierarchy = {
        ...newCategory,
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Add to local state
      setCategories(prev => [...prev, createdCategory]);
      if (onCategoriesChange) {
        onCategoriesChange([...categories, createdCategory]);
      }
      
             // Save to MongoDB
       try {
         const savedCategory = await productCatalogApi.createHierarchicalCategory(createdCategory);
         console.log('Main category saved to MongoDB:', savedCategory);
         toast({
           title: "Success",
           description: "Main category created successfully and saved to MongoDB.",
         });
       } catch (error: any) {
         console.error('Error saving main category to MongoDB:', error);
         toast({
           title: "Error",
           description: "Failed to save main category to MongoDB. Resource might already exist.",
           variant: "destructive",
         });
       }
      
      setCreateMainDialogOpen(false);
      resetMainCategoryForm();
    } catch (error: any) {
      console.error('Error creating main category:', error);
      
      toast({
        title: "Error",
        description: "Failed to create main category.",
        variant: "destructive",
      });
    }
  };

  const handleEditMainCategory = async () => {
    if (!editingMainCategory || !mainCategoryForm.name || !mainCategoryForm.value || !mainCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedCategory = {
        ...editingMainCategory,
        value: mainCategoryForm.value,
        label: mainCategoryForm.label,
        description: mainCategoryForm.description,
        color: mainCategoryForm.color,
        bgColor: mainCategoryForm.bgColor,
        icon: mainCategoryForm.icon
      };

      // Update local state first
      setCategories(prev => prev.map(cat => cat.id === editingMainCategory.id ? updatedCategory : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === editingMainCategory.id ? updatedCategory : cat));
      }
      
      // Save to MongoDB
      try {
        const savedCategory = await productCatalogApi.updateHierarchicalCategory(editingMainCategory.id, updatedCategory);
        console.log('Main category updated in MongoDB:', savedCategory);
        toast({
          title: "Success",
          description: "Main category updated successfully and saved to MongoDB.",
        });
      } catch (error: any) {
        console.error('Error updating main category in MongoDB:', error);
        toast({
          title: "Error",
          description: "Failed to update main category in MongoDB. Resource might not exist.",
          variant: "destructive",
        });
      }
      
      setEditMainDialogOpen(false);
      resetMainCategoryForm();
    } catch (error) {
      console.error('Error updating main category:', error);
      toast({
        title: "Error",
        description: "Failed to update main category.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMainCategory = async (categoryId: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      if (!categoryToDelete) return;
      
      // Remove category from offerings first
      const offerings = await productCatalogApi.getOfferings();
      const offeringsToUpdate = offerings.filter(offering => 
        offering.category?.some(cat => cat.name === categoryToDelete.name)
      );
      
      // Update offerings to remove this category
      for (const offering of offeringsToUpdate) {
        const updatedOffering = {
          ...offering,
          category: offering.category?.filter(cat => cat.name !== categoryToDelete.name)
        };
        
        await productCatalogApi.updateOffering(offering.id, updatedOffering);
        console.log(`Removed category from offering: ${offering.name}`);
      }
      
      // Delete from MongoDB
      try {
        await productCatalogApi.deleteHierarchicalCategory(categoryId);
        console.log(`Main category deleted from MongoDB: ${categoryId}`);
        
        // Update local state
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        if (onCategoriesChange) {
          onCategoriesChange(categories.filter(cat => cat.id !== categoryId));
        }
        
        toast({
          title: "Success",
          description: `Main category deleted successfully from MongoDB and removed from ${offeringsToUpdate.length} offerings`,
        });
      } catch (error: any) {
        console.error('Error deleting main category from MongoDB:', error);
        toast({
          title: "Error",
          description: "Failed to delete main category from MongoDB. Resource might not exist.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting main category:', error);
      toast({
        title: "Error",
        description: "Failed to delete main category.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubCategory = async () => {
    if (!selectedParentCategory || !subCategoryForm.name || !subCategoryForm.value || !subCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a temporary ID for the new sub-category
      const tempId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newSubCategory: SubCategory = {
        id: tempId,
        name: subCategoryForm.name,
        value: subCategoryForm.value,
        label: subCategoryForm.label,
        description: subCategoryForm.description,
        subSubCategories: []
      };

      // Save to MongoDB
      const updated = await productCatalogApi.addSubCategory(selectedParentCategory.id, newSubCategory);
      console.log('Sub-category saved to MongoDB:', updated);
      
      // Update local state
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-category created successfully and saved to MongoDB.",
      });
      
      setCreateSubDialogOpen(false);
      resetSubCategoryForm();
      setSelectedParentCategory(null);
    } catch (error) {
      console.error('Error creating sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to create sub-category in MongoDB. Resource might already exist.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubCategory = async () => {
    if (!editingSubCategory || !selectedParentCategory || !subCategoryForm.name || !subCategoryForm.value || !subCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedSubCategory = {
        ...editingSubCategory,
        value: subCategoryForm.value,
        label: subCategoryForm.label,
        description: subCategoryForm.description
      };

      // Save to MongoDB
      const updated = await productCatalogApi.updateSubCategory(selectedParentCategory.id, updatedSubCategory);
      console.log('Sub-category updated in MongoDB:', updated);
      
      // Update local state
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-category updated successfully and saved to MongoDB.",
      });
      
      setEditSubDialogOpen(false);
      resetSubCategoryForm();
    } catch (error) {
      console.error('Error updating sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-category in MongoDB. Resource might not exist.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubCategory = async (parentCategoryId: string, subCategoryId: string) => {
    try {
      // Delete from MongoDB
      await productCatalogApi.deleteSubCategory(parentCategoryId, subCategoryId);
      console.log(`Sub-category deleted from MongoDB: ${subCategoryId}`);
      
      // Update local state
      setCategories(prev => prev.map(cat => cat.id === parentCategoryId ? {
        ...cat,
        subCategories: cat.subCategories?.filter(sub => sub.id !== subCategoryId) || []
      } : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === parentCategoryId ? {
          ...cat,
          subCategories: cat.subCategories?.filter(sub => sub.id !== subCategoryId) || []
        } : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-category deleted successfully from MongoDB.",
      });
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category from MongoDB. Resource might not exist.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubSubCategory = async () => {
    if (!selectedParentCategory || !selectedParentSubCategory || !subSubCategoryForm.name || !subSubCategoryForm.value || !subSubCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a temporary ID for the new sub-sub-category
      const tempId = `subsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newSubSubCategory: SubSubCategory = {
        id: tempId,
        name: subSubCategoryForm.name,
        value: subSubCategoryForm.value,
        label: subSubCategoryForm.label,
        description: subSubCategoryForm.description
      };

      // Save to MongoDB
      const updated = await productCatalogApi.addSubSubCategory(selectedParentCategory.id, newSubSubCategory);
      console.log('Sub-sub-category saved to MongoDB:', updated);
      
      // Update local state
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-sub-category created successfully and saved to MongoDB.",
      });
      
      setCreateSubSubDialogOpen(false);
      resetSubSubCategoryForm();
      setSelectedParentSubCategory(null);
    } catch (error) {
      console.error('Error creating sub-sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to create sub-sub-category in MongoDB. Resource might already exist.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubSubCategory = async () => {
    if (!editingSubSubCategory || !selectedParentCategory || !subSubCategoryForm.name || !subSubCategoryForm.value || !subSubCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedSubSubCategory = {
        ...editingSubSubCategory,
        value: subSubCategoryForm.value,
        label: subSubCategoryForm.label,
        description: subSubCategoryForm.description
      };

      // Save to MongoDB
      const updated = await productCatalogApi.updateSubSubCategory(selectedParentCategory.id, updatedSubSubCategory);
      console.log('Sub-sub-category updated in MongoDB:', updated);
      
      // Update local state
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-sub-category updated successfully and saved to MongoDB.",
      });
      
      setEditSubSubDialogOpen(false);
      resetSubSubCategoryForm();
    } catch (error) {
      console.error('Error updating sub-sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-sub-category in MongoDB. Resource might not exist.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubSubCategory = async (parentCategoryId: string, parentSubCategoryId: string, subSubCategoryId: string) => {
    try {
      // Delete from MongoDB
      await productCatalogApi.deleteSubSubCategory(parentCategoryId, subSubCategoryId);
      console.log(`Sub-sub-category deleted from MongoDB: ${subSubCategoryId}`);
      
      // Update local state
      setCategories(prev => prev.map(cat => cat.id === parentCategoryId ? {
        ...cat,
        subCategories: cat.subCategories?.map(sub => sub.id === parentSubCategoryId ? {
          ...sub,
          subSubCategories: sub.subSubCategories?.filter(subSub => subSub.id !== subSubCategoryId) || []
        } : sub) || []
      } : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === parentCategoryId ? {
          ...cat,
          subCategories: cat.subCategories?.map(sub => sub.id === parentSubCategoryId ? {
            ...sub,
            subSubCategories: sub.subSubCategories?.filter(subSub => subSub.id !== subSubCategoryId) || []
          } : sub) || []
        } : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-sub-category deleted successfully from MongoDB.",
      });
    } catch (error) {
      console.error('Error deleting sub-sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-sub-category from MongoDB. Resource might not exist.",
        variant: "destructive",
      });
    }
  };

  const openEditMainCategory = (category: CategoryHierarchy) => {
    setEditingMainCategory(category);
    setMainCategoryForm({
      name: category.name || category.label || '',
      value: category.value,
      label: category.label,
      description: category.description || '',
      color: category.color,
      bgColor: category.bgColor,
      icon: category.icon
    });
    setEditMainDialogOpen(true);
  };

  const openEditSubCategory = (parentCategory: CategoryHierarchy, subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSelectedParentCategory(parentCategory);
    setSubCategoryForm({
      name: subCategory.name || subCategory.label || '',
      value: subCategory.value,
      label: subCategory.label,
      description: subCategory.description || '',
      parentCategory: parentCategory.id
    });
    setEditSubDialogOpen(true);
  };

  const openEditSubSubCategory = (parentCategory: CategoryHierarchy, parentSubCategory: SubCategory, subSubCategory: SubSubCategory) => {
    setEditingSubSubCategory(subSubCategory);
    setSelectedParentCategory(parentCategory);
    setSelectedParentSubCategory(parentSubCategory);
    setSubSubCategoryForm({
      name: subSubCategory.name || subSubCategory.label || '',
      value: subSubCategory.value,
      label: subSubCategory.label,
      description: subSubCategory.description || '',
      parentCategory: parentCategory.id,
      parentSubCategory: parentSubCategory.id
    });
    setEditSubSubDialogOpen(true);
  };

  const openCreateSubCategory = (parentCategory: CategoryHierarchy) => {
    setEditingSubCategory(null); // Clear editing state
    setSelectedParentCategory(parentCategory);
    setSubCategoryForm({
      name: '',
      value: '',
      label: '',
      description: '',
      parentCategory: parentCategory.id
    });
    setCreateSubDialogOpen(true);
  };

  const openCreateSubSubCategory = (parentCategory: CategoryHierarchy, parentSubCategory: SubCategory) => {
    setEditingSubSubCategory(null); // Clear editing state
    setSelectedParentCategory(parentCategory);
    setSelectedParentSubCategory(parentSubCategory);
    setSubSubCategoryForm({
      name: '',
      value: '',
      label: '',
      description: '',
      parentCategory: parentCategory.id,
      parentSubCategory: parentSubCategory.id
    });
    setCreateSubSubDialogOpen(true);
  };

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center justify-between">
                  <div>
           <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
           <p className="text-gray-600">Manage hierarchical categories stored in MongoDB. Create, edit, and delete main categories, sub-categories, and sub-sub-categories.</p>
           <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-blue-600">💡</span>
              <span className="text-sm text-gray-600">
                Categories are stored in MongoDB and can be used in product offerings. Changes here are automatically saved to the database.
               </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-green-600">🔧</span>
              <span className="text-sm text-gray-600">
                Value fields are auto-generated to ensure uniqueness. Use the "Auto" button or leave empty for automatic generation.
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-orange-600">⚠️</span>
              <span className="text-sm text-gray-600">
                If you get a "Resource already exists" error, try using a different name or leave the value field empty.
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-blue-600">📁</span>
              <span className="text-sm text-gray-600">
                <strong>Hierarchical Editing:</strong> Click the arrow buttons to expand categories and see/edit sub-categories and sub-sub-categories. All changes are automatically saved to MongoDB.
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-green-600">✏️</span>
              <span className="text-sm text-gray-600">
                <strong>Edit Any Level:</strong> Use the edit buttons (✏️) on main categories, sub-categories, and sub-sub-categories to modify names, descriptions, and other properties.
              </span>
            </div>
           {categories.length === 0 && !loading && (
             <p className="text-sm text-amber-600 mt-1">
               ⚠️ MongoDB connection may not be available. Categories will be loaded when the database is accessible.
             </p>
           )}
         </div>
        <div className="flex gap-2">
          <Button onClick={loadCategories} variant="outline" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button 
            onClick={loadDefaultCategoriesToMongoDB} 
            variant="outline" 
            className="text-green-600 border-green-600 hover:bg-green-50"
            title="Load default categories (Broadband, Mobile, Business, Cloud Service) to MongoDB"
          >
            Load Default Categories
          </Button>
          <Button 
            onClick={loadSampleDataToMongoDB} 
            variant="outline" 
            className="text-amber-600 border-amber-600 hover:bg-amber-50"
            title="Load sample data to MongoDB for testing"
          >
            Load Sample Data
          </Button>
          <Button 
            onClick={() => {
              setExpandedCategories(new Set());
              setExpandedSubCategories(new Set());
            }} 
            variant="outline" 
            className="text-gray-600 border-gray-600 hover:bg-gray-50"
            title="Collapse all expanded categories"
          >
            Collapse All
          </Button>
          <Button onClick={() => setCreateMainDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Main Category
          </Button>
        </div>
      </div>

             {/* Category Usage Statistics */}
       {categories.length > 0 && (
         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
           <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Category Usage Overview</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white rounded-lg p-4 border border-blue-200">
               <div className="flex items-center space-x-2">
                 <Package className="w-5 h-5 text-blue-600" />
                 <div>
                   <p className="text-sm text-gray-600">Total Categories</p>
                   <p className="text-2xl font-bold text-blue-900">{categories.length}</p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg p-4 border border-blue-200">
               <div className="flex items-center space-x-2">
                 <FolderTree className="w-5 h-5 text-green-600" />
                 <div>
                   <p className="text-sm text-gray-600">Total Sub-categories</p>
                   <p className="text-2xl font-bold text-green-900">
                     {categories.reduce((total, cat) => total + (cat.subCategories?.length || 0), 0)}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg p-4 border border-blue-200">
               <div className="flex items-center space-x-2">
                 <Settings className="w-5 h-5 text-purple-600" />
                 <div>
                   <p className="text-sm text-gray-600">Categories in Use</p>
                   <p className="text-2xl font-bold text-purple-900">
                     {Array.from(categoryUsage.values()).filter(used => used).length}
                   </p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Commonly Used Categories in Offerings */}
       {categories.length > 0 && (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
           <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Categories Used in Offerings</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
             {categories.map((category) => (
               <div key={category.id} className="bg-white rounded-md p-3 border border-blue-200">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center space-x-2">
                     {React.createElement(getIconComponent(category.icon), { 
                       className: `w-4 h-4 ${category.color}` 
                     })}
                     <span className="font-medium text-sm">{category.label}</span>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => openEditMainCategory(category)}
                     className="h-6 w-6 p-0"
                   >
                     <Edit className="w-3 h-3" />
                   </Button>
                 </div>
                 <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                 <div className="flex items-center justify-between text-xs">
                   <span className="text-blue-600">
                     {category.subCategories?.length || 0} sub-categories
                   </span>
                   {checkCategoryUsage(category.id) && (
                     <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                       Active in Offerings
                     </Badge>
                   )}
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Hierarchy Summary */}
       {categories.length > 0 && (
         <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
           <h3 className="text-lg font-semibold text-indigo-900 mb-3">🏗️ Category Hierarchy Overview</h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
               <div className="text-2xl font-bold text-indigo-600">{categories.length}</div>
               <div className="text-sm text-indigo-700">Main Categories</div>
             </div>
             <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
               <div className="text-2xl font-bold text-blue-600">
                 {categories.reduce((total, cat) => total + (cat.subCategories?.length || 0), 0)}
               </div>
               <div className="text-sm text-blue-700">Sub-categories</div>
             </div>
             <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
               <div className="text-2xl font-bold text-green-600">
                 {categories.reduce((total, cat) => 
                   total + (cat.subCategories?.reduce((subTotal, sub) => 
                     subTotal + (sub.subSubCategories?.length || 0), 0) || 0), 0)
                 }
               </div>
               <div className="text-sm text-green-700">Sub-sub-categories</div>
             </div>
             <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
               <div className="text-2xl font-bold text-purple-600">
                 {categories.reduce((total, cat) => 
                   total + (cat.subCategories?.reduce((subTotal, sub) => 
                     subTotal + (sub.subSubCategories?.length || 0), 0) || 0) + (cat.subCategories?.length || 0), 0)
                 }
               </div>
               <div className="text-sm text-purple-700">Total Items</div>
             </div>
           </div>
           <div className="mt-3 text-center">
             <p className="text-sm text-indigo-700">
               💡 <strong>Tip:</strong> Click the arrow buttons (▶️) to expand categories and see all levels. Use edit buttons (✏️) to modify any category level.
             </p>
             <div className="mt-2 flex justify-center space-x-4 text-xs text-indigo-600">
               <span>
                 🔵 <strong>{expandedCategories.size}</strong> main categories expanded
               </span>
               <span>
                 🟢 <strong>{expandedSubCategories.size}</strong> sub-categories expanded
               </span>
               <span>
                 📊 <strong>{categories.length}</strong> total main categories
               </span>
             </div>
           </div>
         </div>
       )}

       {/* Categories List */}
       <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center p-8">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found in MongoDB</h3>
            <p className="text-gray-600 mb-4">Add a main category to get started with your hierarchical category management.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateMainDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Category
              </Button>
              <Button onClick={loadSampleDataToMongoDB} variant="outline" className="text-amber-600 border-amber-600">
                Load Sample Data
              </Button>
              <Button onClick={loadCategories} variant="outline">
                Retry Load
              </Button>
            </div>
          </div>
        ) : (
          categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            const isExpanded = expandedCategories.has(category.id);
             
            return (
              <Card key={category.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className={`p-1 h-8 w-8 ${category.subCategories && category.subCategories.length > 0 ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-400'}`}
                        disabled={!category.subCategories || category.subCategories.length === 0}
                        title={category.subCategories && category.subCategories.length > 0 ? 
                          `Click to ${isExpanded ? 'collapse' : 'expand'} sub-categories (${category.subCategories.length} items)` : 
                          'No sub-categories to expand'
                        }
                      >
                        {category.subCategories && category.subCategories.length > 0 ? (
                          isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50"></div>
                        )}
                      </Button>
                      <IconComponent className={`w-5 h-5 ${category.color}`} />
                      <div>
                        <CardTitle className="text-lg">{category.label}</CardTitle>
                        <CardDescription className="text-sm">{category.description}</CardDescription>
                      </div>
                    </div>
                                         <div className="flex items-center space-x-2">
                       <Badge variant="outline" className="text-xs">
                         {category.subCategories?.length || 0} sub-categories
                       </Badge>
                       {checkCategoryUsage(category.id) && (
                         <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                           Used in Offerings
                         </Badge>
                       )}
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => openEditMainCategory(category)}
                         className="h-8 w-8 p-0"
                       >
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleDeleteMainCategory(category.id)}
                         className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                         disabled={checkCategoryUsage(category.id)}
                         title={checkCategoryUsage(category.id) ? "Cannot delete category used by offerings" : "Delete category"}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                  </div>
                </CardHeader>
               
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="ml-8 space-y-3">
                      {/* Hierarchy Level Indicator */}
                      <div className="flex items-center space-x-2 mb-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Sub-categories</span>
                        <span className="text-sm text-blue-600 font-medium">({category.subCategories?.length || 0} items)</span>
                        <div className="ml-auto">
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                            Level 2
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Sub-categories */}
                      {category.subCategories && category.subCategories.length > 0 ? (
                        category.subCategories.map((subCategory) => {
                          const isSubExpanded = expandedSubCategories.has(subCategory.id);
                          
                          return (
                            <div key={subCategory.id} className="border-l-2 border-blue-200 pl-4 bg-blue-50/30 rounded-r-md">
                              <div className="flex items-center justify-between p-2">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSubCategoryExpansion(subCategory.id)}
                                    className={`p-1 h-6 w-6 ${subCategory.subSubCategories && subCategory.subSubCategories.length > 0 ? 'text-green-600 hover:bg-green-100' : 'text-gray-400'}`}
                                    disabled={!subCategory.subSubCategories || subCategory.subSubCategories.length === 0}
                                    title={subCategory.subSubCategories && subCategory.subSubCategories.length > 0 ? 
                                      `Click to ${isSubExpanded ? 'collapse' : 'expand'} sub-sub-categories (${subCategory.subSubCategories.length} items)` : 
                                      'No sub-sub-categories to expand'
                                    }
                                  >
                                    {subCategory.subSubCategories && subCategory.subSubCategories.length > 0 ? (
                                      isSubExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                                    ) : (
                                      <div className="w-3 h-3 border border-gray-300 rounded-sm bg-gray-50"></div>
                                    )}
                                  </Button>
                                  <FolderOpen className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">{subCategory.label}</span>
                                  <span className="text-sm text-blue-700">- {subCategory.description}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {subCategory.subSubCategories?.length || 0} sub-sub-categories
                                  </Badge>
                                  {checkCategoryUsage(subCategory.id) && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                      Used
                                    </Badge>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditSubCategory(category, subCategory)}
                                    className="h-6 w-6 p-0 border-blue-300 text-blue-700 hover:bg-blue-50"
                                    title="Edit sub-category"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSubCategory(category.id, subCategory.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 border-red-300"
                                    disabled={checkCategoryUsage(subCategory.id)}
                                    title={checkCategoryUsage(subCategory.id) ? "Cannot delete sub-category used by offerings" : "Delete sub-category"}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {isSubExpanded && (
                                <div className="ml-6 mt-2 space-y-2">
                                                                  {/* Sub-sub-categories Level Indicator */}
                                <div className="flex items-center space-x-2 mb-2 p-2 bg-green-50 rounded-md border border-green-200">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">Sub-sub-categories</span>
                                  <span className="text-sm text-green-600 font-medium">({subCategory.subSubCategories?.length || 0} items)</span>
                                  <div className="ml-auto">
                                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                      Level 3
                                    </Badge>
                                  </div>
                                </div>
                                  
                                  {/* Sub-sub-categories */}
                                  {subCategory.subSubCategories && subCategory.subSubCategories.length > 0 ? (
                                    subCategory.subSubCategories.map((subSubCategory) => (
                                      <div key={subSubCategory.id} className="flex items-center justify-between border-l-2 border-green-200 pl-3 bg-green-50/50 rounded-r-md p-2">
                                        <div className="flex items-center space-x-2">
                                          <Folder className="w-3 h-3 text-green-600" />
                                          <span className="text-sm font-medium text-green-900">{subSubCategory.label}</span>
                                          <span className="text-xs text-green-700">- {subSubCategory.description}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditSubSubCategory(category, subCategory, subSubCategory)}
                                            className="h-5 w-5 p-0 border-green-300 text-green-700 hover:bg-green-50"
                                            title="Edit sub-sub-category"
                                          >
                                            <Edit className="w-2.5 h-2.5" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteSubSubCategory(category.id, subCategory.id, subSubCategory.id)}
                                            className="h-5 w-5 p-0 text-red-600 hover:text-red-700 border-red-300"
                                            title="Delete sub-sub-category"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-2 text-sm text-gray-500 bg-gray-50 rounded-md">
                                      No sub-sub-categories yet. Use the button below to add one.
                                    </div>
                                  )}
                                  
                                  {/* Add Sub-sub-category Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCreateSubSubCategory(category, subCategory)}
                                    className="h-6 text-xs border-green-300 text-green-700 hover:bg-green-50"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Sub-sub-category
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-md border-l-2 border-gray-200 pl-4">
                          No sub-categories yet. Use the button below to add one.
                        </div>
                      )}
                      
                      {/* Add Sub-category Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCreateSubCategory(category)}
                        className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sub-category
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Main Category Dialog */}
      <Dialog open={createMainDialogOpen} onOpenChange={setCreateMainDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create Main Category
            </DialogTitle>
            <DialogDescription>
              Add a new main category to your catalog
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateMainCategory();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mainName">Name *</Label>
              <Input
                id="mainName"
                value={mainCategoryForm.name}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Broadband"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainValue">Value (optional - auto-generated if not provided)</Label>
              <div className="flex space-x-2">
                <Input
                  id="mainValue"
                  value={mainCategoryForm.value}
                  onChange={(e) => setMainCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., broadband (leave empty for auto-generation)"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const timestamp = Date.now();
                    const generatedValue = `${mainCategoryForm.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
                    setMainCategoryForm(prev => ({ ...prev, value: generatedValue }));
                  }}
                  disabled={!mainCategoryForm.name}
                  title="Auto-generate unique value"
                >
                  Auto
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainLabel">Label *</Label>
              <Input
                id="mainLabel"
                value={mainCategoryForm.label}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Broadband"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainDescription">Description</Label>
              <Textarea
                id="mainDescription"
                value={mainCategoryForm.description}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainIcon">Icon</Label>
              <Select value={mainCategoryForm.icon} onValueChange={(value) => setMainCategoryForm(prev => ({ ...prev, icon: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wifi">Wifi</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                  <SelectItem value="Smartphone">Smartphone</SelectItem>
                  <SelectItem value="Globe">Globe</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="Tv">Tv</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Gamepad2">Gamepad2</SelectItem>
                  <SelectItem value="Gift">Gift</SelectItem>
                  <SelectItem value="Folder">Folder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainColor">Color</Label>
              <Select value={mainCategoryForm.color} onValueChange={(value) => setMainCategoryForm(prev => ({ ...prev, color: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-blue-600">Blue</SelectItem>
                  <SelectItem value="text-green-600">Green</SelectItem>
                  <SelectItem value="text-purple-600">Purple</SelectItem>
                  <SelectItem value="text-red-600">Red</SelectItem>
                  <SelectItem value="text-indigo-600">Indigo</SelectItem>
                  <SelectItem value="text-orange-600">Orange</SelectItem>
                  <SelectItem value="text-pink-600">Pink</SelectItem>
                  <SelectItem value="text-cyan-600">Cyan</SelectItem>
                  <SelectItem value="text-yellow-600">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainBgColor">Background Color</Label>
              <Select value={mainCategoryForm.bgColor} onValueChange={(value) => setMainCategoryForm(prev => ({ ...prev, bgColor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select background color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-blue-50">Blue</SelectItem>
                  <SelectItem value="bg-green-50">Green</SelectItem>
                  <SelectItem value="bg-purple-50">Purple</SelectItem>
                  <SelectItem value="bg-red-50">Red</SelectItem>
                  <SelectItem value="bg-indigo-50">Indigo</SelectItem>
                  <SelectItem value="bg-orange-50">Orange</SelectItem>
                  <SelectItem value="bg-pink-50">Pink</SelectItem>
                  <SelectItem value="bg-cyan-50">Cyan</SelectItem>
                  <SelectItem value="bg-yellow-50">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setCreateMainDialogOpen(false);
                resetMainCategoryForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Main Category Dialog */}
      <Dialog open={editMainDialogOpen} onOpenChange={setEditMainDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Main Category
            </DialogTitle>
            <DialogDescription>
              Update the main category details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditMainCategory();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mainName">Name *</Label>
              <Input
                id="mainName"
                value={mainCategoryForm.name}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Broadband"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainValue">Value (optional - auto-generated if not provided)</Label>
              <div className="flex space-x-2">
                <Input
                  id="mainValue"
                  value={mainCategoryForm.value}
                  onChange={(e) => setMainCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., broadband (leave empty for auto-generation)"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const timestamp = Date.now();
                    const generatedValue = `${mainCategoryForm.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
                    setMainCategoryForm(prev => ({ ...prev, value: generatedValue }));
                  }}
                  disabled={!mainCategoryForm.name}
                  title="Auto-generate unique value"
                >
                  Auto
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainLabel">Label *</Label>
              <Input
                id="mainLabel"
                value={mainCategoryForm.label}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Broadband"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainDescription">Description</Label>
              <Textarea
                id="mainDescription"
                value={mainCategoryForm.description}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainIcon">Icon</Label>
              <Select value={mainCategoryForm.icon} onValueChange={(value) => setMainCategoryForm(prev => ({ ...prev, icon: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wifi">Wifi</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                  <SelectItem value="Smartphone">Smartphone</SelectItem>
                  <SelectItem value="Globe">Globe</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="Tv">Tv</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Gamepad2">Gamepad2</SelectItem>
                  <SelectItem value="Gift">Gift</SelectItem>
                  <SelectItem value="Folder">Folder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainColor">Color</Label>
              <Select value={mainCategoryForm.color} onValueChange={(value) => setMainCategoryForm(prev => ({ ...prev, color: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-blue-600">Blue</SelectItem>
                  <SelectItem value="text-green-600">Green</SelectItem>
                  <SelectItem value="text-purple-600">Purple</SelectItem>
                  <SelectItem value="text-red-600">Red</SelectItem>
                  <SelectItem value="text-indigo-600">Indigo</SelectItem>
                  <SelectItem value="text-orange-600">Orange</SelectItem>
                  <SelectItem value="text-pink-600">Pink</SelectItem>
                  <SelectItem value="text-cyan-600">Cyan</SelectItem>
                  <SelectItem value="text-yellow-600">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainBgColor">Background Color</Label>
              <Select value={mainCategoryForm.bgColor} onValueChange={(value) => setMainCategoryForm(prev => ({ ...prev, bgColor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select background color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-blue-50">Blue</SelectItem>
                  <SelectItem value="bg-green-50">Green</SelectItem>
                  <SelectItem value="bg-purple-50">Purple</SelectItem>
                  <SelectItem value="bg-red-50">Red</SelectItem>
                  <SelectItem value="bg-indigo-50">Indigo</SelectItem>
                  <SelectItem value="bg-orange-50">Orange</SelectItem>
                  <SelectItem value="bg-pink-50">Pink</SelectItem>
                  <SelectItem value="bg-cyan-50">Cyan</SelectItem>
                  <SelectItem value="bg-yellow-50">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditMainDialogOpen(false);
                resetMainCategoryForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Sub-category Dialog */}
      <Dialog open={createSubDialogOpen} onOpenChange={setCreateSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create Sub-category
            </DialogTitle>
            <DialogDescription>
              Add a new sub-category to {selectedParentCategory?.label || 'the selected category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateSubCategory();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subName">Name *</Label>
              <Input
                id="subName"
                value={subCategoryForm.name}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Connection Type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subValue">Value *</Label>
              <Input
                id="subValue"
                value={subCategoryForm.value}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., connection_type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subLabel">Label *</Label>
              <Input
                id="subLabel"
                value={subCategoryForm.label}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Connection Type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subDescription">Description</Label>
              <Textarea
                id="subDescription"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the sub-category"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setCreateSubDialogOpen(false);
                resetSubCategoryForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-category Dialog */}
      <Dialog open={editSubDialogOpen} onOpenChange={setEditSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubCategory ? 'Edit Sub-category' : 'Create Sub-category'}
            </DialogTitle>
            <DialogDescription>
              {editingSubCategory ? 'Update the sub-category details' : 'Add a new sub-category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingSubCategory) {
              handleEditSubCategory();
            } else {
              handleCreateSubCategory();
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subName">Name *</Label>
              <Input
                id="subName"
                value={subCategoryForm.name}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Connection Type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subValue">Value *</Label>
              <Input
                id="subValue"
                value={subCategoryForm.value}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., connection_type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subLabel">Label *</Label>
              <Input
                id="subLabel"
                value={subCategoryForm.label}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Connection Type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subDescription">Description</Label>
              <Textarea
                id="subDescription"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the sub-category"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditSubDialogOpen(false);
                resetSubCategoryForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSubCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Sub-sub-category Dialog */}
      <Dialog open={createSubSubDialogOpen} onOpenChange={setCreateSubSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create Sub-sub-category
            </DialogTitle>
            <DialogDescription>
              Add a new sub-sub-category to {selectedParentSubCategory?.label || 'the selected sub-category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateSubSubCategory();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subSubName">Name *</Label>
              <Input
                id="subSubName"
                value={subSubCategoryForm.name}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubValue">Value *</Label>
              <Input
                id="subSubValue"
                value={subSubCategoryForm.value}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubLabel">Label *</Label>
              <Input
                id="subSubLabel"
                value={subSubCategoryForm.label}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubDescription">Description</Label>
              <Textarea
                id="subSubDescription"
                value={subSubCategoryForm.description}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the sub-sub-category"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setCreateSubSubDialogOpen(false);
                resetSubSubCategoryForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-sub-category Dialog */}
      <Dialog open={editSubSubDialogOpen} onOpenChange={setEditSubSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubSubCategory ? 'Edit Sub-sub-category' : 'Create Sub-sub-category'}
            </DialogTitle>
            <DialogDescription>
              {editingSubSubCategory ? 'Update the sub-sub-category details' : 'Add a new sub-sub-category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingSubSubCategory) {
              handleEditSubSubCategory();
            } else {
              handleCreateSubSubCategory();
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subSubName">Name *</Label>
              <Input
                id="subSubName"
                value={subSubCategoryForm.name}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubValue">Value *</Label>
              <Input
                id="subSubValue"
                value={subSubCategoryForm.value}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubLabel">Label *</Label>
              <Input
                id="subSubLabel"
                value={subSubCategoryForm.label}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubDescription">Description</Label>
              <Textarea
                id="subSubDescription"
                value={subSubCategoryForm.description}
                onChange={(e) => setSubSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the sub-sub-category"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditSubSubDialogOpen(false);
                resetSubSubCategoryForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSubSubCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sample data for testing when backend is not available
function getSampleCategories(): CategoryHierarchy[] {
  return [
    {
      id: '1',
      name: 'Broadband',
      value: 'broadband',
      label: 'Broadband',
      description: 'Internet connectivity services',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: 'Wifi',
      subCategories: [
        {
          id: '1-1',
          name: 'Connection Type',
          value: 'connection_type',
          label: 'Connection Type',
          description: 'Type of internet connection',
          subSubCategories: [
            {
              id: '1-1-1',
              name: 'Fiber',
              value: 'fiber',
              label: 'Fiber',
              description: 'Fiber optic connection'
            },
            {
              id: '1-1-2',
              name: 'Cable',
              value: 'cable',
              label: 'Cable',
              description: 'Cable internet connection'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Mobile',
      value: 'mobile',
      label: 'Mobile',
      description: 'Mobile phone services',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'Smartphone',
      subCategories: [
        {
          id: '2-1',
          name: 'Plan Type',
          value: 'plan_type',
          label: 'Plan Type',
          description: 'Type of mobile plan',
          subSubCategories: [
            {
              id: '2-1-1',
              name: 'Prepaid',
              value: 'prepaid',
              label: 'Prepaid',
              description: 'Prepaid mobile plans'
            },
            {
              id: '2-1-2',
              name: 'Postpaid',
              value: 'postpaid',
              label: 'Postpaid',
              description: 'Postpaid mobile plans'
            }
          ]
        }
      ]
    }
  ];
}
