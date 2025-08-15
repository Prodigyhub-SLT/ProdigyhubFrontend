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

  // Extract categories from product offerings data
  const extractCategoriesFromOfferings = (offerings: any[]): CategoryHierarchy[] => {
    const categoryMap = new Map<string, CategoryHierarchy>();
    
    offerings.forEach(offering => {
      if (offering.category && Array.isArray(offering.category)) {
        offering.category.forEach((cat: any) => {
          if (cat.name) {
            const categoryKey = cat.name.toLowerCase().replace(/\s+/g, '_');
            
            if (!categoryMap.has(categoryKey)) {
              // Create new main category
              categoryMap.set(categoryKey, {
                id: cat.id || `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: cat.name,
                value: categoryKey,
                label: cat.name,
                description: cat.description || `Category for ${cat.name}`,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                icon: 'Folder',
                subCategories: [],
                '@type': 'HierarchicalCategory'
              });
            }
            
            // Check for sub-categories in offering data
            if (offering.subCategory) {
              const subCategoryKey = offering.subCategory.toLowerCase().replace(/\s+/g, '_');
              let subCategory = categoryMap.get(categoryKey)?.subCategories?.find(sub => sub.value === subCategoryKey);
              
              if (!subCategory) {
                subCategory = {
                  id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name: offering.subCategory,
                  value: subCategoryKey,
                  label: offering.subCategory,
                  description: `Sub-category for ${offering.subCategory}`,
                  subSubCategories: []
                };
                
                if (categoryMap.get(categoryKey)) {
                  categoryMap.get(categoryKey)!.subCategories.push(subCategory);
                }
              }
              
              // Check for sub-sub-categories
              if (offering.subSubCategory) {
                const subSubCategoryKey = offering.subSubCategory.toLowerCase().replace(/\s+/g, '_');
                let subSubCategory = subCategory.subSubCategories.find(subSub => subSub.value === subSubCategoryKey);
                
                if (!subSubCategory) {
                  subSubCategory = {
                    id: `subsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: offering.subSubCategory,
                    value: subSubCategoryKey,
                    label: offering.subSubCategory,
                    description: `Sub-sub-category for ${offering.subSubCategory}`
                  };
                  
                  subCategory.subSubCategories.push(subSubCategory);
                }
              }
            }
          }
        });
      }
    });
    
    return Array.from(categoryMap.values());
  };

  // Update offerings when categories are modified
  const updateOfferingsWithCategoryChanges = async (oldCategory: CategoryHierarchy, newCategory: CategoryHierarchy) => {
    try {
      // Get all offerings
      const offerings = await productCatalogApi.getOfferings();
      
      // Find offerings that use the old category
      const offeringsToUpdate = offerings.filter(offering => 
        offering.category?.some(cat => cat.name === oldCategory.name)
      );
      
      console.log(`Found ${offeringsToUpdate.length} offerings to update for category: ${oldCategory.name}`);
      
      // Update each offering
      for (const offering of offeringsToUpdate) {
        const updatedOffering = {
          ...offering,
          category: offering.category?.map(cat => 
            cat.name === oldCategory.name 
              ? { ...cat, name: newCategory.name, description: newCategory.description }
              : cat
          )
        };
        
        await productCatalogApi.updateOffering(offering.id, updatedOffering);
        console.log(`Updated offering: ${offering.name}`);
      }
      
      toast({
        title: "Success",
        description: `Updated ${offeringsToUpdate.length} offerings with category changes`,
      });
      
    } catch (error) {
      console.error('Error updating offerings with category changes:', error);
      toast({
        title: "Warning",
        description: "Category updated but failed to update related offerings. Please check offerings manually.",
        variant: "destructive",
      });
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Load categories from product offerings instead of separate categories table
      const offerings = await productCatalogApi.getOfferings();
      console.log('Loaded offerings for category extraction:', offerings);
      
      // Extract and organize categories from offerings
      const extractedCategories = extractCategoriesFromOfferings(offerings);
      
      if (extractedCategories.length === 0) {
        console.log('No categories found in offerings');
        setCategories([]);
      } else {
        console.log('Extracted categories from offerings:', extractedCategories);
        setCategories(extractedCategories);
        if (onCategoriesChange) {
          onCategoriesChange(extractedCategories);
        }
        
        // Load category usage information
        await loadCategoryUsage(extractedCategories);
      }
    } catch (error) {
      console.error('Error loading categories from offerings:', error);
      toast({
        title: "Error",
        description: "Failed to load categories from product offerings. The backend API may not be fully implemented yet.",
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
    Cloud
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Folder;
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
      
      // TODO: Update offerings that might use this category
      // For now, we'll just show success
      
      toast({
        title: "Success",
        description: "Main category created successfully. Note: This category is not yet linked to any offerings.",
      });
      
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
      
      // Update offerings that use this category
      await updateOfferingsWithCategoryChanges(editingMainCategory, updatedCategory);
      
      toast({
        title: "Success",
        description: "Main category updated successfully and related offerings updated",
      });
      
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
      
      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      if (onCategoriesChange) {
        onCategoriesChange(categories.filter(cat => cat.id !== categoryId));
      }
      
      toast({
        title: "Success",
        description: `Main category deleted successfully and removed from ${offeringsToUpdate.length} offerings`,
      });
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
      const newSubCategory: Omit<SubCategory, 'id'> = {
        name: subCategoryForm.name,
        value: subCategoryForm.value,
        label: subCategoryForm.label,
        description: subCategoryForm.description,
        subSubCategories: []
      };

      const updated = await productCatalogApi.addSubCategory(selectedParentCategory.id, newSubCategory as SubCategory);
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-category created successfully",
      });
      
      setCreateSubDialogOpen(false);
      resetSubCategoryForm();
    } catch (error) {
      console.error('Error creating sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to create sub-category. The backend API may not be fully implemented yet.",
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

      const updated = await productCatalogApi.updateSubCategory(selectedParentCategory.id, updatedSubCategory);
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-category updated successfully",
      });
      
      setEditSubDialogOpen(false);
      resetSubCategoryForm();
    } catch (error) {
      console.error('Error updating sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-category. The backend API may not be fully implemented yet.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubCategory = async (parentCategoryId: string, subCategoryId: string) => {
    try {
      await productCatalogApi.deleteSubCategory(parentCategoryId, subCategoryId);
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
        description: "Sub-category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-category. The backend API may not be fully implemented yet.",
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
      const newSubSubCategory: Omit<SubSubCategory, 'id'> = {
        name: subSubCategoryForm.name,
        value: subSubCategoryForm.value,
        label: subSubCategoryForm.label,
        description: subSubCategoryForm.description
      };

      const updated = await productCatalogApi.addSubSubCategory(selectedParentCategory.id, newSubSubCategory as SubSubCategory);
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-sub-category created successfully",
      });
      
      setCreateSubSubDialogOpen(false);
      resetSubSubCategoryForm();
    } catch (error) {
      console.error('Error creating sub-sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to create sub-sub-category. The backend API may not be fully implemented yet.",
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

      const updated = await productCatalogApi.updateSubSubCategory(selectedParentCategory.id, updatedSubSubCategory);
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-sub-category updated successfully",
      });
      
      setEditSubSubDialogOpen(false);
      resetSubSubCategoryForm();
    } catch (error) {
      console.error('Error updating sub-sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-sub-category. The backend API may not be fully implemented yet.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubSubCategory = async (parentCategoryId: string, parentSubCategoryId: string, subSubCategoryId: string) => {
    try {
      await productCatalogApi.deleteSubSubCategory(parentCategoryId, subSubCategoryId);
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
        description: "Sub-sub-category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting sub-sub-category:', error);
      toast({
        title: "Error",
        description: "Failed to delete sub-sub-category. The backend API may not be fully implemented yet.",
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
           <p className="text-gray-600">Manage categories extracted from product offerings. Edit categories to update offerings automatically.</p>
                       <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-blue-600">💡</span>
              <span className="text-sm text-gray-600">
                Categories are extracted from existing product offerings. Changes here will update the offerings data.
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
           {categories.length === 0 && !loading && (
             <p className="text-sm text-amber-600 mt-1">
               ⚠️ Backend API may not be running. Categories will be loaded when the server is available.
             </p>
           )}
         </div>
        <div className="flex gap-2">
          <Button onClick={loadCategories} variant="outline" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => setCategories(getSampleCategories())} 
            variant="outline" 
            className="text-amber-600 border-amber-600 hover:bg-amber-50"
            title="Load sample data for testing"
          >
            Load Sample Data
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">Add a main category to get started with your product catalog.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateMainDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Category
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
                        className="p-1 h-8 w-8"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
                      {/* Sub-categories */}
                      {category.subCategories?.map((subCategory) => {
                        const isSubExpanded = expandedSubCategories.has(subCategory.id);
                        
                        return (
                          <div key={subCategory.id} className="border-l-2 border-gray-200 pl-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSubCategoryExpansion(subCategory.id)}
                                  className="p-1 h-6 w-6"
                                >
                                  {isSubExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </Button>
                                <FolderOpen className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{subCategory.label}</span>
                                <span className="text-sm text-gray-500">- {subCategory.description}</span>
                              </div>
                                                             <div className="flex items-center space-x-2">
                                 <Badge variant="secondary" className="text-xs">
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
                                   className="h-6 w-6 p-0"
                                 >
                                   <Edit className="w-3 h-3" />
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => handleDeleteSubCategory(category.id, subCategory.id)}
                                   className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                   disabled={checkCategoryUsage(subCategory.id)}
                                   title={checkCategoryUsage(subCategory.id) ? "Cannot delete sub-category used by offerings" : "Delete sub-category"}
                                 >
                                   <Trash2 className="w-3 h-3" />
                                 </Button>
                               </div>
                            </div>
                            
                            {isSubExpanded && (
                              <div className="ml-6 mt-2 space-y-2">
                                {/* Sub-sub-categories */}
                                {subCategory.subSubCategories?.map((subSubCategory) => (
                                  <div key={subSubCategory.id} className="flex items-center justify-between border-l border-gray-200 pl-3">
                                    <div className="flex items-center space-x-2">
                                      <Folder className="w-3 h-3 text-gray-400" />
                                      <span className="text-sm">{subSubCategory.label}</span>
                                      <span className="text-xs text-gray-500">- {subSubCategory.description}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditSubSubCategory(category, subCategory, subSubCategory)}
                                        className="h-5 w-5 p-0"
                                      >
                                        <Edit className="w-2.5 h-2.5" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteSubSubCategory(category.id, subCategory.id, subSubCategory.id)}
                                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Add Sub-sub-category Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openCreateSubSubCategory(category, subCategory)}
                                  className="h-6 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Sub-sub-category
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Add Sub-category Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCreateSubCategory(category)}
                        className="h-8"
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
