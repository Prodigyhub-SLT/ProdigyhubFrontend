// lib/orderIdUtils.ts - Order ID Management Utilities

import { productOrderingApi } from './api';
import type { ProductOrder } from '@shared/product-order-types';

/**
 * Utility class for managing sequential order IDs
 * This ensures IDs are generated sequentially starting from ORD-000001
 */
export class OrderIdManager {
  private static instance: OrderIdManager;
  private lastUsedNumber: number = 0;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  /**
   * Get singleton instance of OrderIdManager
   */
  static getInstance(): OrderIdManager {
    if (!OrderIdManager.instance) {
      OrderIdManager.instance = new OrderIdManager();
    }
    return OrderIdManager.instance;
  }

  /**
   * Initialize the order ID manager by checking existing orders
   * This should be called before generating any new IDs
   */
  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized) return;

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization
    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      console.log('🔄 Initializing OrderIdManager...');
      
      // Fetch all existing orders from the API
      const existingOrders = await productOrderingApi.getOrders();
      
      if (existingOrders && existingOrders.length > 0) {
        console.log(`📊 Found ${existingOrders.length} existing orders`);
        
        // Extract sequential numbers from existing order IDs
        const orderNumbers = existingOrders
          .map(order => this.extractSequentialNumber(order.id))
          .filter(num => num !== null) as number[];
        
        if (orderNumbers.length > 0) {
          this.lastUsedNumber = Math.max(...orderNumbers);
          console.log(`📈 Highest existing order number: ${this.lastUsedNumber}`);
          console.log(`🎯 Next order will be: ORD-${(this.lastUsedNumber + 1).toString().padStart(6, '0')}`);
        } else {
          this.lastUsedNumber = 0;
          console.log('📊 No sequential order numbers found in existing orders');
        }
      } else {
        this.lastUsedNumber = 0;
        console.log('📊 No existing orders found, starting from 0');
      }
      
      this.isInitialized = true;
      this.initializationPromise = null;
      console.log('✅ OrderIdManager initialized successfully');
      
    } catch (error) {
      console.warn('⚠️ Failed to initialize OrderIdManager:', error);
      // Fallback to starting from 0 if we can't fetch existing orders
      this.lastUsedNumber = 0;
      this.isInitialized = true;
      this.initializationPromise = null;
      console.log('🔄 Fallback: Starting order numbers from 0');
    }
  }

  /**
   * Extract sequential number from order ID
   * Supports formats like: ORD-001, ORD-000001, ORDER-001, ORDER-000001, 001, 000001
   */
  private extractSequentialNumber(orderId: string): number | null {
    if (!orderId) return null;
    
    // Patterns to match different ID formats
    const patterns = [
      /^ORD-(\d{3})$/i,        // ORD-001 (preferred format)
      /^ORD-(\d{6})$/i,        // ORD-000001 (legacy format)
      /^ORDER-(\d{3})$/i,      // ORDER-001
      /^ORDER-(\d{6})$/i,      // ORDER-000001 (legacy format)
      /^ORD-(\d+)$/i,          // ORD-123
      /^ORDER-(\d+)$/i,        // ORDER-123  
      /^(\d{3})$/,             // 001 (just numbers)
      /^(\d{6})$/,             // 000001 (legacy format)
      /^(\d+)$/                // Any number
    ];
    
    for (const pattern of patterns) {
      const match = orderId.match(pattern);
      if (match) {
        const number = parseInt(match[1], 10);
        if (!isNaN(number) && number > 0) {
          return number;
        }
      }
    }
    
    return null;
  }

  /**
   * Generate the next sequential order ID
   */
  async generateNextOrderId(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    this.lastUsedNumber += 1;
    const paddedNumber = this.lastUsedNumber.toString().padStart(3, '0');
    const orderId = `ORD-${paddedNumber}`;
    
    console.log(`🆔 Generated new order ID: ${orderId}`);
    return orderId;
  }

  /**
   * Get the current counter value (last used number)
   */
  getCurrentCounter(): number {
    return this.lastUsedNumber;
  }

  /**
   * Get the next order ID that will be generated (without incrementing)
   */
  getNextOrderId(): string {
    const nextNumber = this.lastUsedNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(6, '0');
    return `ORD-${paddedNumber}`;
  }

  /**
   * Check if the manager is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Manually set the counter (useful for testing or data migration)
   * WARNING: Use with caution in production
   */
  setCounter(number: number): void {
    if (number < 0) {
      throw new Error('Counter must be a non-negative number');
    }
    this.lastUsedNumber = number;
    console.log(`🔧 Manually set order counter to: ${number}`);
  }

  /**
   * Reset the manager (useful for testing)
   * WARNING: This will reset the counter to 0
   */
  reset(): void {
    this.lastUsedNumber = 0;
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('🔄 OrderIdManager reset');
  }

  /**
   * Validate if an order ID follows the expected sequential format
   */
  isValidSequentialOrderId(orderId: string): boolean {
    return this.extractSequentialNumber(orderId) !== null;
  }

  /**
   * Get statistics about order ID usage
   */
  getStats(): {
    isInitialized: boolean;
    currentCounter: number;
    nextOrderId: string;
    totalOrdersGenerated: number;
  } {
    return {
      isInitialized: this.isInitialized,
      currentCounter: this.lastUsedNumber,
      nextOrderId: this.getNextOrderId(),
      totalOrdersGenerated: this.lastUsedNumber
    };
  }
}

/**
 * Convenience function to get the singleton OrderIdManager instance
 */
export const getOrderIdManager = (): OrderIdManager => {
  return OrderIdManager.getInstance();
};

/**
 * Convenience function to generate next order ID
 */
export const generateNextOrderId = async (): Promise<string> => {
  const manager = getOrderIdManager();
  return manager.generateNextOrderId();
};

/**
 * Convenience function to initialize the order ID system
 */
export const initializeOrderIdSystem = async (): Promise<void> => {
  const manager = getOrderIdManager();
  return manager.initialize();
};

/**
 * Convenience function to check if order ID system is ready
 */
export const isOrderIdSystemReady = (): boolean => {
  const manager = getOrderIdManager();
  return manager.isReady();
};

/**
 * Convenience function to get next order ID without generating it
 */
export const getNextOrderId = (): string => {
  const manager = getOrderIdManager();
  return manager.getNextOrderId();
};

// Export the main class as default
export default OrderIdManager;