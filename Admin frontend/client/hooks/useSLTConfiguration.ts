// utils/SLTValidationUtils.ts
import { SLTProductConfig, ValidationRule, SLT_VALIDATION_RULES } from '../components/types/SLTTypes';

// Simple condition evaluator for validation rules
export const evaluateCondition = (condition: string, config: any): boolean => {
  try {
    // Replace config properties in condition string
    let evalCondition = condition;
    Object.keys(config).forEach(key => {
      const value = config[key];
      if (typeof value === 'string') {
        evalCondition = evalCondition.replace(key, `"${value}"`);
      } else if (typeof value === 'boolean') {
        evalCondition = evalCondition.replace(key, value.toString());
      }
    });
    
    // Simple condition evaluation (in production, use a proper expression evaluator)
    if (evalCondition.includes('packageType === "Unlimited" && staticIP === true')) {
      return config.packageType === 'Unlimited' && config.staticIP === true;
    }
    if (evalCondition.includes('packageType === "Unlimited"')) {
      return config.packageType === 'Unlimited';
    }
    if (evalCondition.includes('packageType === "Time_based"')) {
      return config.packageType === 'Time_based';
    }
    if (evalCondition.includes('packageType === "Anytime"')) {
      return config.packageType === 'Anytime';
    }
    if (evalCondition.includes('connectionType === "Fiber_1Gbps" && packageType === "Unlimited"')) {
      return config.connectionType === 'Fiber_1Gbps' && config.packageType === 'Unlimited';
    }
    if (evalCondition.includes('connectionType === "ADSL" && packageType === "Unlimited"')) {
      return config.connectionType === 'ADSL' && config.packageType === 'Unlimited';
    }
    
    return false;
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
    return false;
  }
};

// Validate configuration based on SLT rules
export const validateConfiguration = (config: Partial<SLTProductConfig>): { isValid: boolean; messages: string[] } => {
  const messages: string[] = [];
  let isValid = true;

  // Category-specific validation
  if (!config.category) {
    messages.push('ERROR: Category selection is required');
    isValid = false;
    return { isValid, messages };
  }

  // Apply SLT validation rules based on category
  if (config.category === 'Broadband') {
    SLT_VALIDATION_RULES.forEach(rule => {
      const shouldApply = evaluateCondition(rule.condition, config);
      if (shouldApply) {
        messages.push(`${rule.severity.toUpperCase()}: ${rule.message}`);
        if (rule.severity === 'error') {
          isValid = false;
        }
      }
    });

    // Additional broadband validation
    if (config.packageType === 'Unlimited' && config.staticIP) {
      isValid = false;
    }
  }

  // Business category validation
  if (config.category === 'Business') {
    if (!config.businessType) {
      messages.push('WARNING: Business type should be specified');
    }
    if (config.bandwidthGuarantee) {
      messages.push('INFO: Bandwidth guarantee includes SLA commitment');
    }
  }

  // Mobile category validation
  if (config.category === 'Mobile') {
    if (!config.mobileDataPlan) {
      messages.push('ERROR: Mobile data plan is required');
      isValid = false;
    }
    if (config.roamingEnabled) {
      messages.push('INFO: International roaming charges apply');
    }
  }

  // Cloud Service validation
  if (config.category === 'Cloud_Service') {
    if (!config.cloudServiceType) {
      messages.push('ERROR: Cloud service type is required');
      isValid = false;
    }
    if (config.cloudServiceType === 'Computing' && (!config.computeInstances || config.computeInstances < 1)) {
      messages.push('ERROR: At least one compute instance is required');
      isValid = false;
    }
  }

  return { isValid, messages };
};

// Get available speed tiers based on connection type
export const getAvailableSpeedTiers = (connectionType: string) => {
  const speedTiers = {
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
  
  return speedTiers[connectionType as keyof typeof speedTiers] || [];
};

// Get category icon name
export const getCategoryIconName = (category: string): string => {
  const iconMap = {
    'Broadband': 'Wifi',
    'Business': 'Settings',
    'Mobile': 'Smartphone',
    'Cloud_Service': 'Globe'
  };
  
  return iconMap[category as keyof typeof iconMap] || 'Settings';
};

// Get status color class
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'valid': return 'bg-green-100 text-green-800';
    case 'invalid': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Create default form data
export const createDefaultFormData = () => ({
  category: '' as const,
  // Broadband fields
  connectionType: 'Fiber' as const,
  packageType: 'Unlimited' as const,
  speedTier: '',
  dataAllowance: '',
  entertainmentAddons: [] as string[],
  staticIP: false,
  // Business fields
  businessType: 'SME' as const,
  bandwidthGuarantee: false,
  dedicatedSupport: false,
  // Mobile fields
  mobileDataPlan: '',
  voiceMinutes: '',
  smsCount: '',
  roamingEnabled: false,
  // Cloud Service fields
  cloudServiceType: 'Storage' as const,
  storageCapacity: '',
  computeInstances: 1,
  // Common fields
  contractTerm: '12_months' as const,
  monthlyFee: 0,
  setupFee: 0,
  deposit: 0
});