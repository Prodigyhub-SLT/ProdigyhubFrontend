// types/SLTTypes.ts
export interface SLTProductConfig {
  id: string;
  category: 'Broadband' | 'Business' | 'Mobile' | 'Cloud_Service' | 'Product';
  subCategory?: string;
  subSubCategory?: string;
  connectionType?: 'Fiber' | 'Fiber_1Gbps' | 'ADSL' | '4G_LTE';
  packageType?: 'Unlimited' | 'Time_based' | 'Anytime';
  speedTier?: string;
  dataAllowance?: string;
  entertainmentAddons?: string[];
  staticIP?: boolean;
  contractTerm?: '12_months' | '24_months' | 'no_contract';
  // Business specific fields
  businessType?: 'SME' | 'Enterprise' | 'Corporate';
  bandwidthGuarantee?: boolean;
  dedicatedSupport?: boolean;
  // Mobile specific fields
  mobileDataPlan?: string;
  voiceMinutes?: string;
  smsCount?: string;
  roamingEnabled?: boolean;
  // Cloud Service specific fields
  cloudServiceType?: 'Storage' | 'Computing' | 'Hosting' | 'Backup';
  storageCapacity?: string;
  computeInstances?: number;
  // Product specific fields
  productType?: 'Hardware' | 'Software' | 'Accessory' | 'Service';
  productBrand?: string;
  productModel?: string;
  warrantyPeriod?: string;
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

export interface SLTFormData {
  category: 'Broadband' | 'Business' | 'Mobile' | 'Cloud_Service' | 'Product' | '';
  subCategory: string;
  subSubCategory: string;
  // Broadband fields
  connectionType: 'Fiber' | 'Fiber_1Gbps' | 'ADSL' | '4G_LTE';
  packageType: 'Unlimited' | 'Time_based' | 'Anytime';
  speedTier: string;
  dataAllowance: string;
  entertainmentAddons: string[];
  staticIP: boolean;
  // Business fields
  businessType: 'SME' | 'Enterprise' | 'Corporate';
  bandwidthGuarantee: boolean;
  dedicatedSupport: boolean;
  // Mobile fields
  mobileDataPlan: string;
  voiceMinutes: string;
  smsCount: string;
  roamingEnabled: boolean;
  // Cloud Service fields
  cloudServiceType: 'Storage' | 'Computing' | 'Hosting' | 'Backup';
  storageCapacity: string;
  computeInstances: number;
  // Product fields
  productType: 'Hardware' | 'Software' | 'Accessory' | 'Service';
  productBrand: string;
  productModel: string;
  warrantyPeriod: string;
  // Common fields
  contractTerm: '12_months' | '24_months' | 'no_contract';
  monthlyFee: number;
  setupFee: number;
  deposit: number;
}

// Hierarchical Category Structure
export interface CategoryHierarchy {
  value: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  value: string;
  label: string;
  description: string;
  subSubCategories?: SubSubCategory[];
}

export interface SubSubCategory {
  value: string;
  label: string;
  description: string;
}

// SLT Categories with Hierarchical Structure
export const SLT_CATEGORIES: CategoryHierarchy[] = [
  { 
    value: 'Broadband', 
    label: 'Broadband', 
    icon: 'Wifi', 
    color: 'text-blue-600',
    description: 'Fiber, ADSL, and wireless internet services',
    subCategories: [
      {
        value: 'Connection Type',
        label: 'Connection Type',
        description: 'Type of internet connection',
        subSubCategories: [
          { value: 'Data/PEOTV & Voice Packages', label: 'Data/PEOTV & Voice Packages', description: 'Combined data, TV and voice services' },
          { value: 'Data Packages', label: 'Data Packages', description: 'Internet data only packages' },
          { value: 'Data & Voice', label: 'Data & Voice', description: 'Internet and voice services' }
        ]
      },
      {
        value: 'Package Usage Type',
        label: 'Package Usage Type',
        description: 'Usage pattern for the package',
        subSubCategories: [
          { value: 'Any Time', label: 'Any Time', description: 'Unlimited usage anytime' },
          { value: 'Time Based', label: 'Time Based', description: 'Usage limited to specific time periods' },
          { value: 'Unlimited', label: 'Unlimited', description: 'Unlimited usage without restrictions' }
        ]
      },
      {
        value: 'Package Type',
        label: 'Package Type',
        description: 'Technology type for the package',
        subSubCategories: [
          { value: '4G', label: '4G', description: '4G LTE wireless broadband' },
          { value: 'ADSL', label: 'ADSL', description: 'Asymmetric Digital Subscriber Line' },
          { value: 'Fiber', label: 'Fiber', description: 'Fiber optic broadband' }
        ]
      }
    ]
  },
  { 
    value: 'Business', 
    label: 'Business', 
    icon: 'Settings', 
    color: 'text-green-600',
    description: 'Enterprise solutions and dedicated services',
    subCategories: [
      {
        value: 'Service Type',
        label: 'Service Type',
        description: 'Type of business service',
        subSubCategories: [
          { value: 'Dedicated Internet', label: 'Dedicated Internet', description: 'Dedicated internet connections' },
          { value: 'Cloud Services', label: 'Cloud Services', description: 'Cloud infrastructure services' },
          { value: 'Managed Services', label: 'Managed Services', description: 'Fully managed IT services' }
        ]
      },
      {
        value: 'Business Size',
        label: 'Business Size',
        description: 'Target business size',
        subSubCategories: [
          { value: 'SME', label: 'Small & Medium Enterprise', description: 'Small to medium businesses' },
          { value: 'Enterprise', label: 'Enterprise', description: 'Large enterprise solutions' },
          { value: 'Corporate', label: 'Corporate', description: 'Corporate level services' }
        ]
      }
    ]
  },
  { 
    value: 'Mobile', 
    label: 'Mobile', 
    icon: 'Smartphone', 
    color: 'text-purple-600',
    description: 'Mobile data plans and voice services',
    subCategories: [
      {
        value: 'Plan Type',
        label: 'Plan Type',
        description: 'Type of mobile plan',
        subSubCategories: [
          { value: 'Prepaid', label: 'Prepaid', description: 'Pay-as-you-go plans' },
          { value: 'Postpaid', label: 'Postpaid', description: 'Monthly billing plans' },
          { value: 'Hybrid', label: 'Hybrid', description: 'Combined prepaid and postpaid features' }
        ]
      },
      {
        value: 'Data Plan',
        label: 'Data Plan',
        description: 'Data allowance type',
        subSubCategories: [
          { value: 'Unlimited', label: 'Unlimited', description: 'Unlimited data usage' },
          { value: 'Limited', label: 'Limited', description: 'Fixed data allowance' },
          { value: 'Rollover', label: 'Rollover', description: 'Data rollover plans' }
        ]
      }
    ]
  },
  { 
    value: 'Cloud_Service', 
    label: 'Cloud Service', 
    icon: 'Globe', 
    color: 'text-red-600',
    description: 'Cloud hosting, storage, and computing services',
    subCategories: [
      {
        value: 'Service Category',
        label: 'Service Category',
        description: 'Type of cloud service',
        subSubCategories: [
          { value: 'Infrastructure', label: 'Infrastructure as a Service', description: 'IaaS cloud services' },
          { value: 'Platform', label: 'Platform as a Service', description: 'PaaS cloud services' },
          { value: 'Software', label: 'Software as a Service', description: 'SaaS cloud services' }
        ]
      },
      {
        value: 'Resource Type',
        label: 'Resource Type',
        description: 'Type of cloud resource',
        subSubCategories: [
          { value: 'Storage', label: 'Storage', description: 'Cloud storage solutions' },
          { value: 'Computing', label: 'Computing', description: 'Cloud computing resources' },
          { value: 'Networking', label: 'Networking', description: 'Cloud networking services' }
        ]
      }
    ]
  },
  { 
    value: 'Product', 
    label: 'Product', 
    icon: 'Package', 
    color: 'text-indigo-600',
    description: 'Hardware, software, and physical products',
    subCategories: [
      {
        value: 'Product Category',
        label: 'Product Category',
        description: 'Type of product',
        subSubCategories: [
          { value: 'Hardware', label: 'Hardware', description: 'Physical hardware products' },
          { value: 'Software', label: 'Software', description: 'Software licenses and applications' },
          { value: 'Accessories', label: 'Accessories', description: 'Product accessories and add-ons' }
        ]
      },
      {
        value: 'Brand',
        label: 'Brand',
        description: 'Product brand category',
        subSubCategories: [
          { value: 'SLT Branded', label: 'SLT Branded', description: 'SLT own brand products' },
          { value: 'Third Party', label: 'Third Party', description: 'Third party branded products' },
          { value: 'Generic', label: 'Generic', description: 'Generic or white-label products' }
        ]
      }
    ]
  }
];

// Helper function to get sub-categories for a main category
export const getSubCategories = (category: string): SubCategory[] => {
  const categoryData = SLT_CATEGORIES.find(cat => cat.value === category);
  return categoryData?.subCategories || [];
};

// Helper function to get sub-sub-categories for a sub-category
export const getSubSubCategories = (category: string, subCategory: string): SubSubCategory[] => {
  const categoryData = SLT_CATEGORIES.find(cat => cat.value === category);
  const subCategoryData = categoryData?.subCategories?.find(sub => sub.value === subCategory);
  return subCategoryData?.subSubCategories || [];
};

// SLT Speed Tiers Configuration
export const SLT_SPEED_TIERS = {
  Fiber: [
    { value: '21mbps_512kbps', label: '21 Mbps / 512 Kbps', download: 21, upload: 0.512 },
    { value: '300mbps_150mbps', label: '300 Mbps / 150 Mbps', download: 300, upload: 150 },
    { value: '100mbps_10mbps', label: '100 Mbps / 10 Mbps', download: 100, upload: 10 }
  ],
  Fiber_1Gbps: [
    { value: '1000mbps_500mbps', label: '1000 Mbps / 500 Mbps', download: 1000, upload: 500 }
  ],
  ADSL: [
    { value: '21mbps_512kbps', label: '21 Mbps / 512 Kbps', download: 21, upload: 0.512 }
  ],
  '4G_LTE': [
    { value: '100mbps_10mbps', label: '100 Mbps / 10 Mbps', download: 100, upload: 10 }
  ]
};

// SLT Entertainment Add-ons
export const ENTERTAINMENT_ADDONS = [
  { id: 'netflix', name: 'Netflix', description: 'Netflix subscription included' },
  { id: 'amazon_prime', name: 'Amazon Prime', description: 'Amazon Prime Video & Music' },
  { id: 'apple_tv', name: 'Apple TV+', description: 'Apple TV+ streaming service' },
  { id: 'peotvgo', name: 'PEOTVGO', description: 'Local streaming platform' },
  { id: 'hulu', name: 'Hulu', description: 'Hulu streaming service' },
  { id: 'spotify', name: 'Spotify', description: 'Spotify Premium music' },
  { id: 'youtube_premium', name: 'YouTube Premium', description: 'Ad-free YouTube experience' }
];

// Mobile Data Plans
export const MOBILE_DATA_PLANS = [
  { value: '5gb', label: '5 GB Data Plan', data: 5 },
  { value: '15gb', label: '15 GB Data Plan', data: 15 },
  { value: '30gb', label: '30 GB Data Plan', data: 30 },
  { value: 'unlimited', label: 'Unlimited Data Plan', data: -1 }
];

// Business Types
export const BUSINESS_TYPES = [
  { value: 'SME', label: 'Small & Medium Enterprise' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Corporate', label: 'Corporate' }
];

// Cloud Service Types
export const CLOUD_SERVICE_TYPES = [
  { value: 'Storage', label: 'Cloud Storage' },
  { value: 'Computing', label: 'Cloud Computing' },
  { value: 'Hosting', label: 'Web Hosting' },
  { value: 'Backup', label: 'Backup Services' }
];

// SLT Validation Rules
export const SLT_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'unlimited_static_ip',
    rule: 'Static IP not available for unlimited packages',
    condition: 'packageType === "Unlimited" && staticIP === true',
    message: 'Static IP option is not available for unlimited packages',
    severity: 'error'
  },
  {
    id: 'unlimited_extraGB',
    rule: 'No ExtraGB and Data Add-ons for unlimited packages',
    condition: 'packageType === "Unlimited" && hasDataAddons === true',
    message: 'ExtraGB and Data Add-ons are not applicable for unlimited packages',
    severity: 'warning'
  },
  {
    id: 'time_based_throttling',
    rule: 'Speed throttling after data limits for time-based packages',
    condition: 'packageType === "Time_based"',
    message: 'Download and upload speeds will be reduced to 64 Kbps after reaching data limits',
    severity: 'info'
  },
  {
    id: 'anytime_throttling',
    rule: 'Speed throttling after data limits for anytime packages',
    condition: 'packageType === "Anytime"',
    message: 'Download and upload speeds will be reduced to 64 Kbps after reaching data limits',
    severity: 'info'
  },
  {
    id: 'entertainment_unlimited_fiber',
    rule: 'Unlimited Entertainment Express for Fiber 1Gbps',
    condition: 'connectionType === "Fiber_1Gbps" && packageType === "Unlimited"',
    message: 'Includes Netflix, Amazon Prime, Apple TV+, PEOTVGO, Hulu, Roku TV, SriLix, YouTube, Facebook & Messenger, Instagram, TikTok, WhatsApp, Viber, Imo, Botim, Spotify, Skype, Zoom, Teams',
    severity: 'info'
  },
  {
    id: 'residential_only_unlimited',
    rule: 'Unlimited packages for residential customers only',
    condition: 'packageType === "Unlimited"',
    message: 'Unlimited packages are only applicable for residential broadband customers',
    severity: 'warning'
  },
  {
    id: 'adsl_migration_eligibility',
    rule: 'ADSL unlimited package migration eligibility',
    condition: 'connectionType === "ADSL" && packageType === "Unlimited"',
    message: 'Migration to unlimited packages is entitled to ADSL connections activated more than 6 months ago',
    severity: 'info'
  }
];