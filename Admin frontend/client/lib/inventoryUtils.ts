// lib/inventoryUtils.ts - Updated version with deletion tracking

import type { Product } from "@shared/product-order-types";

// Enhanced product interface with additional tracking properties
export interface EnhancedProduct extends Product {
  sourceOrderId?: string; // Track which order created this product
  syncedFromOrder?: boolean; // Flag to identify auto-synced products
  originalQuantity?: number; // Store original order quantity
  orderDate?: string; // Store order creation date
}

// Storage keys
const ENHANCED_PRODUCTS_KEY = 'inventory_enhanced_products';
const DELETED_PRODUCTS_KEY = 'inventory_deleted_products'; // New key for tracking deletions

// Enhanced product data storage (client-side only)
interface EnhancedProductData {
  productId: string;
  sourceOrderId?: string;
  syncedFromOrder?: boolean;
  originalQuantity?: number;
  orderDate?: string;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Save enhanced product data to localStorage
export const saveEnhancedProductData = (productId: string, data: Omit<EnhancedProductData, 'productId'>) => {
  if (!isBrowser) return;
  
  try {
    const existingData = getEnhancedProductsData();
    const updatedData = {
      ...existingData,
      [productId]: { productId, ...data }
    };
    localStorage.setItem(ENHANCED_PRODUCTS_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.warn('Failed to save enhanced product data:', error);
  }
};

// Get all enhanced product data from localStorage
export const getEnhancedProductsData = (): Record<string, EnhancedProductData> => {
  if (!isBrowser) return {};
  
  try {
    const data = localStorage.getItem(ENHANCED_PRODUCTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn('Failed to load enhanced product data:', error);
    return {};
  }
};

// Get enhanced product data for a specific product
export const getEnhancedProductData = (productId: string): EnhancedProductData | null => {
  const allData = getEnhancedProductsData();
  return allData[productId] || null;
};

// NEW: Track deleted products to prevent re-creation
export const markProductAsDeleted = (productId: string, sourceOrderId?: string) => {
  if (!isBrowser) return;
  
  try {
    const deletedProducts = getDeletedProductIds();
    const updatedDeleted = {
      ...deletedProducts,
      [productId]: {
        deletedAt: new Date().toISOString(),
        sourceOrderId: sourceOrderId
      }
    };
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(updatedDeleted));
    console.log('🗑️ Marked product as deleted:', productId);
  } catch (error) {
    console.warn('Failed to mark product as deleted:', error);
  }
};

// NEW: Get all deleted product IDs
export const getDeletedProductIds = (): Record<string, { deletedAt: string, sourceOrderId?: string }> => {
  if (!isBrowser) return {};
  
  try {
    const data = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn('Failed to load deleted product IDs:', error);
    return {};
  }
};

// NEW: Check if a product was manually deleted
export const wasProductDeleted = (productId: string): boolean => {
  const deletedProducts = getDeletedProductIds();
  return !!deletedProducts[productId];
};

// NEW: Check if products from an order were deleted
export const wereOrderProductsDeleted = (orderId: string): boolean => {
  const deletedProducts = getDeletedProductIds();
  return Object.values(deletedProducts).some(deleted => deleted.sourceOrderId === orderId);
};

// Remove enhanced product data when product is deleted
export const removeEnhancedProductData = (productId: string) => {
  if (!isBrowser) return;
  
  try {
    // Get the enhanced data before removing it
    const enhancedData = getEnhancedProductsData();
    const productData = enhancedData[productId];
    
    // Mark as deleted for future sync prevention
    if (productData) {
      markProductAsDeleted(productId, productData.sourceOrderId);
    }
    
    // Remove from enhanced data
    delete enhancedData[productId];
    localStorage.setItem(ENHANCED_PRODUCTS_KEY, JSON.stringify(enhancedData));
    
    console.log('🗑️ Removed enhanced product data and marked as deleted:', productId);
  } catch (error) {
    console.warn('Failed to remove enhanced product data:', error);
  }
};

// Convert regular products to enhanced products with stored data
export const enhanceProducts = (products: Product[]): EnhancedProduct[] => {
  const enhancedData = getEnhancedProductsData();
  
  return products.map(product => {
    const enhancement = enhancedData[product.id];
    return {
      ...product,
      sourceOrderId: enhancement?.sourceOrderId,
      syncedFromOrder: enhancement?.syncedFromOrder,
      originalQuantity: enhancement?.originalQuantity,
      orderDate: enhancement?.orderDate
    };
  });
};

// UPDATED: Check if products from a specific order already exist or were deleted
export const checkOrderAlreadySynced = (orderId: string): boolean => {
  const enhancedData = getEnhancedProductsData();
  const hasExistingProducts = Object.values(enhancedData).some(data => data.sourceOrderId === orderId);
  
  // Also check if products from this order were deleted
  const wereDeleted = wereOrderProductsDeleted(orderId);
  
  console.log(`📦 Order ${orderId} sync check:`, {
    hasExistingProducts,
    wereDeleted,
    shouldSkip: hasExistingProducts || wereDeleted
  });
  
  return hasExistingProducts || wereDeleted;
};

// Get statistics about enhanced products
export const getEnhancedProductStats = (products: EnhancedProduct[]) => {
  const autoSyncedProducts = products.filter(p => p.syncedFromOrder).length;
  const manualProducts = products.length - autoSyncedProducts;
  
  return {
    total: products.length,
    autoSynced: autoSyncedProducts,
    manual: manualProducts
  };
};

// Clean up orphaned enhanced data (products that no longer exist)
export const cleanupOrphanedEnhancedData = (existingProductIds: string[]) => {
  if (!isBrowser) return;
  
  try {
    const enhancedData = getEnhancedProductsData();
    const existingIds = new Set(existingProductIds);
    
    // Remove data for products that no longer exist
    const cleanedData = Object.fromEntries(
      Object.entries(enhancedData).filter(([productId]) => 
        existingIds.has(productId)
      )
    );
    
    localStorage.setItem(ENHANCED_PRODUCTS_KEY, JSON.stringify(cleanedData));
  } catch (error) {
    console.warn('Failed to cleanup orphaned enhanced data:', error);
  }
};

// NEW: Clear deletion history (useful for testing or reset)
export const clearDeletionHistory = () => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(DELETED_PRODUCTS_KEY);
    console.log('🗑️ Cleared deletion history');
  } catch (error) {
    console.warn('Failed to clear deletion history:', error);
  }
};

// NEW: Get deletion history for debugging
export const getDeletionHistory = () => {
  return getDeletedProductIds();
};