import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Plus,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  Smartphone,
  Globe,
  Building,
  Loader2,
  Save,
  Trash2,
  WifiOff,
  Server,
  Activity,
  Zap,
  Calendar,
  Shield,
  Clock,
  DollarSign
} from 'lucide-react';

// Import your existing API client
import { productConfigurationApi } from '@/lib/api';
import { enhancedApiService } from './api-service';
import { QualificationOverviewTab } from './ProductConfigurationOverview';

// Validation Function
const validateConfiguration = (config: any) => {
  const messages: string[] = [];
  let isValid = true;

  if (!config.category) {
    messages.push('ERROR: Category selection is required');
    isValid = false;
    return { isValid, messages };
  }

  switch (config.category) {
    case 'Broadband':
      if (!config.connectionType) {
        messages.push('ERROR: Connection type is required');
        isValid = false;
      }
      if (!config.packageType) {
        messages.push('ERROR: Package type is required');
        isValid = false;
      }
      if (!config.speedTier) {
        messages.push('ERROR: Speed tier is required');
        isValid = false;
      }
      if (config.packageType === 'Unlimited' && config.staticIP) {
        messages.push('ERROR: Static IP not available for unlimited packages');
        isValid = false;
      }
      break;

    case 'Business':
      if (!config.businessType) {
        messages.push('WARNING: Business type should be specified');
      }
      break;

    case 'Mobile':
      if (!config.mobileDataPlan) {
        messages.push('ERROR: Mobile data plan is required');
        isValid = false;
      }
      break;

    case 'Cloud_Service':
      if (!config.cloudServiceType) {
        messages.push('ERROR: Cloud service type is required');
        isValid = false;
      }
      if (config.cloudServiceType === 'Computing' && (!config.computeInstances || config.computeInstances < 1)) {
        messages.push('ERROR: At least one compute instance is required');
        isValid = false;
      }
      break;
  }

  return { isValid, messages };
};

// Helper function to display values properly in UI
const displayValue = (value: any, fallback: string = 'Not specified') => {
  return value !== undefined && value !== null ? value : fallback;
};

