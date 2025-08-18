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
  FolderOpen
} from 'lucide-react';
import { productCatalogApi } from '@/lib/api';
import { CategoryHierarchy, SubCategory, SubSubCategory } from '../../shared/product-order-types';

interface HierarchicalCategorySelectorProps {
  onCategorySelect: (selection: {
    mainCategory: CategoryHierarchy;
    subCategory?: SubCategory;
    subSubCategory?: SubSubCategory;
  }) => void;
  selectedCategory?: {
    mainCategory: CategoryHierarchy;
    subCategory?: SubCategory;
    subSubCategory?: SubSubCategory;
  };
  showSubCategories?: boolean;
  showSubSubCategories?: boolean;
  className?: string;
}

const categoryIcons: { [key: string]: React.ComponentType<any> } = {
  'Wifi': Wifi,
  'Building': Building,
  'Smartphone': Smartphone,
  'Cloud': Cloud,
  'Package': Package,
  'Tv': Tv,
  'Phone': Phone,
  'Gamepad2': Gamepad2,
  'Globe': Globe,
  'Gift': Gift,
  'Folder': Folder
};

export function HierarchicalCategorySelector({ 
  onCategorySelect, 
  selectedCategory,
  showSubCategories = true,
  showSubSubCategories = true,
  className = ""
}: HierarchicalCategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await productCatalogApi.getHierarchicalCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSubCategoryExpansion = (subCategoryId: string) => {
    setExpandedSubCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subCategoryId)) {
        newSet.delete(subCategoryId);
      } else {
        newSet.add(subCategoryId);
      }
      return newSet;
    });
  };

  const handleCategorySelect = (category: CategoryHierarchy) => {
    onCategorySelect({ mainCategory: category });
  };

  const handleSubCategorySelect = (mainCategory: CategoryHierarchy, subCategory: SubCategory) => {
    onCategorySelect({ mainCategory, subCategory });
  };

  const handleSubSubCategorySelect = (mainCategory: CategoryHierarchy, subCategory: SubCategory, subSubCategory: SubSubCategory) => {
    onCategorySelect({ mainCategory, subCategory, subSubCategory });
  };

  const isCategorySelected = (category: CategoryHierarchy) => {
    return selectedCategory?.mainCategory.categoryId === category.categoryId;
  };

  const isSubCategorySelected = (subCategory: SubCategory) => {
    return selectedCategory?.subCategory?.subCategoryId === subCategory.subCategoryId;
  };

  const isSubSubCategorySelected = (subSubCategory: SubSubCategory) => {
    return selectedCategory?.subSubCategory?.subSubCategoryId === subSubCategory.subSubCategoryId;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {categories.map((category) => {
        const IconComponent = categoryIcons[category.icon] || Folder;
        const isExpanded = expandedCategories.has(category.categoryId);
        const isSelected = isCategorySelected(category);
        
        return (
          <div key={category.categoryId} className="border rounded-lg">
            <div
              className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                isSelected ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => handleCategorySelect(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded ${category.bgColor}`}>
                    <IconComponent className={`w-4 h-4 ${category.color}`} />
                  </div>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.description}</div>
                  </div>
                </div>
                {showSubCategories && category.subCategories && category.subCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategoryExpansion(category.categoryId);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Sub-categories */}
            {showSubCategories && isExpanded && category.subCategories && category.subCategories.length > 0 && (
              <div className="border-t bg-muted/30">
                {category.subCategories.map((subCategory) => {
                  const isSubExpanded = expandedSubCategories.has(subCategory.subCategoryId);
                  const isSubSelected = isSubCategorySelected(subCategory);
                  
                  return (
                    <div key={subCategory.subCategoryId} className="border-b last:border-b-0">
                      <div
                        className={`p-3 pl-8 cursor-pointer hover:bg-muted/50 transition-colors ${
                          isSubSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => handleSubCategorySelect(category, subCategory)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Folder className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{subCategory.name}</div>
                              <div className="text-xs text-muted-foreground">{subCategory.description}</div>
                            </div>
                          </div>
                          {showSubSubCategories && subCategory.subSubCategories && subCategory.subSubCategories.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubCategoryExpansion(subCategory.subCategoryId);
                              }}
                            >
                              {isSubExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Sub-sub-categories */}
                      {showSubSubCategories && isSubExpanded && subCategory.subSubCategories && subCategory.subSubCategories.length > 0 && (
                        <div className="bg-muted/20">
                          {subCategory.subSubCategories.map((subSubCategory) => {
                            const isSubSubSelected = isSubSubCategorySelected(subSubCategory);
                            
                            return (
                              <div
                                key={subSubCategory.subSubCategoryId}
                                className={`p-3 pl-12 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                                  isSubSubSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                                }`}
                                onClick={() => handleSubSubCategorySelect(category, subCategory, subSubCategory)}
                              >
                                <div className="flex items-center space-x-3">
                                  <Folder className="w-3 h-3 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium text-sm">{subSubCategory.name}</div>
                                    <div className="text-xs text-muted-foreground">{subSubCategory.description}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 