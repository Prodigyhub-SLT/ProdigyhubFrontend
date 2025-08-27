// client/lib/api.ts
import type {
  ProductOrder,
  CreateProductOrderRequest,
  UpdateProductOrderRequest,
  CreateCancelProductOrderRequest,
  CancelProductOrder,
  Product,
  CreateProductForm,
  Category,
  CreateCategoryForm,
  ProductSpecification,
  CreateSpecificationForm,
  ProductOffering,
  CreateOfferingForm,
  ProductOfferingPrice,
  CreatePriceForm,
  Event,
  Hub,
  Topic,
  CheckProductOfferingQualification,
  QueryProductOfferingQualification,
  CheckProductConfiguration,
  QueryProductConfiguration,
  HealthResponse,
  QueryParams,
  CategoryHierarchy,
  SubCategory,
  SubSubCategory,
} from '@shared/product-order-types';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    console.log('API_BASE_URL:', this.baseURL);
    console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  }

  // Helper method to build query string with proper type handling
  private buildQueryString(params?: QueryParams): string {
    if (!params) return '';
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convert all values to strings for URL parameters
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // User Management
  async signupUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    userId?: string; // Firebase UID if available
  }): Promise<{ message: string; user: any }> {
    return this.request('/users/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`Making request to: ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed for ${endpoint}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return null as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Product Ordering Management (TMF622)
  async getOrders(params?: QueryParams): Promise<ProductOrder[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<ProductOrder[]>(`/productOrderingManagement/v4/productOrder${queryString}`);
    } catch (error) {
      console.warn('Product Ordering API not available, returning empty array');
      return [];
    }
  }

  async getOrderById(id: string): Promise<ProductOrder> {
    return await this.request<ProductOrder>(`/productOrderingManagement/v4/productOrder/${id}`);
  }

  async createOrder(order: CreateProductOrderRequest): Promise<ProductOrder> {
    return await this.request<ProductOrder>('/productOrderingManagement/v4/productOrder', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: string, updates: UpdateProductOrderRequest): Promise<ProductOrder> {
    return await this.request<ProductOrder>(`/productOrderingManagement/v4/productOrder/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteOrder(id: string): Promise<void> {
    await this.request<void>(`/productOrderingManagement/v4/productOrder/${id}`, {
      method: 'DELETE',
    });
  }

  async createCancelOrder(request: CreateCancelProductOrderRequest): Promise<CancelProductOrder> {
    return await this.request<CancelProductOrder>('/productOrderingManagement/v4/cancelProductOrder', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async cancelOrder(request: CreateCancelProductOrderRequest): Promise<CancelProductOrder> {
    return this.createCancelOrder(request);
  }

  async getCancelOrders(params?: QueryParams): Promise<CancelProductOrder[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<CancelProductOrder[]>(`/productOrderingManagement/v4/cancelProductOrder${queryString}`);
    } catch (error) {
      console.warn('Cancel Product Order API not available, returning empty array');
      return [];
    }
  }

  // Product Catalog Management (TMF620)
  async getCategories(params?: QueryParams): Promise<Category[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<Category[]>(`/productCatalogManagement/v5/category${queryString}`);
    } catch (error) {
      console.warn('Product Catalog Categories API not available, returning empty array');
      return [];
    }
  }

  async createCategory(category: CreateCategoryForm): Promise<Category> {
    return await this.request<Category>('/productCatalogManagement/v5/category', {
      method: 'POST',
      body: JSON.stringify({
        ...category,
        '@type': 'Category'
      }),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request<void>(`/productCatalogManagement/v5/category/${id}`, {
      method: 'DELETE',
    });
  }

  // Hierarchical Category Management for frontend category management
  async getHierarchicalCategories(params?: QueryParams): Promise<CategoryHierarchy[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<CategoryHierarchy[]>(`/productCatalogManagement/v5/hierarchicalCategory${queryString}`);
    } catch (error) {
      console.warn('Hierarchical Categories API not available, returning empty array');
      return [];
    }
  }

  async createHierarchicalCategory(category: CategoryHierarchy): Promise<CategoryHierarchy> {
    return await this.request<CategoryHierarchy>('/productCatalogManagement/v5/hierarchicalCategory', {
      method: 'POST',
      body: JSON.stringify({
        ...category,
        '@type': 'HierarchicalCategory'
      }),
    });
  }

  async updateHierarchicalCategory(id: string, category: Partial<CategoryHierarchy>): Promise<CategoryHierarchy> {
    return await this.request<CategoryHierarchy>(`/productCatalogManagement/v5/hierarchicalCategory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...category,
        '@type': 'HierarchicalCategory'
      }),
    });
  }

  async deleteHierarchicalCategory(id: string): Promise<void> {
    await this.request<void>(`/productCatalogManagement/v5/hierarchicalCategory/${id}`, {
      method: 'DELETE',
    });
  }

  // Sub-category operations
  async addSubCategory(categoryId: string, subCategory: SubCategory): Promise<CategoryHierarchy> {
    return await this.request<CategoryHierarchy>(`/productCatalogManagement/v5/hierarchicalCategory/${categoryId}/subCategory`, {
      method: 'POST',
      body: JSON.stringify(subCategory),
    });
  }

  async updateSubCategory(categoryId: string, subCategory: SubCategory): Promise<CategoryHierarchy> {
    return await this.request<CategoryHierarchy>(`/productCatalogManagement/v5/hierarchicalCategory/${categoryId}/subCategory/${subCategory.subCategoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(subCategory),
    });
  }

  async deleteSubCategory(categoryId: string, subCategoryId: string): Promise<void> {
    await this.request<void>(`/productCatalogManagement/v5/hierarchicalCategory/${categoryId}/subCategory/${subCategoryId}`, {
      method: 'DELETE',
    });
  }

  // Sub-sub-category operations
  async addSubSubCategory(categoryId: string, subCategoryId: string, subSubCategory: SubSubCategory): Promise<CategoryHierarchy> {
    return await this.request<CategoryHierarchy>(`/productCatalogManagement/v5/hierarchicalCategory/${categoryId}/subCategory/${subCategoryId}/subSubCategory`, {
      method: 'POST',
      body: JSON.stringify(subSubCategory),
    });
  }

  async updateSubSubCategory(categoryId: string, subCategoryId: string, subSubCategory: SubSubCategory): Promise<CategoryHierarchy> {
    return await this.request<CategoryHierarchy>(`/productCatalogManagement/v5/hierarchicalCategory/${categoryId}/subCategory/${subCategoryId}/subSubCategory/${subSubCategory.subSubCategoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(subSubCategory),
    });
  }

  async deleteSubSubCategory(categoryId: string, subCategoryId: string, subSubCategoryId: string): Promise<void> {
    await this.request<void>(`/productCatalogManagement/v5/hierarchicalCategory/${categoryId}/subCategory/${subCategoryId}/subSubCategory/${subSubCategoryId}`, {
      method: 'DELETE',
    });
  }

  async getSpecifications(params?: QueryParams): Promise<ProductSpecification[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<ProductSpecification[]>(`/productCatalogManagement/v5/productSpecification${queryString}`);
    } catch (error) {
      console.warn('Product Specifications API not available, returning empty array');
      return [];
    }
  }

  async createSpecification(spec: CreateSpecificationForm): Promise<ProductSpecification> {
    return await this.request<ProductSpecification>('/productCatalogManagement/v5/productSpecification', {
      method: 'POST',
      body: JSON.stringify({
        ...spec,
        '@type': 'ProductSpecification'
      }),
    });
  }

  async updateSpecification(id: string, updates: Partial<ProductSpecification>): Promise<ProductSpecification> {
    return await this.request<ProductSpecification>(`/productCatalogManagement/v5/productSpecification/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteSpecification(id: string): Promise<void> {
    await this.request<void>(`/productCatalogManagement/v5/productSpecification/${id}`, {
      method: 'DELETE',
    });
  }

  async getOfferings(params?: QueryParams): Promise<ProductOffering[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<ProductOffering[]>(`/productCatalogManagement/v5/productOffering${queryString}`);
    } catch (error) {
      console.warn('Product Offerings API not available, returning empty array');
      return [];
    }
  }

  async createOffering(offering: CreateOfferingForm): Promise<ProductOffering> {
    return await this.request<ProductOffering>('/productCatalogManagement/v5/productOffering', {
      method: 'POST',
      body: JSON.stringify({
        ...offering,
        '@type': 'ProductOffering'
      }),
    });
  }

  async updateOffering(id: string, updates: Partial<ProductOffering>): Promise<ProductOffering> {
    return await this.request<ProductOffering>(`/productCatalogManagement/v5/productOffering/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteOffering(id: string): Promise<void> {
    await this.request<void>(`/productCatalogManagement/v5/productOffering/${id}`, {
      method: 'DELETE',
    });
  }

  async getPrices(params?: QueryParams): Promise<ProductOfferingPrice[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<ProductOfferingPrice[]>(`/productCatalogManagement/v5/productOfferingPrice${queryString}`);
    } catch (error) {
      console.warn('Product Offering Price API not available (404 expected), returning empty array');
      return [];
    }
  }

  async createPrice(price: CreatePriceForm): Promise<ProductOfferingPrice> {
    try {
      return await this.request<ProductOfferingPrice>('/productCatalogManagement/v5/productOfferingPrice', {
        method: 'POST',
        body: JSON.stringify({
          ...price,
          '@type': 'ProductOfferingPrice'
        }),
      });
    } catch (error) {
      console.warn('Product Offering Price creation not supported by backend');
      throw new Error('Product Offering Price creation is not supported by the backend API');
    }
  }

  async deletePrice(id: string): Promise<void> {
    await this.request<void>(`/productCatalogManagement/v5/productOfferingPrice/${id}`, {
      method: 'DELETE',
    });
  }

  // Product Inventory Management (TMF637)
  async getProducts(params?: QueryParams): Promise<Product[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<Product[]>(`/tmf-api/product${queryString}`);
    } catch (error) {
      console.warn('Product Inventory API not available, returning empty array');
      return [];
    }
  }

  async createProduct(product: CreateProductForm): Promise<Product> {
    return await this.request<Product>('/tmf-api/product', {
      method: 'POST',
      body: JSON.stringify({
        ...product,
        '@type': 'Product'
      }),
    });
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return await this.request<Product>(`/tmf-api/product/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request<void>(`/tmf-api/product/${id}`, {
      method: 'DELETE',
    });
  }

  // Product Qualification Management (TMF679)
  async getCheckQualifications(params?: QueryParams): Promise<CheckProductOfferingQualification[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<CheckProductOfferingQualification[]>(`/productOfferingQualification/v5/checkProductOfferingQualification${queryString}`);
    } catch (error) {
      console.warn('Check Product Offering Qualification API not available, returning empty array');
      return [];
    }
  }

  async createCheckQualification(qualification: any): Promise<CheckProductOfferingQualification> {
    return await this.request<CheckProductOfferingQualification>('/productOfferingQualification/v5/checkProductOfferingQualification', {
      method: 'POST',
      body: JSON.stringify(qualification),
    });
  }

  async getQueryQualifications(params?: QueryParams): Promise<QueryProductOfferingQualification[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<QueryProductOfferingQualification[]>(`/productOfferingQualification/v5/queryProductOfferingQualification${queryString}`);
    } catch (error) {
      console.warn('Query Product Offering Qualification API not available, returning empty array');
      return [];
    }
  }

  async createQueryQualification(qualification: any): Promise<QueryProductOfferingQualification> {
    return await this.request<QueryProductOfferingQualification>('/productOfferingQualification/v5/queryProductOfferingQualification', {
      method: 'POST',
      body: JSON.stringify(qualification),
    });
  }

  // Event Management (TMF688)
  async getEvents(params?: QueryParams): Promise<Event[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<Event[]>(`/eventManagement/v4/event${queryString}`);
    } catch (error) {
      console.warn('Event Management API not available, returning empty array');
      return [];
    }
  }

  async createEvent(event: any): Promise<Event> {
    return await this.request<Event>('/eventManagement/v4/event', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request<void>(`/eventManagement/v4/event/${id}`, {
      method: 'DELETE',
    });
  }

  async getHubs(params?: QueryParams): Promise<Hub[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<Hub[]>(`/eventManagement/v4/hub${queryString}`);
    } catch (error) {
      console.warn('Event Hubs API not available, returning empty array');
      return [];
    }
  }

  async createHub(hub: any): Promise<Hub> {
    return await this.request<Hub>('/eventManagement/v4/hub', {
      method: 'POST',
      body: JSON.stringify(hub),
    });
  }

  async deleteHub(id: string): Promise<void> {
    await this.request<void>(`/eventManagement/v4/hub/${id}`, {
      method: 'DELETE',
    });
  }

  async getTopics(params?: QueryParams): Promise<Topic[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<Topic[]>(`/eventManagement/v4/topic${queryString}`);
    } catch (error) {
      console.warn('Event Topics API not available, returning empty array');
      return [];
    }
  }

  async createTopic(topic: any): Promise<Topic> {
    return await this.request<Topic>('/eventManagement/v4/topic', {
      method: 'POST',
      body: JSON.stringify(topic),
    });
  }

  async deleteTopic(id: string): Promise<void> {
    await this.request<void>(`/eventManagement/v4/topic/${id}`, {
      method: 'DELETE',
    });
  }

  // Product Configuration Management (TMF760)
  async getCheckConfigurations(params?: QueryParams): Promise<any[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<any[]>(`/tmf-api/productConfigurationManagement/v5/checkProductConfiguration${queryString}`);
    } catch (error) {
      console.warn('Check Product Configuration API not available, returning empty array');
      return [];
    }
  }

  async createCheckConfiguration(config: CheckProductConfiguration): Promise<any> {
    console.log('API: Sending check configuration request:', JSON.stringify(config, null, 2));
    return await this.request<any>('/tmf-api/productConfigurationManagement/v5/checkProductConfiguration', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getQueryConfigurations(params?: QueryParams): Promise<any[]> {
    const queryString = this.buildQueryString(params);
    try {
      return await this.request<any[]>(`/tmf-api/productConfigurationManagement/v5/queryProductConfiguration${queryString}`);
    } catch (error) {
      console.warn('Query Product Configuration API not available, returning empty array');
      return [];
    }
  }

  async createQueryConfiguration(config: any): Promise<any> {
    console.log('API: Sending query configuration request:', JSON.stringify(config, null, 2));
    return await this.request<any>('/tmf-api/productConfigurationManagement/v5/queryProductConfiguration', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Health endpoint
  async getHealth(): Promise<HealthResponse> {
    try {
      return await this.request<HealthResponse>('/health');
    } catch (error) {
      console.warn('Health API not available');
      return {
        status: 'DOWN',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
export const api = new ApiClient();

// Specific API clients for different modules
export const productOrderingApi = {
  getOrders: (params?: QueryParams) => api.getOrders(params),
  getOrderById: (id: string) => api.getOrderById(id),
  createOrder: (order: CreateProductOrderRequest) => api.createOrder(order),
  updateOrder: (id: string, updates: UpdateProductOrderRequest) => api.updateOrder(id, updates),
  deleteOrder: (id: string) => api.deleteOrder(id),
  getCancelOrders: (params?: QueryParams) => api.getCancelOrders(params),
  createCancelOrder: (request: CreateCancelProductOrderRequest) => api.createCancelOrder(request),
  cancelOrder: (request: CreateCancelProductOrderRequest) => api.cancelOrder(request),
};

export const productCatalogApi = {
  getCategories: (params?: QueryParams) => api.getCategories(params),
  createCategory: (category: CreateCategoryForm) => api.createCategory(category),
  deleteCategory: (id: string) => api.deleteCategory(id),
  getHierarchicalCategories: (params?: QueryParams) => api.getHierarchicalCategories(params),
  createHierarchicalCategory: (category: CategoryHierarchy) => api.createHierarchicalCategory(category),
  updateHierarchicalCategory: (id: string, category: Partial<CategoryHierarchy>) => api.updateHierarchicalCategory(id, category),
  deleteHierarchicalCategory: (id: string) => api.deleteHierarchicalCategory(id),
  addSubCategory: (categoryId: string, subCategory: SubCategory) => api.addSubCategory(categoryId, subCategory),
  updateSubCategory: (categoryId: string, subCategory: SubCategory) => api.updateSubCategory(categoryId, subCategory),
  deleteSubCategory: (categoryId: string, subCategoryId: string) => api.deleteSubCategory(categoryId, subCategoryId),
  addSubSubCategory: (categoryId: string, subCategoryId: string, subSubCategory: SubSubCategory) => api.addSubSubCategory(categoryId, subCategoryId, subSubCategory),
  updateSubSubCategory: (categoryId: string, subCategoryId: string, subSubCategory: SubSubCategory) => api.updateSubSubCategory(categoryId, subCategoryId, subSubCategory),
  deleteSubSubCategory: (categoryId: string, subCategoryId: string, subSubCategoryId: string) => api.deleteSubSubCategory(categoryId, subCategoryId, subSubCategoryId),
  getSpecifications: (params?: QueryParams) => api.getSpecifications(params),
  createSpecification: (spec: CreateSpecificationForm) => api.createSpecification(spec),
  updateSpecification: (id: string, updates: Partial<ProductSpecification>) => api.updateSpecification(id, updates),
  deleteSpecification: (id: string) => api.deleteSpecification(id),
  getOfferings: (params?: QueryParams) => api.getOfferings(params),
  createOffering: (offering: CreateOfferingForm) => api.createOffering(offering),
  updateOffering: (id: string, updates: Partial<ProductOffering>) => api.updateOffering(id, updates),
  deleteOffering: (id: string) => api.deleteOffering(id),
  getPrices: (params?: QueryParams) => api.getPrices(params),
  createPrice: (price: CreatePriceForm) => api.createPrice(price),
  deletePrice: (id: string) => api.deletePrice(id),
};

export const productInventoryApi = {
  getProducts: (params?: QueryParams) => api.getProducts(params),
  createProduct: (product: CreateProductForm) => api.createProduct(product),
  updateProduct: (id: string, updates: Partial<Product>) => api.updateProduct(id, updates),
  deleteProduct: (id: string) => api.deleteProduct(id),
};

export const productQualificationApi = {
  getCheckQualifications: (params?: QueryParams) => api.getCheckQualifications(params),
  createCheckQualification: (qualification: any) => api.createCheckQualification(qualification),
  getQueryQualifications: (params?: QueryParams) => api.getQueryQualifications(params),
  createQueryQualification: (qualification: any) => api.createQueryQualification(qualification),
};

export const eventManagementApi = {
  getEvents: (params?: QueryParams) => api.getEvents(params),
  createEvent: (event: any) => api.createEvent(event),
  deleteEvent: (id: string) => api.deleteEvent(id),
  getHubs: (params?: QueryParams) => api.getHubs(params),
  createHub: (hub: any) => api.createHub(hub),
  deleteHub: (id: string) => api.deleteHub(id),
  getTopics: (params?: QueryParams) => api.getTopics(params),
  createTopic: (topic: any) => api.createTopic(topic),
  deleteTopic: (id: string) => api.deleteTopic(id),
};

export const productConfigurationApi = {
  getCheckConfigurations: (params?: QueryParams) => api.getCheckConfigurations(params),
  createCheckConfiguration: (config: CheckProductConfiguration) => api.createCheckConfiguration(config),
  getQueryConfigurations: (params?: QueryParams) => api.getQueryConfigurations(params),
  createQueryConfiguration: (config: any) => api.createQueryConfiguration(config),
};

export const healthApi = {
  getHealth: () => api.getHealth(),
};

/**
 * Enhanced order creation with automatic retry for duplicate ID conflicts
 */
export const createOrderWithRetry = async (
  orderData: CreateProductOrderRequest, 
  maxRetries: number = 3
): Promise<ProductOrder> => {
  const { getOrderIdManager } = await import('./orderIdUtils');
  const orderIdManager = getOrderIdManager();
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const orderId = await orderIdManager.generateNextOrderId();
      
      const orderWithId = {
        ...orderData,
        id: orderId,
        orderDate: new Date().toISOString(),
        state: 'acknowledged' as const,
        '@type': 'ProductOrder' as const
      };

      console.log(`🔄 Attempt ${attempt}/${maxRetries}: Creating order with ID ${orderId}`);
      
      const result = await productOrderingApi.createOrder(orderWithId);
      
      console.log(`✅ Order created successfully: ${orderId}`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Attempt ${attempt}/${maxRetries} failed:`, error);
      
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      const isDuplicateError = 
        errorMessage.includes('duplicate') || 
        errorMessage.includes('already exists') ||
        errorMessage.includes('conflict') ||
        errorMessage.includes('unique');
      
      if (isDuplicateError && attempt < maxRetries) {
        console.log(`🔄 Duplicate ID detected, retrying with new ID...`);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        continue;
      }
      
      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries} attempts failed. Last error:`, lastError);
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error('Order creation failed after all retry attempts');
};

// Helper function to validate order creation data
export const validateOrderData = (orderData: CreateProductOrderRequest): string[] => {
  const errors: string[] = [];
  
  if (!orderData.description?.trim()) {
    errors.push('Description is required');
  }
  
  if (!orderData.category?.trim()) {
    errors.push('Category is required');
  }
  
  if (!orderData.productOrderItem || orderData.productOrderItem.length === 0) {
    errors.push('At least one product item is required');
  }
  
  orderData.productOrderItem?.forEach((item, index) => {
    if (!item.productOffering?.id) {
      errors.push(`Product item ${index + 1}: Product offering ID is required`);
    }
    if (!item.productOffering?.name) {
      errors.push(`Product item ${index + 1}: Product offering name is required`);
    }
    if (!item.quantity || item.quantity < 1) {
      errors.push(`Product item ${index + 1}: Quantity must be at least 1`);
    }
  });
  
  return errors;
};

// Utility function to format order ID for display
export const formatOrderId = (orderId: string): string => {
  if (/^ORD-\d{6}$/.test(orderId)) {
    return orderId;
  }
  
  const match = orderId.match(/(\d+)/);
  if (match) {
    const number = parseInt(match[1], 10);
    if (!isNaN(number)) {
      return `ORD-${number.toString().padStart(6, '0')}`;
    }
  }
  
  return orderId;
};

// Function to get order statistics
export const getOrderStatistics = async (): Promise<{
  totalOrders: number;
  highestOrderNumber: number;
  nextOrderId: string;
  orderIdStats: any;
}> => {
  try {
    const { getOrderIdManager } = await import('./orderIdUtils');
    const orderIdManager = getOrderIdManager();
    
    await orderIdManager.initialize();
    
    const orders = await productOrderingApi.getOrders();
    const stats = orderIdManager.getStats();
    
    return {
      totalOrders: orders?.length || 0,
      highestOrderNumber: stats.currentCounter,
      nextOrderId: stats.nextOrderId,
      orderIdStats: stats
    };
  } catch (error) {
    console.error('Failed to get order statistics:', error);
    return {
      totalOrders: 0,
      highestOrderNumber: 0,
      nextOrderId: 'ORD-000001',
      orderIdStats: null
    };
  }
};

// Enhanced productOrderingApi
export const enhancedProductOrderingApi = {
  ...productOrderingApi,
  createOrderWithRetry: (order: CreateProductOrderRequest, maxRetries?: number) => 
    createOrderWithRetry(order, maxRetries),
  createOrderAutoId: async (orderData: Omit<CreateProductOrderRequest, 'id'>): Promise<ProductOrder> => {
    const { generateNextOrderId } = await import('./orderIdUtils');
    
    const orderId = await generateNextOrderId();
    const orderWithId: CreateProductOrderRequest = {
      ...orderData,
      id: orderId,
      orderDate: orderData.orderDate || new Date().toISOString(),
      state: orderData.state || 'acknowledged',
      '@type': 'ProductOrder'
    };
    
    return createOrderWithRetry(orderWithId);
  }
};