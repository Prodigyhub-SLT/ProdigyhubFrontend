import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productCatalogApi } from '@/lib/api';
import { CategoryHierarchy, SubCategory, SubSubCategory } from '../../shared/product-order-types';

interface CategoryManagementTabProps {
  onCategoriesChange?: (categories: CategoryHierarchy[]) => void;
}

export function CategoryManagementTab({ onCategoriesChange }: CategoryManagementTabProps) {
  const { toast } = useToast();
  
  // State management
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
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  
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
  
  // Editing states
  const [editingMainCategory, setEditingMainCategory] = useState<CategoryHierarchy | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editingSubSubCategory, setEditingSubSubCategory] = useState<SubSubCategory | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<CategoryHierarchy | null>(null);
  const [selectedParentSubCategory, setSelectedParentSubCategory] = useState<SubCategory | null>(null);
  
  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'main' | 'sub' | 'subsub';
    category: CategoryHierarchy;
    subCategory?: SubCategory;
    subSubCategory?: SubSubCategory;
  } | null>(null);

  // Load categories from MongoDB on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await productCatalogApi.getHierarchicalCategories();
      setCategories(fetchedCategories);
      if (onCategoriesChange) {
        onCategoriesChange(fetchedCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please check your connection and try again.",
        variant: "destructive",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Wifi, Settings, Smartphone, Globe, Package, Tv, Phone, 
    Gamepad2, Gift, Folder, FolderOpen, FolderTree, Building, Cloud
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Folder;
  };

  // Expansion toggles
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubCategoryExpansion = (subCategoryId: string) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(subCategoryId)) {
      newExpanded.delete(subCategoryId);
    } else {
      newExpanded.add(subCategoryId);
    }
    setExpandedSubCategories(newExpanded);
  };

  // Form reset functions
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

  // Validation functions
  const validateMainCategoryForm = () => {
    if (!mainCategoryForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return false;
    }
    
         // Check for duplicate names
     const existingCategory = categories.find(cat => 
       cat.name.toLowerCase() === mainCategoryForm.name.toLowerCase() && 
       (!editingMainCategory || cat.categoryId !== editingMainCategory.categoryId)
     );
    
    if (existingCategory) {
      toast({
        title: "Validation Error",
        description: "A category with this name already exists",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validateSubCategoryForm = () => {
    if (!subCategoryForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Sub-category name is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!selectedParentCategory) {
      toast({
        title: "Validation Error",
        description: "Parent category is required",
        variant: "destructive",
      });
      return false;
    }
    
         // Check for duplicate names within the same parent
     const existingSubCategory = selectedParentCategory.subCategories?.find(sub => 
       sub.name.toLowerCase() === subCategoryForm.name.toLowerCase() && 
       (!editingSubCategory || sub.subCategoryId !== editingSubCategory.subCategoryId)
     );
    
    if (existingSubCategory) {
      toast({
        title: "Validation Error",
        description: "A sub-category with this name already exists in this category",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validateSubSubCategoryForm = () => {
    if (!subSubCategoryForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Sub-sub-category name is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!selectedParentCategory || !selectedParentSubCategory) {
      toast({
        title: "Validation Error",
        description: "Parent category and sub-category are required",
        variant: "destructive",
      });
      return false;
    }
    
         // Check for duplicate names within the same sub-category
     const existingSubSubCategory = selectedParentSubCategory.subSubCategories?.find(subSub => 
       subSub.name.toLowerCase() === subSubCategoryForm.name.toLowerCase() && 
       (!editingSubSubCategory || subSub.subSubCategoryId !== editingSubSubCategory.subSubCategoryId)
     );
    
    if (existingSubSubCategory) {
      toast({
        title: "Validation Error",
        description: "A sub-sub-category with this name already exists in this sub-category",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // CRUD Operations for Main Categories
  const handleCreateMainCategory = async () => {
    if (!validateMainCategoryForm()) return;

    try {
             const newCategory: Omit<CategoryHierarchy, 'categoryId'> = {
         name: mainCategoryForm.name.trim(),
         value: mainCategoryForm.value.trim() || mainCategoryForm.name.toLowerCase().replace(/\s+/g, '_'),
         label: mainCategoryForm.label.trim() || mainCategoryForm.name.trim(),
         description: mainCategoryForm.description.trim(),
         color: mainCategoryForm.color,
         bgColor: mainCategoryForm.bgColor,
         icon: mainCategoryForm.icon,
         subCategories: []
       };

      const createdCategory = await productCatalogApi.createHierarchicalCategory(newCategory as CategoryHierarchy);
      setCategories(prev => [...prev, createdCategory]);
      if (onCategoriesChange) {
        onCategoriesChange([...categories, createdCategory]);
      }
      
      toast({
        title: "Success",
        description: "Main category created successfully",
      });
      
      setCreateMainDialogOpen(false);
      resetMainCategoryForm();
    } catch (error: any) {
      console.error('Error creating main category:', error);
      const errorMessage = error.message?.includes('duplicate') 
        ? "A category with this name already exists" 
        : "Failed to create main category. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditMainCategory = async () => {
    if (!editingMainCategory || !validateMainCategoryForm()) return;

    try {
      const updatedCategory = {
        ...editingMainCategory,
        name: mainCategoryForm.name.trim(),
        value: mainCategoryForm.value.trim() || mainCategoryForm.name.toLowerCase().replace(/\s+/g, '_'),
        label: mainCategoryForm.label.trim() || mainCategoryForm.name.trim(),
        description: mainCategoryForm.description.trim(),
        color: mainCategoryForm.color,
        bgColor: mainCategoryForm.bgColor,
        icon: mainCategoryForm.icon
      };

             const updated = await productCatalogApi.updateHierarchicalCategory(editingMainCategory.categoryId, updatedCategory);
       setCategories(prev => prev.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
       if (onCategoriesChange) {
         onCategoriesChange(categories.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
       }
      
      toast({
        title: "Success",
        description: "Main category updated successfully",
      });
      
      setEditMainDialogOpen(false);
      resetMainCategoryForm();
    } catch (error: any) {
      console.error('Error updating main category:', error);
      const errorMessage = error.message?.includes('duplicate') 
        ? "A category with this name already exists" 
        : "Failed to update main category. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMainCategory = async (category: CategoryHierarchy) => {
    // Check if category has sub-categories
    if (category.subCategories && category.subCategories.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete a category that has sub-categories. Please delete all sub-categories first.",
        variant: "destructive",
      });
      return;
    }

    setItemToDelete({ type: 'main', category });
    setDeleteConfirmDialogOpen(true);
  };

  const confirmDeleteMainCategory = async () => {
    if (!itemToDelete || itemToDelete.type !== 'main') return;

    try {
             await productCatalogApi.deleteHierarchicalCategory(itemToDelete.category.categoryId);
       setCategories(prev => prev.filter(cat => cat.categoryId !== itemToDelete.category.categoryId));
       if (onCategoriesChange) {
         onCategoriesChange(categories.filter(cat => cat.categoryId !== itemToDelete.category.categoryId));
       }
      
      toast({
        title: "Success",
        description: "Main category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting main category:', error);
      toast({
        title: "Error",
        description: "Failed to delete main category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // CRUD Operations for Sub-Categories
  const handleCreateSubCategory = async () => {
    if (!validateSubCategoryForm()) return;

    try {
             const newSubCategory: Omit<SubCategory, 'subCategoryId'> = {
         name: subCategoryForm.name.trim(),
         value: subCategoryForm.value.trim() || subCategoryForm.name.toLowerCase().replace(/\s+/g, '_'),
         label: subCategoryForm.label.trim() || subCategoryForm.name.trim(),
         description: subCategoryForm.description.trim(),
         subSubCategories: []
       };

             const updated = await productCatalogApi.addSubCategory(selectedParentCategory!.categoryId, newSubCategory as SubCategory);
       setCategories(prev => prev.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
       if (onCategoriesChange) {
         onCategoriesChange(categories.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
       }
      
      toast({
        title: "Success",
        description: "Sub-category created successfully",
      });
      
      setCreateSubDialogOpen(false);
      resetSubCategoryForm();
    } catch (error: any) {
      console.error('Error creating sub-category:', error);
      const errorMessage = error.message?.includes('duplicate') 
        ? "A sub-category with this name already exists" 
        : "Failed to create sub-category. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditSubCategory = async () => {
    if (!editingSubCategory || !validateSubCategoryForm()) return;

    try {
      const updatedSubCategory = {
        ...editingSubCategory,
        name: subCategoryForm.name.trim(),
        value: subCategoryForm.value.trim() || subCategoryForm.name.toLowerCase().replace(/\s+/g, '_'),
        label: subCategoryForm.label.trim() || subCategoryForm.name.trim(),
        description: subCategoryForm.description.trim()
      };

             const updated = await productCatalogApi.updateSubCategory(selectedParentCategory!.categoryId, updatedSubCategory);
       setCategories(prev => prev.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
       if (onCategoriesChange) {
         onCategoriesChange(categories.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
       }
      
      toast({
        title: "Success",
        description: "Sub-category updated successfully",
      });
      
      setEditSubDialogOpen(false);
      resetSubCategoryForm();
    } catch (error: any) {
      console.error('Error updating sub-category:', error);
      const errorMessage = error.message?.includes('duplicate') 
        ? "A sub-category with this name already exists" 
        : "Failed to update sub-category. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubCategory = async (parentCategory: CategoryHierarchy, subCategory: SubCategory) => {
    // Check if sub-category has sub-sub-categories
    if (subCategory.subSubCategories && subCategory.subSubCategories.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete a sub-category that has sub-sub-categories. Please delete all sub-sub-categories first.",
        variant: "destructive",
      });
      return;
    }

    setItemToDelete({ type: 'sub', category: parentCategory, subCategory });
    setDeleteConfirmDialogOpen(true);
  };

  const confirmDeleteSubCategory = async () => {
    if (!itemToDelete || itemToDelete.type !== 'sub' || !itemToDelete.subCategory) return;

    try {
      await productCatalogApi.deleteSubCategory(itemToDelete.category.categoryId, itemToDelete.subCategory.subCategoryId);
      setCategories(prev => prev.map(cat => cat.categoryId === itemToDelete.category.categoryId ? {
        ...cat,
        subCategories: cat.subCategories?.filter(sub => sub.subCategoryId !== itemToDelete.subCategory!.subCategoryId) || []
      } : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.categoryId === itemToDelete.category.categoryId ? {
          ...cat,
          subCategories: cat.subCategories?.filter(sub => sub.subCategoryId !== itemToDelete.subCategory!.subCategoryId) || []
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
        description: "Failed to delete sub-category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // CRUD Operations for Sub-Sub-Categories
  const handleCreateSubSubCategory = async () => {
    if (!validateSubSubCategoryForm()) return;

    try {
      const newSubSubCategory: Omit<SubSubCategory, 'subSubCategoryId'> = {
        name: subSubCategoryForm.name.trim(),
        value: subSubCategoryForm.value.trim() || subSubCategoryForm.name.toLowerCase().replace(/\s+/g, '_'),
        label: subSubCategoryForm.label.trim() || subSubCategoryForm.name.trim(),
        description: subSubCategoryForm.description.trim()
      };

      const updated = await productCatalogApi.addSubSubCategory(selectedParentCategory!.categoryId, newSubSubCategory as SubSubCategory);
      setCategories(prev => prev.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-sub-category created successfully",
      });
      
      setCreateSubSubDialogOpen(false);
      resetSubSubCategoryForm();
    } catch (error: any) {
      console.error('Error creating sub-sub-category:', error);
      const errorMessage = error.message?.includes('duplicate') 
        ? "A sub-sub-category with this name already exists" 
        : "Failed to create sub-sub-category. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditSubSubCategory = async () => {
    if (!editingSubSubCategory || !validateSubSubCategoryForm()) return;

    try {
      const updatedSubSubCategory = {
        ...editingSubSubCategory,
        name: subSubCategoryForm.name.trim(),
        value: subSubCategoryForm.value.trim() || subSubCategoryForm.name.toLowerCase().replace(/\s+/g, '_'),
        label: subSubCategoryForm.label.trim() || subSubCategoryForm.name.trim(),
        description: subSubCategoryForm.description.trim()
      };

      const updated = await productCatalogApi.updateSubSubCategory(selectedParentCategory!.categoryId, updatedSubSubCategory);
      setCategories(prev => prev.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.categoryId === updated.categoryId ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Sub-sub-category updated successfully",
      });
      
      setEditSubSubDialogOpen(false);
      resetSubSubCategoryForm();
    } catch (error: any) {
      console.error('Error updating sub-sub-category:', error);
      const errorMessage = error.message?.includes('duplicate') 
        ? "A sub-sub-category with this name already exists" 
        : "Failed to update sub-sub-category. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubSubCategory = async (parentCategory: CategoryHierarchy, parentSubCategory: SubCategory, subSubCategory: SubSubCategory) => {
    setItemToDelete({ type: 'subsub', category: parentCategory, subCategory: parentSubCategory, subSubCategory });
    setDeleteConfirmDialogOpen(true);
  };

  const confirmDeleteSubSubCategory = async () => {
    if (!itemToDelete || itemToDelete.type !== 'subsub' || !itemToDelete.subCategory || !itemToDelete.subSubCategory) return;

    try {
      await productCatalogApi.deleteSubSubCategory(itemToDelete.category.categoryId, itemToDelete.subSubCategory.subSubCategoryId);
      setCategories(prev => prev.map(cat => cat.categoryId === itemToDelete.category.categoryId ? {
        ...cat,
        subCategories: cat.subCategories?.map(sub => sub.subCategoryId === itemToDelete.subCategory!.subCategoryId ? {
          ...sub,
          subSubCategories: sub.subSubCategories?.filter(subSub => subSub.subSubCategoryId !== itemToDelete.subSubCategory!.subSubCategoryId) || []
        } : sub) || []
      } : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.categoryId === itemToDelete.category.categoryId ? {
          ...cat,
          subCategories: cat.subCategories?.map(sub => sub.subCategoryId === itemToDelete.subCategory!.subCategoryId ? {
            ...sub,
            subSubCategories: sub.subSubCategories?.filter(subSub => subSub.subSubCategoryId !== itemToDelete.subSubCategory!.subSubCategoryId) || []
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
        description: "Failed to delete sub-sub-category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Helper functions for opening dialogs
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
      parentCategory: parentCategory.categoryId
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
      parentCategory: parentCategory.categoryId,
      parentSubCategory: parentSubCategory.subCategoryId
    });
    setEditSubSubDialogOpen(true);
  };

  const openCreateSubCategory = (parentCategory: CategoryHierarchy) => {
    setEditingSubCategory(null);
    setSelectedParentCategory(parentCategory);
    setSubCategoryForm({
      name: '',
      value: '',
      label: '',
      description: '',
      parentCategory: parentCategory.categoryId
    });
    setCreateSubDialogOpen(true);
  };

  const openCreateSubSubCategory = (parentCategory: CategoryHierarchy, parentSubCategory: SubCategory) => {
    setEditingSubSubCategory(null);
    setSelectedParentCategory(parentCategory);
    setSelectedParentSubCategory(parentSubCategory);
    setSubSubCategoryForm({
      name: '',
      value: '',
      label: '',
      description: '',
      parentCategory: parentCategory.categoryId,
      parentSubCategory: parentSubCategory.subCategoryId
    });
    setCreateSubSubDialogOpen(true);
  };

  // Get delete confirmation message
  const getDeleteConfirmationMessage = () => {
    if (!itemToDelete) return '';
    
    switch (itemToDelete.type) {
      case 'main':
        return `Are you sure you want to delete the main category "${itemToDelete.category.name}"? This action cannot be undone.`;
      case 'sub':
        return `Are you sure you want to delete the sub-category "${itemToDelete.subCategory?.name}" from "${itemToDelete.category.name}"? This action cannot be undone.`;
      case 'subsub':
        return `Are you sure you want to delete the sub-sub-category "${itemToDelete.subSubCategory?.name}" from "${itemToDelete.subCategory?.name}"? This action cannot be undone.`;
      default:
        return '';
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    switch (itemToDelete.type) {
      case 'main':
        await confirmDeleteMainCategory();
        break;
      case 'sub':
        await confirmDeleteSubCategory();
        break;
      case 'subsub':
        await confirmDeleteSubSubCategory();
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-gray-600">Manage hierarchical categories for your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadCategories} variant="outline" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={() => setCreateMainDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Main Category
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {categories.length === 0 && !loading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No categories found. Create your first main category to get started with organizing your product catalog.
          </AlertDescription>
        </Alert>
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
            <Button onClick={() => setCreateMainDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          </div>
        ) : (
          categories.map((category) => {
                         const IconComponent = getIconComponent(category.icon);
             const isExpanded = expandedCategories.has(category.categoryId);
              
             return (
               <Card key={category.categoryId} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                                             <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => toggleCategoryExpansion(category.categoryId)}
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
                        onClick={() => handleDeleteMainCategory(category)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        disabled={category.subCategories && category.subCategories.length > 0}
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
                         const isSubExpanded = expandedSubCategories.has(subCategory.subCategoryId);
                         
                         return (
                           <div key={subCategory.subCategoryId} className="border-l-2 border-gray-200 pl-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => toggleSubCategoryExpansion(subCategory.subCategoryId)}
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
                                  onClick={() => handleDeleteSubCategory(category, subCategory)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  disabled={subCategory.subSubCategories && subCategory.subSubCategories.length > 0}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {isSubExpanded && (
                              <div className="ml-6 mt-2 space-y-2">
                                {/* Sub-sub-categories */}
                                                                 {subCategory.subSubCategories?.map((subSubCategory) => (
                                   <div key={subSubCategory.subSubCategoryId} className="flex items-center justify-between border-l border-gray-200 pl-3">
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
                                        onClick={() => handleDeleteSubSubCategory(category, subCategory, subSubCategory)}
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

      {/* Dialogs */}
             <Dialog open={createMainDialogOpen} onOpenChange={setCreateMainDialogOpen}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Create New Main Category</DialogTitle>
             <DialogDescription>
               Add a new main category to your product catalog.
             </DialogDescription>
           </DialogHeader>
           <form onSubmit={(e) => {
             e.preventDefault();
             handleCreateMainCategory();
           }} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="name">Name *</Label>
               <Input
                 id="name"
                 value={mainCategoryForm.name}
                 onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, name: e.target.value })}
                 placeholder="e.g., Broadband"
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="value">Value</Label>
               <Input
                 id="value"
                 value={mainCategoryForm.value}
                 onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, value: e.target.value })}
                 placeholder="e.g., broadband (auto-generated if empty)"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="label">Label</Label>
               <Input
                 id="label"
                 value={mainCategoryForm.label}
                 onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, label: e.target.value })}
                 placeholder="e.g., Broadband (auto-generated if empty)"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="description">Description</Label>
               <Textarea
                 id="description"
                 value={mainCategoryForm.description}
                 onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, description: e.target.value })}
                 placeholder="Brief description of the category"
                 rows={3}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="color">Color</Label>
               <Select value={mainCategoryForm.color} onValueChange={(value) => setMainCategoryForm({ ...mainCategoryForm, color: value })}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select a color" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="text-blue-600">Blue</SelectItem>
                   <SelectItem value="text-green-600">Green</SelectItem>
                   <SelectItem value="text-red-600">Red</SelectItem>
                   <SelectItem value="text-purple-600">Purple</SelectItem>
                   <SelectItem value="text-orange-600">Orange</SelectItem>
                   <SelectItem value="text-yellow-600">Yellow</SelectItem>
                   <SelectItem value="text-indigo-600">Indigo</SelectItem>
                   <SelectItem value="text-pink-600">Pink</SelectItem>
                   <SelectItem value="text-cyan-600">Cyan</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label htmlFor="bgColor">Background Color</Label>
               <Select value={mainCategoryForm.bgColor} onValueChange={(value) => setMainCategoryForm({ ...mainCategoryForm, bgColor: value })}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select a background color" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="bg-blue-50">Blue</SelectItem>
                   <SelectItem value="bg-green-50">Green</SelectItem>
                   <SelectItem value="bg-red-50">Red</SelectItem>
                   <SelectItem value="bg-purple-50">Purple</SelectItem>
                   <SelectItem value="bg-orange-50">Orange</SelectItem>
                   <SelectItem value="bg-yellow-50">Yellow</SelectItem>
                   <SelectItem value="bg-indigo-50">Indigo</SelectItem>
                   <SelectItem value="bg-pink-50">Pink</SelectItem>
                   <SelectItem value="bg-cyan-50">Cyan</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label htmlFor="icon">Icon</Label>
               <Select value={mainCategoryForm.icon} onValueChange={(value) => setMainCategoryForm({ ...mainCategoryForm, icon: value })}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select an icon" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Folder">Folder</SelectItem>
                   <SelectItem value="FolderOpen">Folder Open</SelectItem>
                   <SelectItem value="FolderTree">Folder Tree</SelectItem>
                   <SelectItem value="Settings">Settings</SelectItem>
                   <SelectItem value="Smartphone">Smartphone</SelectItem>
                   <SelectItem value="Wifi">Wifi</SelectItem>
                   <SelectItem value="Building">Building</SelectItem>
                   <SelectItem value="Cloud">Cloud</SelectItem>
                   <SelectItem value="Package">Package</SelectItem>
                   <SelectItem value="Tv">Tv</SelectItem>
                   <SelectItem value="Phone">Phone</SelectItem>
                   <SelectItem value="Gamepad2">Gamepad</SelectItem>
                   <SelectItem value="Globe">Globe</SelectItem>
                   <SelectItem value="Gift">Gift</SelectItem>
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
                 Create Category
               </Button>
             </DialogFooter>
           </form>
         </DialogContent>
       </Dialog>

      <Dialog open={editMainDialogOpen} onOpenChange={setEditMainDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Main Category</DialogTitle>
            <DialogDescription>
              Edit the details of the main category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditMainCategory();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name *</Label>
              <Input
                id="editName"
                value={mainCategoryForm.name}
                onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, name: e.target.value })}
                placeholder="e.g., Broadband"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editValue">Value</Label>
              <Input
                id="editValue"
                value={mainCategoryForm.value}
                onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, value: e.target.value })}
                placeholder="e.g., broadband"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLabel">Label</Label>
              <Input
                id="editLabel"
                value={mainCategoryForm.label}
                onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, label: e.target.value })}
                placeholder="e.g., Broadband"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={mainCategoryForm.description}
                onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, description: e.target.value })}
                placeholder="Brief description of the category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editColor">Color</Label>
              <Select value={mainCategoryForm.color} onValueChange={(value) => setMainCategoryForm({ ...mainCategoryForm, color: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-blue-600">Blue</SelectItem>
                  <SelectItem value="text-green-600">Green</SelectItem>
                  <SelectItem value="text-red-600">Red</SelectItem>
                  <SelectItem value="text-purple-600">Purple</SelectItem>
                  <SelectItem value="text-orange-600">Orange</SelectItem>
                  <SelectItem value="text-yellow-600">Yellow</SelectItem>
                  <SelectItem value="text-indigo-600">Indigo</SelectItem>
                  <SelectItem value="text-pink-600">Pink</SelectItem>
                  <SelectItem value="text-cyan-600">Cyan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBgColor">Background Color</Label>
              <Select value={mainCategoryForm.bgColor} onValueChange={(value) => setMainCategoryForm({ ...mainCategoryForm, bgColor: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a background color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-blue-50">Blue</SelectItem>
                  <SelectItem value="bg-green-50">Green</SelectItem>
                  <SelectItem value="bg-red-50">Red</SelectItem>
                  <SelectItem value="bg-purple-50">Purple</SelectItem>
                  <SelectItem value="bg-orange-50">Orange</SelectItem>
                  <SelectItem value="bg-yellow-50">Yellow</SelectItem>
                  <SelectItem value="bg-indigo-50">Indigo</SelectItem>
                  <SelectItem value="bg-pink-50">Pink</SelectItem>
                  <SelectItem value="bg-cyan-50">Cyan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editIcon">Icon</Label>
              <Select value={mainCategoryForm.icon} onValueChange={(value) => setMainCategoryForm({ ...mainCategoryForm, icon: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Folder">Folder</SelectItem>
                  <SelectItem value="FolderOpen">Folder Open</SelectItem>
                  <SelectItem value="FolderTree">Folder Tree</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                  <SelectItem value="Smartphone">Smartphone</SelectItem>
                  <SelectItem value="Wifi">Wifi</SelectItem>
                  <SelectItem value="Building">Building</SelectItem>
                  <SelectItem value="Cloud">Cloud</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="Tv">Tv</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Gamepad2">Gamepad</SelectItem>
                  <SelectItem value="Globe">Globe</SelectItem>
                  <SelectItem value="Gift">Gift</SelectItem>
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
                Update Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={createSubDialogOpen} onOpenChange={setCreateSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Sub-Category</DialogTitle>
            <DialogDescription>
              Add a new sub-category to the selected main category.
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
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                placeholder="e.g., Connection Type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subValue">Value</Label>
              <Input
                id="subValue"
                value={subCategoryForm.value}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, value: e.target.value })}
                placeholder="e.g., connection_type (auto-generated if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subLabel">Label</Label>
              <Input
                id="subLabel"
                value={subCategoryForm.label}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, label: e.target.value })}
                placeholder="e.g., Connection Type (auto-generated if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subDescription">Description</Label>
              <Textarea
                id="subDescription"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
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
                Create Sub-Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editSubDialogOpen} onOpenChange={setEditSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sub-Category</DialogTitle>
            <DialogDescription>
              Edit the details of the selected sub-category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditSubCategory();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editSubName">Name *</Label>
              <Input
                id="editSubName"
                value={subCategoryForm.name}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                placeholder="e.g., Connection Type"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSubValue">Value</Label>
              <Input
                id="editSubValue"
                value={subCategoryForm.value}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, value: e.target.value })}
                placeholder="e.g., connection_type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSubLabel">Label</Label>
              <Input
                id="editSubLabel"
                value={subCategoryForm.label}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, label: e.target.value })}
                placeholder="e.g., Connection Type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSubDescription">Description</Label>
              <Textarea
                id="editSubDescription"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
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
                Update Sub-Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={createSubSubDialogOpen} onOpenChange={setCreateSubSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Sub-Sub-Category</DialogTitle>
            <DialogDescription>
              Add a new sub-sub-category to the selected sub-category.
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
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, name: e.target.value })}
                placeholder="e.g., Fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubValue">Value</Label>
              <Input
                id="subSubValue"
                value={subSubCategoryForm.value}
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, value: e.target.value })}
                placeholder="e.g., fiber (auto-generated if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubLabel">Label</Label>
              <Input
                id="subSubLabel"
                value={subSubCategoryForm.label}
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, label: e.target.value })}
                placeholder="e.g., Fiber (auto-generated if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subSubDescription">Description</Label>
              <Textarea
                id="subSubDescription"
                value={subSubCategoryForm.description}
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, description: e.target.value })}
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
                Create Sub-Sub-Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editSubSubDialogOpen} onOpenChange={setEditSubSubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sub-Sub-Category</DialogTitle>
            <DialogDescription>
              Edit the details of the selected sub-sub-category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditSubSubCategory();
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editSubSubName">Name *</Label>
              <Input
                id="editSubSubName"
                value={subSubCategoryForm.name}
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, name: e.target.value })}
                placeholder="e.g., Fiber"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSubSubValue">Value</Label>
              <Input
                id="editSubSubValue"
                value={subSubCategoryForm.value}
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, value: e.target.value })}
                placeholder="e.g., fiber"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSubSubLabel">Label</Label>
              <Input
                id="editSubSubLabel"
                value={subSubCategoryForm.label}
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, label: e.target.value })}
                placeholder="e.g., Fiber"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSubSubDescription">Description</Label>
              <Textarea
                id="editSubSubDescription"
                value={subSubCategoryForm.description}
                onChange={(e) => setSubSubCategoryForm({ ...subSubCategoryForm, description: e.target.value })}
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
                Update Sub-Sub-Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {getDeleteConfirmationMessage()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
