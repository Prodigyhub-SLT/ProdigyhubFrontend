import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Wifi, Settings, Smartphone, Globe, Package } from 'lucide-react';
import { SLT_CATEGORIES, getSubCategories, getSubSubCategories } from './types/SLTTypes';

interface SubCategorySelection {
  subCategory: string;
  subSubCategory: string;
}

interface HierarchicalCategorySelectorProps {
  selectedCategory: string;
  selectedSubCategory: string;
  selectedSubSubCategory: string;
  onCategorySelect: (category: string, subCategory: string, subSubCategory: string) => void;
  // For Broadband: multiple sub-category selections
  broadbandSelections?: SubCategorySelection[];
  onBroadbandSelectionsChange?: (selections: SubCategorySelection[]) => void;
}

const iconMap = {
  Wifi,
  Settings,
  Smartphone,
  Globe,
  Package
};

export default function HierarchicalCategorySelector({ 
  selectedCategory, 
  selectedSubCategory, 
  selectedSubSubCategory, 
  onCategorySelect,
  broadbandSelections = [],
  onBroadbandSelectionsChange
}: HierarchicalCategorySelectorProps) {
  const [currentSubCategories, setCurrentSubCategories] = useState<string[]>([]);
  const [currentSubSubCategories, setCurrentSubSubCategories] = useState<string[]>([]);

  const handleCategoryChange = (category: string) => {
    const subCategories = getSubCategories(category);
    setCurrentSubCategories(subCategories.map(sub => sub.value));
    setCurrentSubSubCategories([]);
    
    if (category === 'Broadband') {
      // For Broadband, initialize with all 3 sub-categories
      const broadbandSubCategories = ['Connection Type', 'Package Usage Type', 'Package Type'];
      const initialSelections: SubCategorySelection[] = broadbandSubCategories.map(subCat => ({
        subCategory: subCat,
        subSubCategory: ''
      }));
      onBroadbandSelectionsChange?.(initialSelections);
      // Also update the main category selection
      onCategorySelect(category, '', '');
    } else {
      // For other categories, use single selection
      onCategorySelect(category, '', '');
    }
  };

  const handleSubCategoryChange = (subCategory: string) => {
    const subSubCategories = getSubSubCategories(selectedCategory, subCategory);
    setCurrentSubSubCategories(subSubCategories.map(sub => sub.value));
    onCategorySelect(selectedCategory, subCategory, '');
  };

  const handleSubSubCategoryChange = (subSubCategory: string) => {
    onCategorySelect(selectedCategory, selectedSubCategory, subSubCategory);
  };

  // For Broadband: handle sub-category selection
  const handleBroadbandSubCategoryChange = (index: number, subCategory: string) => {
    const newSelections = [...broadbandSelections];
    newSelections[index] = {
      subCategory,
      subSubCategory: ''
    };
    onBroadbandSelectionsChange?.(newSelections);
  };

  // For Broadband: handle sub-sub-category selection
  const handleBroadbandSubSubCategoryChange = (index: number, subSubCategory: string) => {
    const newSelections = [...broadbandSelections];
    newSelections[index] = {
      ...newSelections[index],
      subSubCategory
    };
    onBroadbandSelectionsChange?.(newSelections);
  };

  // Check if all Broadband sub-categories are selected
  const isBroadbandComplete = selectedCategory === 'Broadband' && 
    broadbandSelections.length === 3 && 
    broadbandSelections.every(selection => selection.subCategory && selection.subSubCategory);

  return (
    <div className="space-y-6">
      <Label className="text-base font-medium">Select Product Category *</Label>
      
      {/* Main Categories */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">Main Category</Label>
        <div className="grid grid-cols-1 gap-3">
          {SLT_CATEGORIES.map((category) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Package;
            const isSelected = selectedCategory === category.value;
            
            return (
              <Card 
                key={category.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryChange(category.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{category.label}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* For Broadband: Multiple Sub-Categories */}
      {selectedCategory === 'Broadband' && broadbandSelections.length > 0 && (
        <div className="space-y-6">
          <Label className="text-sm font-medium text-gray-700">Broadband Sub-Categories (All Required)</Label>
          
          {broadbandSelections.map((selection, index) => {
            const subCategories = getSubCategories('Broadband');
            const subSubCategories = selection.subCategory ? 
              getSubSubCategories('Broadband', selection.subCategory) : [];

            return (
              <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">
                  Sub-Category {index + 1}: {selection.subCategory || 'Not Selected'}
                </Label>
                
                {/* Sub-Category Selection */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Select Sub-Category</Label>
                  <Select 
                    value={selection.subCategory} 
                    onValueChange={(value) => handleBroadbandSubCategoryChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((subCategory) => (
                        <SelectItem key={subCategory.value} value={subCategory.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{subCategory.label}</span>
                            <span className="text-xs text-gray-500">{subCategory.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-Sub-Category Selection */}
                {selection.subCategory && subSubCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Select Sub-Sub-Category</Label>
                    <Select 
                      value={selection.subSubCategory} 
                      onValueChange={(value) => handleBroadbandSubSubCategoryChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        {subSubCategories.map((subSubCategory) => (
                          <SelectItem key={subSubCategory.value} value={subSubCategory.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{subSubCategory.label}</span>
                              <span className="text-xs text-gray-500">{subSubCategory.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* For Other Categories: Single Sub-Category Selection */}
      {selectedCategory && selectedCategory !== 'Broadband' && currentSubCategories.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Sub Category</Label>
          <Select value={selectedSubCategory} onValueChange={handleSubCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sub category" />
            </SelectTrigger>
            <SelectContent>
              {currentSubCategories.map((subCategory) => {
                const subCategoryData = getSubCategories(selectedCategory).find(sub => sub.value === subCategory);
                return (
                  <SelectItem key={subCategory} value={subCategory}>
                    <div className="flex flex-col">
                      <span className="font-medium">{subCategoryData?.label}</span>
                      <span className="text-xs text-gray-500">{subCategoryData?.description}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* For Other Categories: Single Sub-Sub-Category Selection */}
      {selectedSubCategory && selectedCategory !== 'Broadband' && currentSubSubCategories.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Sub-Sub Category</Label>
          <Select value={selectedSubSubCategory} onValueChange={handleSubSubCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sub-sub category" />
            </SelectTrigger>
            <SelectContent>
              {currentSubSubCategories.map((subSubCategory) => {
                const subSubCategoryData = getSubSubCategories(selectedCategory, selectedSubCategory).find(sub => sub.value === subSubCategory);
                return (
                  <SelectItem key={subSubCategory} value={subSubCategory}>
                    <div className="flex flex-col">
                      <span className="font-medium">{subSubCategoryData?.label}</span>
                      <span className="text-xs text-gray-500">{subSubCategoryData?.description}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selection Summary */}
      {selectedCategory && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <Label className="text-sm font-medium text-gray-700 mb-2">Selected Categories:</Label>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Main:</span>
              <span className="text-blue-600">{SLT_CATEGORIES.find(cat => cat.value === selectedCategory)?.label}</span>
            </div>
            
            {selectedCategory === 'Broadband' ? (
              // Show all Broadband selections
              broadbandSelections.map((selection, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium">Sub {index + 1}:</span>
                  <span className="text-blue-600">
                    {getSubCategories('Broadband').find(sub => sub.value === selection.subCategory)?.label}
                    {selection.subSubCategory && (
                      <>
                        {' → '}
                        {getSubSubCategories('Broadband', selection.subCategory).find(sub => sub.value === selection.subSubCategory)?.label}
                      </>
                    )}
                  </span>
                </div>
              ))
            ) : (
              // Show single selection for other categories
              <>
                {selectedSubCategory && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Sub:</span>
                    <span className="text-blue-600">{getSubCategories(selectedCategory).find(sub => sub.value === selectedSubCategory)?.label}</span>
                  </div>
                )}
                {selectedSubSubCategory && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Sub-Sub:</span>
                    <span className="text-blue-600">{getSubSubCategories(selectedCategory, selectedSubCategory).find(sub => sub.value === selectedSubSubCategory)?.label}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {selectedCategory === 'Broadband' && !isBroadbandComplete && (
            <div className="mt-2 text-xs text-orange-600">
              ⚠️ Please complete all 3 sub-category selections for Broadband offerings
            </div>
          )}
        </div>
      )}
    </div>
  );
} 