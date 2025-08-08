// hooks/useProductCatalogState.ts
import { useState } from "react";
import type { 
  Category, 
  ProductSpecification, 
  ProductOffering, 
  ProductOfferingPrice
} from "@shared/product-order-types";

interface DashboardStats {
  totalCategories: number;
  totalSpecs: number;
  totalOfferings: number;
  totalPrices: number;
  activeCategories: number;
  activeSpecs: number;
  activeOfferings: number;
  activePrices: number;
}

export const useProductCatalogState = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    totalSpecs: 0,
    totalOfferings: 0,
    totalPrices: 0,
    activeCategories: 0,
    activeSpecs: 0,
    activeOfferings: 0,
    activePrices: 0
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  const [offerings, setOfferings] = useState<ProductOffering[]>([]);
  const [prices, setPrices] = useState<ProductOfferingPrice[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<'category' | 'spec' | 'offering' | 'price'>('category');
  const [activeTab, setActiveTab] = useState("overview");

  return {
    stats,
    categories,
    specs,
    offerings,
    prices,
    loading,
    searchTerm,
    statusFilter,
    categoryFilter,
    isCreateDialogOpen,
    createDialogType,
    activeTab,
    setStats,
    setCategories,
    setSpecs,
    setOfferings,
    setPrices,
    setLoading,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setIsCreateDialogOpen,
    setCreateDialogType,
    setActiveTab
  };
};