// @shared/product-order-types.ts

// SLT Broadband Configuration Types (from ProductConfigurationDashboard.tsx)
export interface SLTBroadbandConfig {
  id: string;
  connectionType: 'Fiber' | 'Fiber_1Gbps' | 'ADSL' | '4G_LTE';
  packageType: 'Unlimited' | 'Time_based' | 'Anytime';
  speedTier: string;
  dataAllowance?: string;
  entertainmentAddons: string[];
  staticIP: boolean;
  contractTerm: '12_months' | '24_months' | 'no_contract';
  pricing: {
    monthlyFee: number;
    setupFee: number;
    deposit: number;
    currency: string;
  };
  rules: ValidationRule[];
  status: 'valid' | 'invalid' | 'pending';
  validationMessages: string[];
}

export interface ValidationRule {
  id: string;
  rule: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Types for Product Ordering Management (TMF622)
export interface ProductOrder {
  id: string;
  description?: string;
  category?: string;
  orderDate?: string;
  state?: string;
  productOrderItem?: any[];
  '@type'?: string;
}

export interface CreateProductOrderRequest {
  id?: string;
  description?: string;
  category?: string;
  orderDate?: string;
  state?: string;
  productOrderItem?: any[];
  '@type'?: string;
}

export interface UpdateProductOrderRequest {
  [key: string]: any;
}

export interface CreateCancelProductOrderRequest {
  [key: string]: any;
}

export interface CancelProductOrder {
  id: string;
  [key: string]: any;
}

// Types for Product Catalog Management (TMF620)
export interface Category {
  id: string;
  [key: string]: any;
}

export interface CreateCategoryForm {
  [key: string]: any;
}

export interface ProductSpecification {
  id: string;
  [key: string]: any;
}

export interface CreateSpecificationForm {
  [key: string]: any;
}

export interface ProductOffering {
  id: string;
  [key: string]: any;
}

export interface CreateOfferingForm {
  [key: string]: any;
}

export interface ProductOfferingPrice {
  id: string;
  [key: string]: any;
}

export interface CreatePriceForm {
  [key: string]: any;
}

// Types for Product Inventory Management (TMF637)
export interface Product {
  id: string;
  [key: string]: any;
}

export interface CreateProductForm {
  [key: string]: any;
}

// Types for Product Qualification Management (TMF679)
export interface CheckProductOfferingQualification {
  id: string;
  [key: string]: any;
}

export interface QueryProductOfferingQualification {
  id: string;
  [key: string]: any;
}

// Types for Event Management (TMF688)
export interface Event {
  id: string;
  [key: string]: any;
}

export interface Hub {
  id: string;
  [key: string]: any;
}

export interface Topic {
  id: string;
  [key: string]: any;
}

// Types for Product Configuration Management (TMF760)
export interface CheckProductConfiguration {
  id?: string;
  '@type': string;
  checkProductConfigurationItem: CheckProductConfigurationItem[];
}

export interface CheckProductConfigurationItem {
  id: string;
  '@type': string;
  configurationData: SLTBroadbandConfig;
}

export interface QueryProductConfiguration {
  id: string;
  [key: string]: any;
}

// Health Response
export interface HealthResponse {
  status: string;
  timestamp: string;
}

// Query Parameters
export interface QueryParams {
  [key: string]: string | number | boolean;
}