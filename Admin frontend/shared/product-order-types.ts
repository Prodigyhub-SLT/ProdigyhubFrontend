// shared/product-order-types.ts - Updated types for TMF APIs

// Common TMF types
export interface TimePeriod {
  startDateTime?: string;
  endDateTime?: string;
}

export interface Money {
  unit?: string;
  value?: number;
}

export interface Quantity {
  amount?: number;
  units?: string;
}

// TMF620 - Product Catalog Management Types
export interface ProductSpecification {
  id: string;
  href?: string;
  name: string;
  description?: string;
  brand?: string;
  version?: string;
  lifecycleStatus?: string;
  validFor?: TimePeriod;
  '@type'?: string;
}

export interface ProductOffering {
  id: string;
  href?: string;
  name: string;
  description?: string;
  version?: string;
  lifecycleStatus?: string;
  validFor?: TimePeriod;
  isBundle?: boolean;
  isSellable?: boolean;
  productSpecification?: {
    id: string;
    href?: string;
    name?: string;
    '@type'?: string;
  };
  productOfferingPrice?: ProductOfferingPrice[];
  category?: Category[];
  '@type'?: string;
}

export interface ProductOfferingPrice {
  id: string;
  href?: string;
  name: string;
  description?: string;
  priceType: 'recurring' | 'oneTime' | 'usage';
  price?: {
    taxIncludedAmount?: Money;
    dutyFreeAmount?: Money;
    taxRate?: number;
  };
  validFor?: TimePeriod;
  lifecycleStatus?: string;
  '@type'?: string;
}

export interface Category {
  id: string;
  href?: string;
  name: string;
  description?: string;
  version?: string;
  lifecycleStatus?: string;
  validFor?: TimePeriod;
  parentId?: string;
  isRoot?: boolean;
  '@type'?: string;
}

// Hierarchical Category Structure for frontend category management
export interface SubSubCategory {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  subSubCategories: SubSubCategory[];
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  color: string; // e.g., 'text-orange-500', 'text-blue-600'
  bgColor: string; // e.g., 'bg-orange-50', 'bg-blue-50'
  icon: string; // e.g., 'Wifi', 'Settings', 'Smartphone'
  subCategories: SubCategory[];
  '@type'?: string;
}

// TMF622 - Product Ordering Types
export interface ProductOrderItem {
  id?: string;
  action: 'add' | 'modify' | 'delete' | 'noChange';
  quantity?: number;
  state?: string;
  productOffering?: {
    id: string;
    href?: string;
    name?: string;
    '@type'?: string;
  };
  product?: {
    id?: string;
    href?: string;
    name?: string;
    '@type'?: string;
  };
  productOrderItemPrice?: Array<{
    name?: string;
    priceType?: string;
    price?: Money;
  }>;
  productOrderItemRelationship?: Array<{
    type: string;
    productOrder: {
      id: string;
      href?: string;
    };
  }>;
  '@type'?: string;
}

export interface RelatedParty {
  id?: string;
  href?: string;
  name?: string;
  role: string;
  '@referredType'?: string;
  '@type'?: string;
}

export interface Note {
  id?: string;
  author?: string;
  date?: string;
  system?: string;
  text: string;
  '@type'?: string;
}

export interface ProductOrder {
  id: string;
  href?: string;
  orderDate?: string;
  completionDate?: string;
  requestedStartDate?: string;
  requestedCompletionDate?: string;
  expectedCompletionDate?: string;
  category?: string;
  description?: string;
  externalId?: string;
  priority?: string;
  state: 'acknowledged' | 'rejected' | 'pending' | 'held' | 'inProgress' | 'cancelled' | 'completed' | 'failed' | 'partial' | 'assessingCancellation' | 'pendingCancellation';
  productOrderItem: ProductOrderItem[];
  relatedParty?: RelatedParty[];
  note?: Note[];
  orderTotalPrice?: Array<{
    name?: string;
    description?: string;
    priceType?: string;
    price?: {
      taxIncludedAmount?: Money;
      dutyFreeAmount?: Money;
    };
  }>;
  '@type'?: string;
}

