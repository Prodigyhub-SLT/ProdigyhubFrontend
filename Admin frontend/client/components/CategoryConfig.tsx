// components/CategoryConfig.tsx
import { Wifi, Building, Smartphone, Cloud, Package } from "lucide-react";

export const CategoryIcons = {
  Broadband: { icon: Wifi, color: 'text-orange-600' },
  Business: { icon: Building, color: 'text-blue-600' },
  Mobile: { icon: Smartphone, color: 'text-purple-600' },
  'Cloud Service': { icon: Cloud, color: 'text-green-600' },
  Product: { icon: Package, color: 'text-indigo-600' },
};

export const CATEGORIES = [
  { value: 'Broadband', label: 'Broadband', icon: Wifi, color: 'text-orange-600' },
  { value: 'Business', label: 'Business', icon: Building, color: 'text-blue-600' },
  { value: 'Mobile', label: 'Mobile', icon: Smartphone, color: 'text-purple-600' },
  { value: 'Cloud Service', label: 'Cloud Service', icon: Cloud, color: 'text-green-600' },
  { value: 'Product', label: 'Product', icon: Package, color: 'text-indigo-600' },
];