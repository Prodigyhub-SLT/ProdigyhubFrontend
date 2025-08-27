import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Building, 
  Smartphone, 
  Cloud, 
  Package, 
  Tv, 
  Phone, 
  Gamepad2, 
  Globe, 
  Gift,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  X,
  Plus,
  FolderTree,
  Settings
} from 'lucide-react';
import { productCatalogApi } from '@/lib/api';
import { CategoryHierarchy, SubCategory, SubSubCategory } from '../../shared/product-order-types';

interface HierarchicalCategorySelectorProps {
  onCategorySelect: (selection: {
    mainCategory: CategoryHierarchy;
    subCategories: Array<{
      subCategory: SubCategory;
      subSubCategories: SubSubCategory[];
    }>;
  }) => void;
  selectedCategory?: {
    mainCategory: CategoryHierarchy;
    subCategories: Array<{
      subCategory: SubCategory;
      subSubCategories: SubSubCategory[];
    }>;
  };
  showSubCategories?: boolean;
  showSubSubCategories?: boolean;
  className?: string;
  allowMultipleSelections?: boolean;
}

export function HierarchicalCategorySelector({ 
  onCategorySelect, 
  selectedCategory,
  showSubCategories = true,
  showSubSubCategories = true,
  className = "",
  allowMultipleSelections = true
}: HierarchicalCategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  
  // Multiple selection state
  const [selectedMainCategory, setSelectedMainCategory] = useState<CategoryHierarchy | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<Array<{
    subCategory: SubCategory;
    subSubCategories: SubSubCategory[];
  }>>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Initialize from props if available
  useEffect(() => {
    if (selectedCategory) {
      setSelectedMainCategory(selectedCategory.mainCategory);
      setSelectedSubCategories(selectedCategory.subCategories || []);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await productCatalogApi.getHierarchicalCategories();
      
      // Handle the API response structure - categories might be wrapped in a 'value' array
      let fetchedCategories = response;
      if (response && typeof response === 'object' && 'value' in response && Array.isArray(response.value)) {
        fetchedCategories = response.value;
      }
      
      // Ensure all categories have required properties
      const validatedCategories = fetchedCategories.filter(category => {
        if (!category || typeof category !== 'object') return false;
        
        // Check if category has a unique identifier (either categoryId or _id)
        const hasId = category.categoryId || (category as any)._id;
        if (!hasId) {
          console.warn('Category missing ID:', category);
          return false;
        }
        
        return true;
      }).map(category => ({
        ...category,
        // Ensure categoryId exists
        categoryId: category.categoryId || (category as any)._id,
        // Ensure subCategories is an array
        subCategories: Array.isArray(category.subCategories) ? category.subCategories : [],
        // Ensure icon exists
        icon: category.icon || 'Folder'
      }));
      
      setCategories(validatedCategories);
      console.log('Loaded categories in HierarchicalCategorySelector:', validatedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
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

  // Selection handlers
  const handleMainCategorySelect = (category: CategoryHierarchy) => {
    setSelectedMainCategory(category);
    setSelectedSubCategories([]); // Reset sub-categories when main category changes
    onCategorySelect({
      mainCategory: category,
      subCategories: []
    });
  };

  const handleSubCategorySelect = (subCategory: SubCategory) => {
    if (!selectedMainCategory) return;

    if (allowMultipleSelections) {
      // Check if this sub-category is already selected
      const existingIndex = selectedSubCategories.findIndex(
        item => item.subCategory.subCategoryId === subCategory.subCategoryId
      );

      if (existingIndex >= 0) {
        // Remove if already selected
        const updated = selectedSubCategories.filter((_, index) => index !== existingIndex);
        setSelectedSubCategories(updated);
        onCategorySelect({
          mainCategory: selectedMainCategory,
          subCategories: updated
        });
      } else {
        // Add new selection
        const updated = [...selectedSubCategories, {
          subCategory,
          subSubCategories: []
        }];
        setSelectedSubCategories(updated);
        onCategorySelect({
          mainCategory: selectedMainCategory,
          subCategories: updated
        });
      }
    } else {
      // Single selection mode
      const updated = [{
        subCategory,
        subSubCategories: []
      }];
      setSelectedSubCategories(updated);
      onCategorySelect({
        mainCategory: selectedMainCategory,
        subCategories: updated
      });
    }
  };

  const handleSubSubCategorySelect = (subCategory: SubCategory, subSubCategory: SubSubCategory) => {
    if (!selectedMainCategory) return;

    // Find the parent sub-category in our selections
    const subCategoryIndex = selectedSubCategories.findIndex(
      item => item.subCategory.subCategoryId === subCategory.subCategoryId
    );

    if (subCategoryIndex >= 0) {
      const updated = [...selectedSubCategories];
      const currentSubSubCategories = updated[subCategoryIndex].subSubCategories;
      
      // Check if this sub-sub-category is already selected
      const existingIndex = currentSubSubCategories.findIndex(
        item => item.subSubCategoryId === subSubCategory.subSubCategoryId
      );

      if (existingIndex >= 0) {
        // Remove if already selected
        updated[subCategoryIndex].subSubCategories = currentSubSubCategories.filter(
          (_, index) => index !== existingIndex
        );
      } else {
        // Add new selection
        updated[subCategoryIndex].subSubCategories = [...currentSubSubCategories, subSubCategory];
      }

      setSelectedSubCategories(updated);
      onCategorySelect({
        mainCategory: selectedMainCategory,
        subCategories: updated
      });
    }
  };

  const removeSubCategorySelection = (subCategoryId: string) => {
    const updated = selectedSubCategories.filter(
      item => item.subCategory.subCategoryId !== subCategoryId
    );
    setSelectedSubCategories(updated);
    onCategorySelect({
      mainCategory: selectedMainCategory!,
      subCategories: updated
    });
  };

  const removeSubSubCategorySelection = (subCategoryId: string, subSubCategoryId: string) => {
    const updated = selectedSubCategories.map(item => {
      if (item.subCategory.subCategoryId === subCategoryId) {
        return {
          ...item,
          subSubCategories: item.subSubCategories.filter(
            subSub => subSub.subSubCategoryId !== subSubCategoryId
          )
        };
      }
      return item;
    });
    setSelectedSubCategories(updated);
    onCategorySelect({
      mainCategory: selectedMainCategory!,
      subCategories: updated
    });
  };

  const isSubCategorySelected = (subCategoryId: string) => {
    return selectedSubCategories.some(
      item => item.subCategory.subCategoryId === subCategoryId
    );
  };

  const isSubSubCategorySelected = (subCategoryId: string, subSubCategoryId: string) => {
    const subCategory = selectedSubCategories.find(
      item => item.subCategory.subCategoryId === subCategoryId
    );
    return subCategory?.subSubCategories.some(
      subSub => subSub.subSubCategoryId === subSubCategoryId
    ) || false;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading categories...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={`text-center p-4 text-gray-500 ${className}`}>
        No categories available
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Category Selection */}
      <div className="space-y-2">
        <Label>Main Category *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            const isSelected = selectedMainCategory?.categoryId === category.categoryId;
            
            return (
              <Card 
                key={category.categoryId} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleMainCategorySelect(category)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{category.name || category.label}</div>
                      <div className="text-xs text-gray-500 truncate">{category.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sub-Categories Selection (only show if main category is selected) */}
      {selectedMainCategory && showSubCategories && (
        <div className="space-y-2">
          <Label>Sub-Categories</Label>
          <div className="space-y-2">
            {selectedMainCategory.subCategories?.map((subCategory) => {
              const isExpanded = expandedSubCategories.has(subCategory.subCategoryId);
              const isSelected = isSubCategorySelected(subCategory.subCategoryId);
              
              return (
                <Card 
                  key={subCategory.subCategoryId} 
                  className={`transition-all ${
                    isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => toggleSubCategoryExpansion(subCategory.subCategoryId)}
                          className="p-1 h-6 w-6"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </Button>
                        <FolderOpen className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm">{subCategory.name || subCategory.label}</div>
                          <div className="text-xs text-gray-500">{subCategory.description}</div>
                        </div>
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        type="button"
                        onClick={() => handleSubCategorySelect(subCategory)}
                        className="h-6 px-2 text-xs"
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>

                    {/* Sub-Sub-Categories */}
                    {isExpanded && showSubSubCategories && subCategory.subSubCategories && (
                      <div className="ml-8 mt-3 space-y-2">
                        {subCategory.subSubCategories.map((subSubCategory) => {
                          const isSubSubSelected = isSubSubCategorySelected(
                            subCategory.subCategoryId, 
                            subSubCategory.subSubCategoryId
                          );
                          
                          return (
                            <div 
                              key={subSubCategory.subSubCategoryId} 
                              className="flex items-center justify-between border-l border-gray-200 pl-3"
                            >
                              <div className="flex items-center space-x-2">
                                <Folder className="w-3 h-3 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium">{subSubCategory.name || subSubCategory.label}</div>
                                  <div className="text-xs text-gray-500">{subSubCategory.description}</div>
                                </div>
                              </div>
                              <Button
                                variant={isSubSubSelected ? "default" : "outline"}
                                size="sm"
                                type="button"
                                onClick={() => handleSubSubCategorySelect(subCategory, subSubCategory)}
                                className="h-5 px-2 text-xs"
                              >
                                {isSubSubSelected ? "Selected" : "Select"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Categories Summary */}
      {selectedMainCategory && selectedSubCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Categories</Label>
          <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="text-sm font-medium text-blue-900 mb-2">
              {selectedMainCategory.name || selectedMainCategory.label}
            </div>
            <div className="space-y-2">
              {selectedSubCategories.map((item) => (
                <div key={item.subCategory.subCategoryId} className="ml-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-800">→ {item.subCategory.name || item.subCategory.label}</span>
                      {item.subSubCategories.length > 0 && (
                        <span className="text-xs text-blue-600">
                          ({item.subSubCategories.length} selected)
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => removeSubCategorySelection(item.subCategory.subCategoryId)}
                      className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {item.subSubCategories.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subSubCategories.map((subSub) => (
                        <div key={subSub.subSubCategoryId} className="flex items-center justify-between">
                          <span className="text-xs text-blue-700">
                            → {subSub.name || subSub.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => removeSubSubCategorySelection(
                              item.subCategory.subCategoryId, 
                              subSub.subSubCategoryId
                            )}
                            className="h-4 w-4 p-0 text-red-500 hover:text-red-600"
                          >
                            <X className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 