export interface CancelProductOrder {
  id: string;
  href?: string;
  cancellationReason?: string;
  requestedCancellationDate?: string;
  effectiveCancellationDate?: string;
  state?: 'acknowledged' | 'inProgress' | 'done' | 'terminatedWithError';
  productOrder: {
    id: string;
    href?: string;
    '@type'?: string;
  };
  '@type'?: string;
}

// TMF637 - Product Inventory Types
export interface Product {
  id: string;
  href?: string;
  name?: string;
  description?: string;
  productSerialNumber?: string;
  status: 'created' | 'active' | 'suspended' | 'terminated';
  startDate?: string;
  terminationDate?: string;
  isBundle?: boolean;
  isCustomerVisible?: boolean;
  productSpecification?: {
    id: string;
    href?: string;
    name?: string;
    '@type'?: string;
  };
  productOffering?: {
    id: string;
    href?: string;
    name?: string;
    '@type'?: string;
  };
  productCharacteristic?: Array<{
    id?: string;
    name: string;
    value?: string;
    valueType?: string;
  }>;
  productRelationship?: Array<{
    type: string;
    product: {
      id: string;
      href?: string;
      '@type'?: string;
    };
  }>;
  relatedParty?: RelatedParty[];
  '@type'?: string;
}

// TMF760 - Product Configuration Management Types (FIXED)
export interface ProductSpecCharacteristicValue {
  id?: string;
  value?: string;
  valueType?: string;
  from?: string;
  to?: string;
  isDefault?: boolean;
  validFor?: TimePeriod;
}

export interface ProductSpecCharacteristic {
  id?: string;
  name: string;
  description?: string;
  valueType?: string;
  configurable?: boolean;
  productSpecCharacteristicValue?: ProductSpecCharacteristicValue[];
}

// Fixed CheckProductConfiguration interface with proper structure
export interface CheckProductConfiguration {
  id?: string; // Made optional for creation
  href?: string;
  productSpecification?: {
    id: string;
    name: string;
    category: string;
  };
  checkProductConfigurationItem: Array<{
    id?: string;
    productSpecification: {
      id: string;
      name: string;
      category: string;
    };
    productConfigurationSpecification: any;
    action: string;
    state?: string;
  }>;
  requestedDate: string;
  state: 'acknowledged' | 'inProgress' | 'done' | 'terminatedWithError';
  completionDate?: string;
  expectedCompletionDate?: string;
  '@type': string;
}

export interface QueryProductConfiguration {
  id: string;
  href?: string;
  state: 'acknowledged' | 'inProgress' | 'done' | 'terminatedWithError';
  creationDate?: string;
  requestedCompletionDate?: string;
  completionDate?: string;
  expectedCompletionDate?: string;
  instantSync?: boolean;
  requestProductConfigurationItem?: Array<{
    id?: string;
    productConfiguration?: any;
  }>;
  computedProductConfigurationItem?: Array<{
    id?: string;
    state?: string;
    productConfiguration?: any;
  }>;
  '@type'?: string;
}

// TMF679 - Product Qualification Types
export interface ProductOfferingQualificationItem {
  id?: string;
  state?: 'done' | 'terminatedWithError' | 'inProgress';
  qualificationResult?: 'qualified' | 'unqualified';
  qualificationResultReason?: string;
  productOffering?: {
    id: string;
    href?: string;
    name?: string;
    '@type'?: string;
  };
  alternateProductProposal?: ProductOffering[];
}

export interface CheckProductOfferingQualification {
  id: string;
  href?: string;
  state: 'acknowledged' | 'inProgress' | 'done' | 'terminatedWithError';
  creationDate?: string;
  requestedCompletionDate?: string;
  completionDate?: string;
  expectedQualificationDate?: string;
  qualificationResult?: 'qualified' | 'unqualified';
  provideAlternative?: boolean;
  provideOnlyAvailable?: boolean;
  provideUnavailabilityReason?: boolean;
  instantSync?: boolean;
  productOfferingQualificationItem?: ProductOfferingQualificationItem[];
  relatedParty?: RelatedParty[];
  '@type'?: string;
}