// Enhanced data extraction function that reads from configurationCharacteristic properly
const extractConfigurationData = (config: any) => {
  console.log('🔍 Extracting data from config:', config);
  console.log('🔍 Config keys available:', Object.keys(config));
  
  // 🔧 ENHANCED: Always provide all expected fields with proper fallbacks
  const defaultFields = {
    category: undefined,
    connectionType: undefined,
    packageType: undefined,
    speedTier: undefined,
    contractTerm: undefined,
    staticIP: undefined,
    staticIp: undefined,
    customerEmail: undefined,
    dataAmount: undefined,
    notes: undefined,
    entertainmentAddons: [],
    businessType: undefined,
    bandwidthGuarantee: undefined,
    dedicatedSupport: undefined,
    redundantConnection: undefined,
    mobileDataPlan: undefined,
    voiceMinutes: undefined,
    smsCount: undefined,
    roamingEnabled: undefined,
    callWaiting: undefined,
    voiceMail: undefined,
    cloudServiceType: undefined,
    storageCapacity: undefined,
    computeInstances: undefined,
    cpuCores: undefined,
    hostingPlan: undefined,
    domainCount: undefined,
    backupFrequency: undefined,
    retentionPeriod: undefined,
  };
  
  // 🔧 PRIORITY 1: Extract from configurationCharacteristic (where we now store data)
  if (
    config.checkProductConfigurationItem &&
    config.checkProductConfigurationItem[0] &&
    config.checkProductConfigurationItem[0].productConfiguration &&
    Array.isArray(config.checkProductConfigurationItem[0].productConfiguration.configurationCharacteristic)
  ) {
    console.log('🔧 Reading from configurationCharacteristic...');
    const characteristics = config.checkProductConfigurationItem[0].productConfiguration.configurationCharacteristic;
    
    for (const char of characteristics) {
      if (char.name && char.value !== undefined) {
        console.log(`📋 Found characteristic: ${char.name} = ${char.value}`);
        defaultFields[char.name] = char.value;
      }
    }
  }
  
  // 🔧 PRIORITY 2: Extract from productCharacteristic as backup
  if (
    config.checkProductConfigurationItem &&
    config.checkProductConfigurationItem[0] &&
    config.checkProductConfigurationItem[0].productConfiguration &&
    config.checkProductConfigurationItem[0].productConfiguration.product &&
    Array.isArray(config.checkProductConfigurationItem[0].productConfiguration.product.productCharacteristic)
  ) {
    console.log('🔧 Reading from product.productCharacteristic...');
    const productChars = config.checkProductConfigurationItem[0].productConfiguration.product.productCharacteristic;
    
    for (const char of productChars) {
      if (char.name && char.value !== undefined && !defaultFields[char.name]) {
        console.log(`📋 Found product characteristic: ${char.name} = ${char.value}`);
        defaultFields[char.name] = char.value;
      }
    }
  }
  
  // 🔧 PRIORITY 3: Try to extract from top-level productConfigurationSpecification
  if (config.productConfigurationSpecification) {
    console.log('🔧 Reading from top-level productConfigurationSpecification...');
    Object.entries(config.productConfigurationSpecification).forEach(([key, value]) => {
      if (!defaultFields[key] && value !== undefined) {
        console.log(`📋 Found spec field: ${key} = ${value}`);
        defaultFields[key] = value;
      }
    });
  }
  
  // 🔧 PRIORITY 4: Try to extract from item-level productConfigurationSpecification
  if (
    config.checkProductConfigurationItem &&
    config.checkProductConfigurationItem[0] &&
    config.checkProductConfigurationItem[0].productConfigurationSpecification
  ) {
    console.log('🔧 Reading from item-level productConfigurationSpecification...');
    Object.entries(config.checkProductConfigurationItem[0].productConfigurationSpecification).forEach(([key, value]) => {
      if (!defaultFields[key] && value !== undefined) {
        console.log(`📋 Found item spec field: ${key} = ${value}`);
        defaultFields[key] = value;
      }
    });
  }
  
  // Extract pricing from configurationPrice
  const pricing = {
    monthlyFee: 0,
    setupFee: 0,
    deposit: 0
  };
  
  if (
    config.checkProductConfigurationItem &&
    config.checkProductConfigurationItem[0] &&
    config.checkProductConfigurationItem[0].productConfiguration &&
    config.checkProductConfigurationItem[0].productConfiguration.configurationPrice &&
    config.checkProductConfigurationItem[0].productConfiguration.configurationPrice.length > 0
  ) {
    const priceConfig = config.checkProductConfigurationItem[0].productConfiguration.configurationPrice[0];
    if (priceConfig.price?.taxIncludedAmount?.value) {
      pricing.monthlyFee = priceConfig.price.taxIncludedAmount.value;
    }
  }
  
  // Determine category from various sources
  let category = 'Broadband'; // default
  
  // Try to get category from characteristics first
  if (defaultFields.category) {
    category = defaultFields.category;
  } else if (config.checkProductConfigurationItem?.[0]?.productConfiguration?.productOffering?.name) {
    const offeringName = config.checkProductConfigurationItem[0].productConfiguration.productOffering.name;
    if (offeringName.includes('Mobile')) {
      category = 'Mobile';
    } else if (offeringName.includes('Business')) {
      category = 'Business';
    } else if (offeringName.includes('Cloud')) {
      category = 'Cloud_Service';
    }
  }
  
  // 🔧 FINAL: Build complete configuration object
  const finalConfig = {
    id: config.id,
    category: category,
    status: config.state || 'acknowledged',
    validationMessages: [],
    createdAt: config.createdAt || new Date().toISOString(),
    updatedAt: config.updatedAt,
    pricing,
    
    // 🔧 ALL CONFIGURATION FIELDS from characteristics
    connectionType: defaultFields.connectionType,
    packageType: defaultFields.packageType,
    speedTier: defaultFields.speedTier,
    contractTerm: defaultFields.contractTerm,
    staticIP: defaultFields.staticIP,
    entertainmentAddons: defaultFields.entertainmentAddons || [],
    
    // Business specific fields
    businessType: defaultFields.businessType,
    bandwidthGuarantee: defaultFields.bandwidthGuarantee,
    dedicatedSupport: defaultFields.dedicatedSupport,
    redundantConnection: defaultFields.redundantConnection,
    
    // Mobile specific fields
    mobileDataPlan: defaultFields.mobileDataPlan,
    voiceMinutes: defaultFields.voiceMinutes,
    smsCount: defaultFields.smsCount,
    roamingEnabled: defaultFields.roamingEnabled,
    callWaiting: defaultFields.callWaiting,
    voiceMail: defaultFields.voiceMail,
    
    // Cloud Service specific fields
    cloudServiceType: defaultFields.cloudServiceType,
    storageCapacity: defaultFields.storageCapacity,
    computeInstances: defaultFields.computeInstances,
    cpuCores: defaultFields.cpuCores,
    hostingPlan: defaultFields.hostingPlan,
    domainCount: defaultFields.domainCount,
    backupFrequency: defaultFields.backupFrequency,
    retentionPeriod: defaultFields.retentionPeriod,
    
    // Add raw config for debugging
    _rawConfig: config,
    _extractedFields: defaultFields
  };
  
  console.log('✅ Final transformed config:', finalConfig);
  console.log('📋 Extracted fields summary:', {
    connectionType: finalConfig.connectionType,
    packageType: finalConfig.packageType,
    speedTier: finalConfig.speedTier,
    contractTerm: finalConfig.contractTerm,
    staticIP: finalConfig.staticIP,
    category: finalConfig.category
  });
  
  return finalConfig;
};

