import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle, Wifi, Settings, Smartphone, Globe, Package } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const SLT_CATEGORIES = [
  { 
    value: 'Broadband', 
    label: 'Broadband', 
    icon: Wifi, 
    color: 'text-blue-600',
    description: 'Fiber, ADSL, and wireless internet services'
  },
  { 
    value: 'Business', 
    label: 'Business', 
    icon: Settings, 
    color: 'text-green-600',
    description: 'Enterprise solutions and dedicated services'
  },
  { 
    value: 'Mobile', 
    label: 'Mobile', 
    icon: Smartphone, 
    color: 'text-purple-600',
    description: 'Mobile data plans and voice services'
  },
  { 
    value: 'Cloud_Service', 
    label: 'Cloud Service', 
    icon: Globe, 
    color: 'text-red-600',
    description: 'Cloud hosting, storage, and computing services'
  },
  { 
    value: 'Product', 
    label: 'Product', 
    icon: Package, 
    color: 'text-indigo-600',
    description: 'Hardware, software, and physical products'
  }
];

export default function CategorySelector({ selectedCategory, onCategorySelect }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Select Product Category *</Label>
      <div className="grid grid-cols-1 gap-3">
        {SLT_CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.value;
          
          return (
            <Card 
              key={category.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onCategorySelect(category.value)}
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
  );
}