export interface QueryProductOfferingQualification {
  id: string;
  href?: string;
  state: 'acknowledged' | 'inProgress' | 'done' | 'terminatedWithError';
  creationDate?: string;
  requestedCompletionDate?: string;
  completionDate?: string;
  expectedQualificationDate?: string;
  provideAlternative?: boolean;
  provideOnlyAvailable?: boolean;
  provideUnavailabilityReason?: boolean;
  instantSync?: boolean;
  searchCriteria?: any;
  queryProductOfferingQualificationItem?: ProductOfferingQualificationItem[];
  relatedParty?: RelatedParty[];
  '@type'?: string;
}

// TMF688 - Event Management Types
export interface Event {
  id: string;
  href?: string;
  eventId?: string;
  eventType: string;
  eventTime?: string;
  timeOccurred?: string;
  title?: string;
  description?: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Critical';
  correlationId?: string;
  domain?: string;
  source?: any;
  reportingSystem?: any;
  event?: any;
  '@type'?: string;
}

export interface Topic {
  id: string;
  href?: string;
  name: string;
  description?: string;
  contentQuery?: string;
  headerQuery?: string;
  '@type'?: string;
}

export interface Hub {
  id: string;
  href?: string;
  callback: string;
  query?: string;
  registeredAt?: string;
  '@type'?: string;
}

// API Error Types
export interface ApiError {
  code?: string;
  reason?: string;
  message?: string;
  status?: string;
  referenceError?: string;
  timestamp?: string;
  '@type': 'Error';
}

// Request/Response wrapper types
export interface CreateProductOrderRequest {
  id?: string; // Optional for creation, can be auto-generated
  orderDate?: string;
  completionDate?: string;
  requestedStartDate?: string;
  requestedCompletionDate?: string;
  expectedCompletionDate?: string;
  category?: string;
  description?: string;
  externalId?: string;
  priority?: string;
  state?: string;
  productOrderItem: ProductOrderItem[];
  relatedParty?: RelatedParty[];
  note?: Note[];
  '@type'?: string;
}

export interface UpdateProductOrderRequest {
  orderDate?: string;
  completionDate?: string;
  requestedStartDate?: string;
  requestedCompletionDate?: string;
  expectedCompletionDate?: string;
  category?: string;
  description?: string;
  priority?: string;
  state?: string;
  productOrderItem?: ProductOrderItem[];
  relatedParty?: RelatedParty[];
  note?: Note[];
  '@type'?: string;
}

export interface CreateCancelProductOrderRequest {
  cancellationReason?: string;
  requestedCancellationDate?: string;
  productOrder: {
    id: string;
    href?: string;
    '@type'?: string;
  };
  '@type'?: string;
}

// Pagination and filtering types (FIXED)
export interface QueryParams {
  fields?: string;
  limit?: number; // Changed from string to number
  offset?: number;
  page?: number;
  [key: string]: string | number | boolean | undefined; // More specific typing
}

export interface PaginatedResponse<T> {
  data?: T[];
  totalCount?: number;
  hasMore?: boolean;
  nextPage?: string;
  prevPage?: string;
}

// Common response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  timestamp?: string;
  requestId?: string;
}

// Health check response
export interface HealthResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  services?: {
    [serviceName: string]: {
      status: 'UP' | 'DOWN';
      details?: any;
    };
  };
  version?: string;
}

// Dashboard statistics types
export interface CatalogStats {
  totalCategories: number;
  totalSpecifications: number;
  totalOfferings: number;
  totalPrices: number;
  activeCategories: number;
  activeSpecifications: number;
  activeOfferings: number;
  activePrices: number;
}

export interface OrderingStats {
  totalOrders: number;
  acknowledgedOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCancellations: number;
  avgOrderValue: number;
  completionRate: number;
}

export interface InventoryStats {
  totalProducts: number;
  activeProducts: number;
  suspendedProducts: number;
  terminatedProducts: number;
  bundleProducts: number;
  customerVisibleProducts: number;
}

