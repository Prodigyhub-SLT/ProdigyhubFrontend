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
    value: '',
    label: '',
    description: '',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: 'Folder'
  });
  
  const [subCategoryForm, setSubCategoryForm] = useState({
    value: '',
    label: '',
    description: '',
    parentCategory: ''
  });
  
  const [subSubCategoryForm, setSubSubCategoryForm] = useState({
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

  // Load categories from MongoDB on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await productCatalogApi.getHierarchicalCategories();
      
      if (fetchedCategories.length === 0) {
        // If no categories in MongoDB, show empty state
        console.log('No categories found in MongoDB');
        setCategories([]);
      } else {
        setCategories(fetchedCategories);
        if (onCategoriesChange) {
          onCategoriesChange(fetchedCategories);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories from database. The backend API may not be fully implemented yet.",
        variant: "destructive",
      });
      setCategories([]);
      
      // Show additional error info
      console.warn('Backend API not responding. Please check if the server is running.');
      
      // Optionally, you can uncomment the following lines to show sample data for testing
      // setCategories(getSampleCategories());
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
      value: '',
      label: '',
      description: '',
      parentCategory: ''
    });
    setEditingSubCategory(null);
  };

  const resetSubSubCategoryForm = () => {
    setSubSubCategoryForm({
      value: '',
      label: '',
      description: '',
      parentCategory: '',
      parentSubCategory: ''
    });
    setEditingSubSubCategory(null);
  };

  const handleCreateMainCategory = async () => {
    if (!mainCategoryForm.value || !mainCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCategory: Omit<CategoryHierarchy, 'id'> = {
        value: mainCategoryForm.value,
        label: mainCategoryForm.label,
        description: mainCategoryForm.description,
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
    } catch (error) {
      console.error('Error creating main category:', error);
      toast({
        title: "Error",
        description: "Failed to create main category. The backend API may not be fully implemented yet.",
        variant: "destructive",
      });
    }
  };

  const handleEditMainCategory = async () => {
    if (!editingMainCategory || !mainCategoryForm.value || !mainCategoryForm.label) {
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

      const updated = await productCatalogApi.updateHierarchicalCategory(editingMainCategory.id, updatedCategory);
      setCategories(prev => prev.map(cat => cat.id === updated.id ? updated : cat));
      if (onCategoriesChange) {
        onCategoriesChange(categories.map(cat => cat.id === updated.id ? updated : cat));
      }
      
      toast({
        title: "Success",
        description: "Main category updated successfully",
      });
      
      setEditMainDialogOpen(false);
      resetMainCategoryForm();
    } catch (error) {
      console.error('Error updating main category:', error);
      toast({
        title: "Error",
        description: "Failed to update main category. The backend API may not be fully implemented yet.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMainCategory = async (categoryId: string) => {
    try {
      await productCatalogApi.deleteHierarchicalCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      if (onCategoriesChange) {
        onCategoriesChange(categories.filter(cat => cat.id !== categoryId));
      }
      
      toast({
        title: "Success",
        description: "Main category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting main category:', error);
      toast({
        title: "Error",
        description: "Failed to delete main category. The backend API may not be fully implemented yet.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubCategory = async () => {
    if (!selectedParentCategory || !subCategoryForm.value || !subCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSubCategory: Omit<SubCategory, 'id'> = {
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
    if (!editingSubCategory || !selectedParentCategory || !subCategoryForm.value || !subCategoryForm.label) {
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
    if (!selectedParentCategory || !selectedParentSubCategory || !subSubCategoryForm.value || !subSubCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSubSubCategory: Omit<SubSubCategory, 'id'> = {
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
    if (!editingSubSubCategory || !selectedParentCategory || !subSubCategoryForm.value || !subSubCategoryForm.label) {
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
          <p className="text-gray-600">Manage main categories, sub-categories, and sub-sub-categories</p>
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
              <Label htmlFor="mainValue">Value *</Label>
              <Input
                id="mainValue"
                value={mainCategoryForm.value}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., broadband"
                required
              />
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
              <Label htmlFor="mainValue">Value *</Label>
              <Input
                id="mainValue"
                value={mainCategoryForm.value}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., broadband"
                required
              />
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
      value: 'broadband',
      label: 'Broadband',
      description: 'Internet connectivity services',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: 'Wifi',
      subCategories: [
        {
          id: '1-1',
          value: 'connection_type',
          label: 'Connection Type',
          description: 'Type of internet connection',
          subSubCategories: [
            {
              id: '1-1-1',
              value: 'fiber',
              label: 'Fiber',
              description: 'Fiber optic connection'
            },
            {
              id: '1-1-2',
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
      value: 'mobile',
      label: 'Mobile',
      description: 'Mobile phone services',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'Smartphone',
      subCategories: [
        {
          id: '2-1',
          value: 'plan_type',
          label: 'Plan Type',
          description: 'Type of mobile plan',
          subSubCategories: [
            {
              id: '2-1-1',
              value: 'prepaid',
              label: 'Prepaid',
              description: 'Prepaid mobile plans'
            },
            {
              id: '2-1-2',
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
