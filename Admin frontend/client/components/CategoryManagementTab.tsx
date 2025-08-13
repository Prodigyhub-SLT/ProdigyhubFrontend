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
import { SLT_CATEGORIES, CategoryHierarchy, SubCategory, SubSubCategory } from './types/SLTTypes';

interface CategoryManagementTabProps {
  onCategoriesChange?: (categories: CategoryHierarchy[]) => void;
}

export function CategoryManagementTab({ onCategoriesChange }: CategoryManagementTabProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryHierarchy[]>(SLT_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isMainCategoryDialogOpen, setIsMainCategoryDialogOpen] = useState(false);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [isSubSubCategoryDialogOpen, setIsSubSubCategoryDialogOpen] = useState(false);
  
  // Form states
  const [mainCategoryForm, setMainCategoryForm] = useState({
    value: '',
    label: '',
    icon: 'Folder',
    color: 'text-blue-600',
    description: ''
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
  
  // Edit states
  const [editingMainCategory, setEditingMainCategory] = useState<CategoryHierarchy | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editingSubSubCategory, setEditingSubSubCategory] = useState<SubSubCategory | null>(null);

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
      icon: 'Folder',
      color: 'text-blue-600',
      description: ''
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

  const handleCreateMainCategory = () => {
    if (!mainCategoryForm.value || !mainCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (categories.find(cat => cat.value === mainCategoryForm.value)) {
      toast({
        title: "Duplicate Error",
        description: "A category with this value already exists",
        variant: "destructive",
      });
      return;
    }

    const newCategory: CategoryHierarchy = {
      ...mainCategoryForm,
      subCategories: []
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Main category created successfully",
    });
    
    setIsMainCategoryDialogOpen(false);
    resetMainCategoryForm();
  };

  const handleEditMainCategory = () => {
    if (!editingMainCategory || !mainCategoryForm.value || !mainCategoryForm.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.value === editingMainCategory.value 
        ? { ...cat, ...mainCategoryForm }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Main category updated successfully",
    });
    
    setIsMainCategoryDialogOpen(false);
    resetMainCategoryForm();
  };

  const handleDeleteMainCategory = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    if (category?.subCategories && category.subCategories.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete category with existing sub-categories",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = categories.filter(cat => cat.value !== categoryValue);
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Main category deleted successfully",
    });
  };

  const handleCreateSubCategory = () => {
    if (!subCategoryForm.value || !subCategoryForm.label || !subCategoryForm.parentCategory) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const parentCategory = categories.find(cat => cat.value === subCategoryForm.parentCategory);
    if (!parentCategory) return;

    if (parentCategory.subCategories?.find(sub => sub.value === subCategoryForm.value)) {
      toast({
        title: "Duplicate Error",
        description: "A sub-category with this value already exists in this category",
        variant: "destructive",
      });
      return;
    }

    const newSubCategory: SubCategory = {
      value: subCategoryForm.value,
      label: subCategoryForm.label,
      description: subCategoryForm.description,
      subSubCategories: []
    };

    const updatedCategories = categories.map(cat => 
      cat.value === subCategoryForm.parentCategory
        ? { ...cat, subCategories: [...(cat.subCategories || []), newSubCategory] }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Sub-category created successfully",
    });
    
    setIsSubCategoryDialogOpen(false);
    resetSubCategoryForm();
  };

  const handleEditSubCategory = () => {
    if (!editingSubCategory || !subCategoryForm.value || !subCategoryForm.label || !subCategoryForm.parentCategory) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.value === subCategoryForm.parentCategory
        ? {
            ...cat,
            subCategories: cat.subCategories?.map(sub => 
              sub.value === editingSubCategory.value 
                ? { ...sub, ...subCategoryForm }
                : sub
            ) || []
          }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Sub-category updated successfully",
    });
    
    setIsSubCategoryDialogOpen(false);
    resetSubCategoryForm();
  };

  const handleDeleteSubCategory = (parentCategoryValue: string, subCategoryValue: string) => {
    const parentCategory = categories.find(cat => cat.value === parentCategoryValue);
    if (!parentCategory) return;

    const subCategory = parentCategory.subCategories?.find(sub => sub.value === subCategoryValue);
    if (subCategory?.subSubCategories && subCategory.subSubCategories.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete sub-category with existing sub-sub-categories",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.value === parentCategoryValue
        ? {
            ...cat,
            subCategories: cat.subCategories?.filter(sub => sub.value !== subCategoryValue) || []
          }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Sub-category deleted successfully",
    });
  };

  const handleCreateSubSubCategory = () => {
    if (!subSubCategoryForm.value || !subSubCategoryForm.label || !subSubCategoryForm.parentCategory || !subSubCategoryForm.parentSubCategory) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const parentCategory = categories.find(cat => cat.value === subSubCategoryForm.parentCategory);
    if (!parentCategory) return;

    const parentSubCategory = parentCategory.subCategories?.find(sub => sub.value === subSubCategoryForm.parentSubCategory);
    if (!parentSubCategory) return;

    if (parentSubCategory.subSubCategories?.find(subSub => subSub.value === subSubCategoryForm.value)) {
      toast({
        title: "Duplicate Error",
        description: "A sub-sub-category with this value already exists in this sub-category",
        variant: "destructive",
      });
      return;
    }

    const newSubSubCategory: SubSubCategory = {
      value: subSubCategoryForm.value,
      label: subSubCategoryForm.label,
      description: subSubCategoryForm.description
    };

    const updatedCategories = categories.map(cat => 
      cat.value === subSubCategoryForm.parentCategory
        ? {
            ...cat,
            subCategories: cat.subCategories?.map(sub => 
              sub.value === subSubCategoryForm.parentSubCategory
                ? { ...sub, subSubCategories: [...(sub.subSubCategories || []), newSubSubCategory] }
                : sub
            ) || []
          }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Sub-sub-category created successfully",
    });
    
    setIsSubSubCategoryDialogOpen(false);
    resetSubSubCategoryForm();
  };

  const handleEditSubSubCategory = () => {
    if (!editingSubSubCategory || !subSubCategoryForm.value || !subSubCategoryForm.label || !subSubCategoryForm.parentCategory || !subSubCategoryForm.parentSubCategory) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.value === subSubCategoryForm.parentCategory
        ? {
            ...cat,
            subCategories: cat.subCategories?.map(sub => 
              sub.value === subSubCategoryForm.parentSubCategory
                ? {
                    ...sub,
                    subSubCategories: sub.subSubCategories?.map(subSub => 
                      subSub.value === editingSubSubCategory.value 
                        ? { ...subSub, ...subSubCategoryForm }
                        : subSub
                    ) || []
                  }
                : sub
            ) || []
          }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Sub-sub-category updated successfully",
    });
    
    setIsSubSubCategoryDialogOpen(false);
    resetSubSubCategoryForm();
  };

  const handleDeleteSubSubCategory = (parentCategoryValue: string, parentSubCategoryValue: string, subSubCategoryValue: string) => {
    const updatedCategories = categories.map(cat => 
      cat.value === parentCategoryValue
        ? {
            ...cat,
            subCategories: cat.subCategories?.map(sub => 
              sub.value === parentSubCategoryValue
                ? {
                    ...sub,
                    subSubCategories: sub.subSubCategories?.filter(subSub => subSub.value !== subSubCategoryValue) || []
                  }
                : sub
            ) || []
          }
        : cat
    );
    
    setCategories(updatedCategories);
    onCategoriesChange?.(updatedCategories);
    
    toast({
      title: "Success",
      description: "Sub-sub-category deleted successfully",
    });
  };

  const openEditMainCategory = (category: CategoryHierarchy) => {
    setEditingMainCategory(category);
    setMainCategoryForm({
      value: category.value,
      label: category.label,
      icon: category.icon,
      color: category.color,
      description: category.description
    });
    setIsMainCategoryDialogOpen(true);
  };

  const openEditSubCategory = (parentCategoryValue: string, subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({
      value: subCategory.value,
      label: subCategory.label,
      description: subCategory.description,
      parentCategory: parentCategoryValue
    });
    setIsSubCategoryDialogOpen(true);
  };

  const openEditSubSubCategory = (parentCategoryValue: string, parentSubCategoryValue: string, subSubCategory: SubSubCategory) => {
    setEditingSubSubCategory(subSubCategory);
    setSubSubCategoryForm({
      value: subSubCategory.value,
      label: subSubCategory.label,
      description: subSubCategory.description,
      parentCategory: parentCategoryValue,
      parentSubCategory: parentSubCategoryValue
    });
    setIsSubSubCategoryDialogOpen(true);
  };

  const openCreateSubCategory = (parentCategoryValue: string) => {
    setSubCategoryForm({
      value: '',
      label: '',
      description: '',
      parentCategory: parentCategoryValue
    });
    setIsSubCategoryDialogOpen(true);
  };

  const openCreateSubSubCategory = (parentCategoryValue: string, parentSubCategoryValue: string) => {
    setSubSubCategoryForm({
      value: '',
      label: '',
      description: '',
      parentCategory: parentCategoryValue,
      parentSubCategory: parentSubCategoryValue
    });
    setIsSubSubCategoryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
          <p className="text-gray-600">Manage main categories, sub-categories, and sub-sub-categories</p>
        </div>
        <Button onClick={() => setIsMainCategoryDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Main Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          const isExpanded = expandedCategories.has(category.value);
          
          return (
            <Card key={category.value} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryExpansion(category.value)}
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
                      onClick={() => handleDeleteMainCategory(category.value)}
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
                      const isSubExpanded = expandedSubCategories.has(subCategory.value);
                      
                      return (
                        <div key={subCategory.value} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSubCategoryExpansion(subCategory.value)}
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
                                onClick={() => openEditSubCategory(category.value, subCategory)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubCategory(category.value, subCategory.value)}
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
                                <div key={subSubCategory.value} className="flex items-center justify-between border-l border-gray-200 pl-3">
                                  <div className="flex items-center space-x-2">
                                    <Folder className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm">{subSubCategory.label}</span>
                                    <span className="text-xs text-gray-500">- {subSubCategory.description}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditSubSubCategory(category.value, subCategory.value, subSubCategory)}
                                      className="h-5 w-5 p-0"
                                    >
                                      <Edit className="w-2.5 h-2.5" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteSubSubCategory(category.value, subCategory.value, subSubCategory.value)}
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
                                onClick={() => openCreateSubSubCategory(category.value, subCategory.value)}
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
                      onClick={() => openCreateSubCategory(category.value)}
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
        })}
      </div>

      {/* Main Category Dialog */}
      <Dialog open={isMainCategoryDialogOpen} onOpenChange={setIsMainCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMainCategory ? 'Edit Main Category' : 'Create Main Category'}
            </DialogTitle>
            <DialogDescription>
              {editingMainCategory ? 'Update the main category details' : 'Add a new main category to your catalog'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingMainCategory) {
              handleEditMainCategory();
            } else {
              handleCreateMainCategory();
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                value={mainCategoryForm.value}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., broadband"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={mainCategoryForm.label}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Broadband"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
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
              <Label htmlFor="color">Color</Label>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={mainCategoryForm.description}
                onChange={(e) => setMainCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the category"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsMainCategoryDialogOpen(false);
                resetMainCategoryForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingMainCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-category Dialog */}
      <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
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
                setIsSubCategoryDialogOpen(false);
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
      <Dialog open={isSubSubCategoryDialogOpen} onOpenChange={setIsSubSubCategoryDialogOpen}>
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
                setIsSubSubCategoryDialogOpen(false);
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