export interface EventStats {
  totalEvents: number;
  todayEvents: number;
  highPriorityEvents: number;
  totalHubs: number;
  totalTopics: number;
  eventsByDomain: { [key: string]: number };
  eventsByPriority: { [key: string]: number };
}

export interface QualificationStats {
  totalCheck: number;
  totalQuery: number;
  acknowledgedCheck: number;
  acknowledgedQuery: number;
  inProgressCheck: number;
  inProgressQuery: number;
  doneCheck: number;
  doneQuery: number;
  terminatedCheck: number;
  terminatedQuery: number;
  successRate: number;
}

export interface ConfigurationStats {
  totalCheck: number;
  totalQuery: number;
  acknowledgedCheck: number;
  acknowledgedQuery: number;
  inProgressCheck: number;
  inProgressQuery: number;
  doneCheck: number;
  doneQuery: number;
  terminatedCheck: number;
  terminatedQuery: number;
  successRate: number;
  avgProcessingTime: number;
}

// Form data types for UI
export interface CreateCategoryForm {
  name: string;
  description?: string;
  parentId?: string;
}

export interface CreateSpecificationForm {
  name: string;
  description?: string;
  brand?: string;
  version?: string;
}

export interface CreateOfferingForm {
  name: string;
  description?: string;
  isBundle?: boolean;
  isSellable?: boolean;
  productSpecificationId?: string;
}

export interface CreatePriceForm {
  name: string;
  description?: string;
  priceType: 'recurring' | 'oneTime' | 'usage';
  value?: number;
  unit?: string;
}

export interface CreateProductForm {
  name: string;
  description?: string;
  productSerialNumber?: string;
  status: 'created' | 'active' | 'suspended' | 'terminated';
  isBundle?: boolean;
  isCustomerVisible?: boolean;
  productOfferingId?: string;
}

export interface CreateOrderForm {
  description: string;
  category: string;
  priority?: string;
  requestedStartDate?: string;
  requestedCompletionDate?: string;
}

export interface CreateEventForm {
  eventType: string;
  title?: string;
  description?: string;
  domain?: string;
  priority?: 'Low' | 'Normal' | 'High' | 'Critical';
  message?: string;
}

export interface CreateHubForm {
  callback: string;
  query?: string;
}

export interface CreateTopicForm {
  name: string;
  description?: string;
  contentQuery?: string;
  headerQuery?: string;
}

export interface CreateQualificationForm {
  provideAlternative?: boolean;
  provideOnlyAvailable?: boolean;
  provideUnavailabilityReason?: boolean;
  instantSync?: boolean;
}

export interface CreateConfigurationForm {
  instantSync?: boolean;
  requestedCompletionDate?: string;
}

// Filter and search types
export interface OrderFilters {
  state?: string;
  category?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  relatedPartyId?: string;
}

export interface ProductFilters {
  status?: string;
  isBundle?: boolean;
  isCustomerVisible?: boolean;
  productOfferingId?: string;
}

export interface EventFilters {
  eventType?: string;
  domain?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CatalogFilters {
  lifecycleStatus?: string;
  category?: string;
  isBundle?: boolean;
  isSellable?: boolean;
}

// Common enums
export enum OrderState {
  Acknowledged = 'acknowledged',
  Rejected = 'rejected',
  Pending = 'pending',
  Held = 'held',
  InProgress = 'inProgress',
  Cancelled = 'cancelled',
  Completed = 'completed',
  Failed = 'failed',
  Partial = 'partial',
  AssessingCancellation = 'assessingCancellation',
  PendingCancellation = 'pendingCancellation'
}

export enum ProductStatus {
  Created = 'created',
  Active = 'active',
  Suspended = 'suspended',
  Terminated = 'terminated'
}

export enum LifecycleStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Retired = 'Retired'
}

export enum PriceType {
  Recurring = 'recurring',
  OneTime = 'oneTime',
  Usage = 'usage'
}

export enum Priority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Critical = 'Critical'
}

export enum ProcessingState {
  Acknowledged = 'acknowledged',
  InProgress = 'inProgress',
  Done = 'done',
  TerminatedWithError = 'terminatedWithError'
}