// Utility Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'done': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'inProgress': return 'bg-yellow-100 text-yellow-800';
    case 'acknowledged': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Broadband': return <Wifi className="w-4 h-4" />;
    case 'Business': return <Building className="w-4 h-4" />;
    case 'Mobile': return <Smartphone className="w-4 h-4" />;
    case 'Cloud_Service': return <Globe className="w-4 h-4" />;
    default: return <Settings className="w-4 h-4" />;
  }
};

const getConnectionIcon = (connectionType: string) => {
  switch (connectionType) {
    case 'Fiber':
    case 'Fiber_1Gbps':
      return <Zap className="w-4 h-4 text-blue-600" />;
    case 'ADSL':
      return <Wifi className="w-4 h-4 text-green-600" />;
    case '4G_LTE':
      return <Smartphone className="w-4 h-4 text-purple-600" />;
    default:
      return <Wifi className="w-4 h-4 text-gray-600" />;
  }
};

// Configuration interface
interface Configuration {
  id: string;
  category: string;
  status?: string;
  pricing?: {
    monthlyFee?: number;
    setupFee?: number;
    deposit?: number;
  };
  validationMessages?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Configuration specific fields
  connectionType?: string;
  packageType?: string;
  speedTier?: string;
  contractTerm?: string;
  staticIP?: boolean;
  entertainmentAddons?: string[];
  businessType?: string;
  bandwidthGuarantee?: boolean;
  dedicatedSupport?: boolean;
  redundantConnection?: boolean;
  mobileDataPlan?: string;
  voiceMinutes?: string;
  smsCount?: string;
  roamingEnabled?: boolean;
  callWaiting?: boolean;
  voiceMail?: boolean;
  cloudServiceType?: string;
  storageCapacity?: string;
  computeInstances?: number;
  cpuCores?: string;
  hostingPlan?: string;
  domainCount?: number;
  backupFrequency?: string;
  retentionPeriod?: string;
  [key: string]: any;
}

// Form data interface
interface FormData {
  category: string;
  connectionType: string;
  packageType: string;
  speedTier: string;
  staticIP: boolean;
  entertainmentAddons: string[];
  businessType: string;
  bandwidthGuarantee: boolean;
  dedicatedSupport: boolean;
  redundantConnection: boolean;
  mobileDataPlan: string;
  voiceMinutes: string;
  smsCount: string;
  roamingEnabled: boolean;
  callWaiting: boolean;
  voiceMail: boolean;
  cloudServiceType: string;
  storageCapacity: string;
  computeInstances: number;
  cpuCores: string;
  hostingPlan: string;
  domainCount: number;
  backupFrequency: string;
  retentionPeriod: string;
  contractTerm: string;
  monthlyFee: number;
  setupFee: number;
  deposit: number;
}

// Initial form data
const initialFormData: FormData = {
  category: '',
  connectionType: '',
  packageType: '',
  speedTier: '',
  staticIP: false,
  entertainmentAddons: [],
  businessType: '',
  bandwidthGuarantee: false,
  dedicatedSupport: false,
  redundantConnection: false,
  mobileDataPlan: '',
  voiceMinutes: '',
  smsCount: '',
  roamingEnabled: false,
  callWaiting: false,
  voiceMail: false,
  cloudServiceType: '',
  storageCapacity: '',
  computeInstances: 1,
  cpuCores: '2',
  hostingPlan: '',
  domainCount: 1,
  backupFrequency: 'daily',
  retentionPeriod: '30days',
  contractTerm: '',
  monthlyFee: 0,
  setupFee: 0,
  deposit: 0
};

// Backend status interface
interface BackendStatus {
  isOnline: boolean;
  health: boolean;
  api: boolean;
  deleteSupported: boolean;
  latency: number | null;
  error: string | null;
}

// Entertainment Add-ons mapping
const ENTERTAINMENT_ADDONS = {
  'netflix': 'Netflix',
  'amazon_prime': 'Amazon Prime',
  'apple_tv': 'Apple TV+',
  'peotvgo': 'PEOTVGO',
  'spotify': 'Spotify',
  'youtube_premium': 'YouTube Premium'
};

// Simple text display component for raw backend data
const SimpleDataDisplay = ({ config }: { config: any }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Raw Configuration Data</h3>
        
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">ID:</span> {config.id}
            </div>
            <div>
              <span className="font-medium">Status:</span> {config.status}
            </div>
            <div>
              <span className="font-medium">Customer Email:</span> {config.customerEmail || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Category:</span> {config.category}
            </div>
            <div>
              <span className="font-medium">Connection Type:</span> {config.connectionType || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Package Type:</span> {config.packageType || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Speed Tier:</span> {config.speedTier || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Data Amount:</span> {config.dataAmount || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Contract Term:</span> {config.contractTerm || 'Not specified'}
            </div>
            <div>
              <span className="font-medium">Static IP:</span> {(config.staticIP ?? config.staticIp) ? 'Yes' : 'No'}
            </div>
          </div>
          
          <div className="border-t pt-3">
            <span className="font-medium">Monthly Fee:</span> LKR {config.pricing?.monthlyFee || 0}
          </div>
          
          <div className="border-t pt-3">
            <span className="font-medium">Created:</span> {config.createdAt ? new Date(config.createdAt).toLocaleString() : 'N/A'}
          </div>
          
          <div className="border-t pt-3">
            <span className="font-medium">Updated:</span> {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : 'N/A'}
          </div>

          <div className="border-t pt-3">
            <span className="font-medium">Notes:</span>
            <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-700 whitespace-pre-wrap">{config.notes || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Configuration Details Component
const ConfigurationDetails = ({ config }: { config: Configuration }) => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getStatusColor(config.status || 'acknowledged')}>
              {(config.status || 'acknowledged').toUpperCase()}
            </Badge>
            <div className="text-sm text-gray-600">
              ID: {config.id}
            </div>
          </div>
          {config.createdAt && (
            <div className="text-xs text-gray-500">
              Created: {new Date(config.createdAt).toLocaleString()}
            </div>
          )}
        </div>
        
        {config.pricing && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              LKR {config.pricing.monthlyFee?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        )}
      </div>

      {/* Simple Data Display */}
      <SimpleDataDisplay config={config} />
    </div>
  );
};

// Main Component
export default function SLTProductConfigurationDashboard() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Enhanced delete function
  const deleteConfiguration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    
    setDeleting(id);
    setError(null);
    
    try {
      console.log('🗑️ Initiating enhanced delete for:', id);
      
      const result = await enhancedApiService.deleteConfiguration(id);
      
      // Update UI immediately for better UX
      setConfigurations(prev => prev.filter(config => config.id !== id));
      
      if (result.note) {
        console.log(`ℹ️ ${result.note}`);
      } else {
        console.log('✅ Configuration deleted successfully');
      }
      
      // Refresh after a short delay to ensure consistency
      setTimeout(() => {
        loadConfigurations();
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Enhanced delete failed:', err);
      
      let userMessage = '';
      let offerFallback = false;
      
      switch (err.message) {
        case 'NETWORK_ERROR':
          userMessage = '🔌 Network Error: Cannot connect to the backend server.';
          offerFallback = true;
          break;
          
        case 'DELETE_NOT_SUPPORTED':
          userMessage = '⚠️ Delete Not Supported: The backend API does not implement DELETE operations.';
          offerFallback = true;
          break;
          
        case 'ALL_ENDPOINTS_FAILED':
          userMessage = '❌ All Endpoints Failed: Tried multiple deletion endpoints but none worked.';
          offerFallback = true;
          break;
          
        default:
          userMessage = `❌ Delete Failed: ${err.message}`;
          offerFallback = true;
      }
      
      if (offerFallback) {
        const shouldRemoveFromUI = confirm(
          `${userMessage}\n\nWould you like to remove this configuration from the UI?`
        );
        
        if (shouldRemoveFromUI) {
          setConfigurations(prev => prev.filter(config => config.id !== id));
          setError('⚠️ Configuration removed from UI only');
        } else {
          setError(userMessage);
        }
      }
    } finally {
      setDeleting(null);
    }
  };

  // Load configurations with enhanced data extraction
  const loadConfigurations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Loading configurations using existing API client...');
      const response = await enhancedApiService.getAllConfigurations();
      
      console.log('📋 RAW API RESPONSE:', response);
      
      // Transform API response using enhanced extraction
      const transformedConfigs: Configuration[] = (response || []).map((config: any) => {
        return extractConfigurationData(config);
      });
      
      setConfigurations(transformedConfigs);
      console.log('✅ Loaded', transformedConfigs.length, 'configurations');
      
    } catch (err: any) {
      console.error('❌ Error loading configurations:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configurations';
      
      if (errorMessage.includes('fetch')) {
        setError(`🔌 Connection Error: Cannot reach the backend server.

Possible causes:
• Backend server is offline or restarting
• Network connectivity issues  
• CORS configuration problems
• MongoDB connection issues

API Base URL: ${import.meta.env.VITE_API_BASE_URL || '/api'}

Try refreshing in a few moments or check the backend status.`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check backend status
  const checkBackendStatus = async () => {
    setLoading(true);
    try {
      const status = await enhancedApiService.checkBackendStatus();
      setBackendStatus(status);
      
      if (!status.isOnline) {
        setError('🔴 Backend is offline. Please wait for the service to come back online.');
      } else {
        setError(null);
      }
      
    } catch (err: any) {
      console.error('Status check failed:', err);
      setBackendStatus({ 
        isOnline: false, 
        health: false, 
        api: false, 
        deleteSupported: false, 
        latency: null, 
        error: err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  // Save configuration
  const createConfiguration = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const configData = {
        ...formData,
        pricing: {
          monthlyFee: formData.monthlyFee,
          setupFee: formData.setupFee,
          deposit: formData.deposit,
          currency: 'LKR'
        }
      };

      console.log('🚀 Creating configuration with data:', configData);

      const validation = validateConfiguration(configData);
      const configWithValidation = {
        ...configData,
        validationMessages: validation.messages
      };

      const result = await enhancedApiService.checkProductConfiguration(configWithValidation);
      console.log('✅ Configuration created:', result);
      
      await loadConfigurations();
      
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      
    } catch (err: any) {
      console.error('❌ Error during save:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  // Calculate stats for overview
  const stats = {
    totalConfigurations: configurations.length,
    broadbandConfigs: configurations.filter(c => c.category === 'Broadband').length,
    mobileConfigs: configurations.filter(c => c.category === 'Mobile').length,
    businessConfigs: configurations.filter(c => c.category === 'Business').length,
    cloudConfigs: configurations.filter(c => c.category === 'Cloud_Service').length,
    activeConfigs: configurations.filter(c => c.status === 'done' || c.status === 'acknowledged').length,
    completedConfigs: configurations.filter(c => c.status === 'done').length,
    avgConfigTime: "2.5 hours", // placeholder
  };

  // Determine connection status
  const connectionStatus = backendStatus?.isOnline 
    ? 'connected' 
    : backendStatus === null 
      ? 'connecting' 
      : 'offline';

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header with Backend Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">SLT Product Configuration</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Configure and validate SLT products with enhanced data extraction
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-xs text-gray-500">
              API Base: {import.meta.env.VITE_API_BASE_URL || '/api'}
            </div>
            {backendStatus?.isOnline ? (
              <div className="flex items-center gap-1 text-green-600">
                <Activity className="w-3 h-3" />
                <span className="text-xs">Online</span>
                {backendStatus.latency && (
                  <span className="text-xs text-gray-500">({backendStatus.latency}ms)</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="w-3 h-3" />
                <span className="text-xs">Offline</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={checkBackendStatus} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <Server className={`w-4 h-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
            Status Check
          </Button>
          <Button 
            variant="outline" 
            onClick={loadConfigurations} 
            disabled={loading} 
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="w-full sm:w-auto"
            disabled={backendStatus !== null && !backendStatus.isOnline}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Configuration
          </Button>
        </div>
      </div>

      {/* Enhanced Status Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-3">
              <div className="font-medium">System Status Alert</div>
              <div className="text-sm whitespace-pre-line">{error}</div>
              
              {backendStatus && (
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-sm space-y-1">
                    <div className="font-medium text-gray-700">Backend Status Details:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Health: {backendStatus.health ? '✅' : '❌'}</div>
                      <div>API: {backendStatus.api ? '✅' : '❌'}</div>
                      <div>Delete Support: {backendStatus.deleteSupported ? '✅' : '❌'}</div>
                      <div>Latency: {backendStatus.latency || 'N/A'}ms</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <QualificationOverviewTab 
            stats={stats}
            configurations={configurations}
            connectionStatus={connectionStatus}
            onCreateConfiguration={() => setIsCreateDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">

      {/* Configurations List */}
      <Card>
        <CardHeader>
          <CardTitle>Product Configurations</CardTitle>
          <CardDescription>
            Manage SLT product configurations with enhanced data display
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading configurations...</p>
            </div>
          ) : configurations.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Configurations</h3>
              <p className="text-gray-600 mb-4">Start by creating your first configuration.</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                disabled={backendStatus !== null && !backendStatus.isOnline}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Configuration
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <Card key={config.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getCategoryIcon(config.category)}
                          <span className="font-medium">{config.category?.replace('_', ' ')}</span>
                          
                          <Badge className={getStatusColor(config.status || 'acknowledged')}>
                            {(config.status || 'acknowledged').toUpperCase()}
                          </Badge>
                          
                          {deleting === config.id && (
                            <Badge variant="outline" className="text-orange-600">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              DELETING
                            </Badge>
                          )}
                        </div>
                        
                        {/* Enhanced Configuration Preview */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-600">
                          {config.connectionType && (
                            <div className="flex items-center gap-1">
                              <Wifi className="w-3 h-3" />
                              {config.connectionType.replace('_', ' ')}
                            </div>
                          )}
                          {config.packageType && (
                            <div className="flex items-center gap-1">
                              <Settings className="w-3 h-3" />
                              {config.packageType}
                            </div>
                          )}
                          {config.speedTier && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {config.speedTier.replace('_', ' / ')}
                            </div>
                          )}
                          {config.mobileDataPlan && (
                            <div className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              {config.mobileDataPlan.toUpperCase()}
                            </div>
                          )}
                          {config.businessType && (
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {config.businessType}
                            </div>
                          )}
                          {config.cloudServiceType && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {config.cloudServiceType}
                            </div>
                          )}
                        </div>
                        
                        {config.pricing && (
                          <div className="text-lg font-semibold">
                            LKR {config.pricing.monthlyFee?.toLocaleString() || 0}/month
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>ID: {config.id}</div>
                          {config.createdAt && (
                            <div>Created: {new Date(config.createdAt).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedConfig(config);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => config.id && deleteConfiguration(config.id)}
                          disabled={deleting === config.id || (backendStatus !== null && !backendStatus.isOnline)}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deleting === config.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Create Configuration Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Configuration</DialogTitle>
            <DialogDescription>Configure a new SLT product setup</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Select Product Category</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'Broadband', name: 'Broadband', icon: <Wifi className="w-5 h-5" /> },
                  { id: 'Mobile', name: 'Mobile', icon: <Smartphone className="w-5 h-5" /> },
                  { id: 'Business', name: 'Business', icon: <Building className="w-5 h-5" /> },
                  { id: 'Cloud_Service', name: 'Cloud Service', icon: <Globe className="w-5 h-5" /> }
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                    className={`p-4 border rounded-lg flex items-center gap-3 text-left transition-colors ${
                      formData.category === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category-specific fields */}
            {formData.category && (
              <div className="space-y-4">
                <h4 className="font-medium">Configuration Details</h4>
                
                {formData.category === 'Broadband' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Connection Type</label>
                      <select
                        value={formData.connectionType}
                        onChange={(e) => setFormData(prev => ({ ...prev, connectionType: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select type</option>
                        <option value="Fiber">Fiber</option>
                        <option value="Fiber_1Gbps">Fiber 1Gbps</option>
                        <option value="ADSL">ADSL</option>
                        <option value="4G_LTE">4G LTE</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Package Type</label>
                      <select
                        value={formData.packageType}
                        onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select package</option>
                        <option value="Unlimited">Unlimited</option>
                        <option value="Time_based">Time Based</option>
                        <option value="Anytime">Anytime</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Speed Tier</label>
                      <select
                        value={formData.speedTier}
                        onChange={(e) => setFormData(prev => ({ ...prev, speedTier: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select speed</option>
                        <option value="21mbps_512kbps">21 Mbps / 512 Kbps</option>
                        <option value="100mbps_10mbps">100 Mbps / 10 Mbps</option>
                        <option value="300mbps_150mbps">300 Mbps / 150 Mbps</option>
                        <option value="1000mbps_500mbps">1000 Mbps / 500 Mbps</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contract Term</label>
                      <select
                        value={formData.contractTerm}
                        onChange={(e) => setFormData(prev => ({ ...prev, contractTerm: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Select term</option>
                        <option value="12_months">12 Months</option>
                        <option value="24_months">24 Months</option>
                        <option value="no_contract">No Contract</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2 col-span-2">
                      <input
                        type="checkbox"
                        id="staticIP"
                        checked={formData.staticIP}
                        onChange={(e) => setFormData(prev => ({ ...prev, staticIP: e.target.checked }))}
                        className="rounded"
                        disabled={formData.packageType === 'Unlimited'}
                      />
                      <label htmlFor="staticIP" className={`text-sm font-medium ${formData.packageType === 'Unlimited' ? 'text-gray-400' : ''}`}>
                        Static IP Address
                      </label>
                      {formData.packageType === 'Unlimited' && (
                        <span className="text-xs text-red-600">(Not available for unlimited packages)</span>
                      )}
                    </div>

                    {/* Entertainment Add-ons */}
                    <div className="col-span-2 space-y-3">
                      <label className="text-sm font-medium">Entertainment Add-ons</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'netflix', name: 'Netflix' },
                          { id: 'amazon_prime', name: 'Amazon Prime' },
                          { id: 'apple_tv', name: 'Apple TV+' },
                          { id: 'spotify', name: 'Spotify' },
                          { id: 'youtube_premium', name: 'YouTube Premium' },
                          { id: 'peotvgo', name: 'PEOTVGO' }
                        ].map((addon) => (
                          <div key={addon.id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={addon.id}
                              checked={formData.entertainmentAddons?.includes(addon.id) || false}
                              onChange={(e) => {
                                const currentAddons = formData.entertainmentAddons || [];
                                if (e.target.checked) {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    entertainmentAddons: [...currentAddons, addon.id] 
                                  }));
                                } else {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    entertainmentAddons: currentAddons.filter(id => id !== addon.id) 
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <label htmlFor={addon.id} className="text-sm">{addon.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add other category forms here - Mobile, Business, Cloud_Service */}
                {/* Similar structure to the original but condensed for space */}
              </div>
            )}

            {/* Pricing Information */}
            {formData.category && (
              <div className="space-y-4">
                <h4 className="font-medium">Pricing Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Fee (LKR)</label>
                    <input
                      type="number"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="3499"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Setup Fee (LKR)</label>
                    <input
                      type="number"
                      value={formData.setupFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, setupFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deposit (LKR)</label>
                    <input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, deposit: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Live Validation */}
            {formData.category && (
              <div className="space-y-2">
                <h4 className="font-medium">Configuration Validation</h4>
                <div className="p-4 border rounded-lg space-y-2">
                  {(() => {
                    const validation = validateConfiguration(formData);
                    return (
                      <>
                        <div className={`flex items-center gap-2 ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {validation.isValid ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span className="font-medium">
                            {validation.isValid ? 'Configuration Valid' : 'Configuration Invalid'}
                          </span>
                        </div>
                        {validation.messages.map((message, index) => (
                          <Alert key={index} className="text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{message}</AlertDescription>
                          </Alert>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={createConfiguration} 
              disabled={!formData.category || saving || (backendStatus !== null && !backendStatus.isOnline)}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced View Configuration Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedConfig && getCategoryIcon(selectedConfig.category)}
              Configuration Details - {selectedConfig?.category?.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription>
              Detailed view of the SLT product configuration with enhanced data display
            </DialogDescription>
          </DialogHeader>
          
          {selectedConfig && <ConfigurationDetails config={selectedConfig} />}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}