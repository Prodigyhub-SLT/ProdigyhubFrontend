// Fixed api-service.ts - Ensures configuration data is stored properly in MongoDB

import { productConfigurationApi } from '@/lib/api';

// Enhanced API Service - Fixed Version
export const enhancedApiService = {
  async checkProductConfiguration(configData: any) {
    console.log('📝 Creating configuration with data:', configData);
    
    const category = configData.category || 'Broadband';
    const specId = `spec-${category.toLowerCase()}-${Date.now()}`;
    const specName = `${category} Configuration`;
    const itemId = `item-${Date.now()}`;
    
    // 🔧 CRITICAL FIX: Store configuration details in configurationCharacteristic
    const configurationCharacteristics = [];
    
    // Convert form data to characteristic format
    Object.entries(configData).forEach(([key, value]) => {
      if (key !== 'pricing' && value !== undefined && value !== null && value !== '') {
        // Handle arrays (like entertainmentAddons)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            configurationCharacteristics.push({
              name: key,
              value: value,
              '@type': 'ConfigurationCharacteristic'
            });
          }
        } else {
          configurationCharacteristics.push({
            name: key,
            value: value,
            '@type': 'ConfigurationCharacteristic'
          });
        }
      }
    });

    console.log('🔧 Configuration characteristics to store:', configurationCharacteristics);
    
    // Create the TMF request with proper data structure
    const tmfRequest = {
      '@type': 'CheckProductConfiguration',
      id: `check_${Date.now()}`,
      state: 'acknowledged',
      instantSync: false,
      provideAlternatives: false,
      
      // 🔧 STORE AT TOP LEVEL for extraction
      productConfigurationSpecification: configData,
      
      // Set up proper context
      channel: {
        '@type': 'ChannelRef'
      },
      contextEntity: {
        '@type': 'EntityRef'
      },
      
      // 🔧 CRITICAL: Store configuration details in MongoDB-persisted fields
      checkProductConfigurationItem: [
        {
          '@type': 'CheckProductConfigurationItem',
          id: itemId,
          state: 'approved',
          contextItem: {
            '@type': 'ItemRef'
          },
          
          // 🔧 Store the configuration data here for MongoDB persistence
          productConfigurationSpecification: configData,
          
          productConfiguration: {
            '@type': 'ProductConfiguration',
            productOffering: {
              id: specId,
              name: specName,
              '@type': 'ProductOfferingRef'
            },
            product: {
              '@type': 'Product',
              // Store config details in productCharacteristic as well
              productCharacteristic: configurationCharacteristics.map(char => ({
                ...char,
                '@type': 'Characteristic'
              }))
            },
            // 🔧 MOST IMPORTANT: Store config details here - MongoDB preserves this
            configurationCharacteristic: configurationCharacteristics,
            
            configurationPrice: configData.pricing ? [{
              '@type': 'ConfigurationPrice',
              name: 'Monthly Fee',
              priceType: 'recurring',
              price: {
                '@type': 'Price',
                taxIncludedAmount: {
                  unit: configData.pricing.currency || 'LKR',
                  value: configData.pricing.monthlyFee || 0,
                  '@type': 'Money'
                },
                dutyFreeAmount: {
                  '@type': 'Money'
                }
              }
            }] : []
          },
          
          stateReason: [],
          alternateProductConfigurationProposal: []
        }
      ],
      relatedParty: [],
      contextCharacteristic: [],
      requestedDate: new Date().toISOString(),
    };
    
    console.log('📤 Sending FIXED TMF760 request:', JSON.stringify(tmfRequest, null, 2));
    
    return await productConfigurationApi.createCheckConfiguration(tmfRequest as any);
  },

  // Keep the existing methods unchanged
  async getAllConfigurations() {
    console.log('📥 Loading configurations with enhanced MongoDB support...');
    
    // 🔧 ENHANCED: Try multiple endpoints and field selections
    const endpoints = [
      '/api/tmf-api/productConfigurationManagement/v5/checkProductConfiguration?limit=100',
      '/api/tmf-api/productConfigurationManagement/v5/checkProductConfiguration?fields=id,state,checkProductConfigurationItem,productConfigurationSpecification&limit=100',
      '/api/tmf-api/productConfigurationManagement/v5/checkProductConfiguration?fields=id,state,checkProductConfigurationItem,productConfigurationSpecification,createdAt,updatedAt&limit=100',
      'https://prodigyhub.onrender.com/tmf-api/productConfigurationManagement/v5/checkProductConfiguration?limit=100',
    ];
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      try {
        console.log(`🔄 Attempt ${i + 1}/${endpoints.length}: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`❌ Endpoint ${endpoint} failed: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const configs = await response.json();
        console.log(`📋 Raw configurations from ${endpoint}:`, configs);
        
        if (configs && Array.isArray(configs) && configs.length > 0) {
          console.log(`✅ Successfully loaded ${configs.length} configurations from ${endpoint}`);
          
          // 🔧 ENHANCED: Log detailed structure of first config for debugging
          if (configs[0]) {
            console.log('🔍 First config structure:', {
              id: configs[0].id,
              state: configs[0].state,
              hasCheckProductConfigurationItem: !!configs[0].checkProductConfigurationItem,
              itemCount: configs[0].checkProductConfigurationItem?.length || 0,
              hasProductConfiguration: !!configs[0].checkProductConfigurationItem?.[0]?.productConfiguration,
              hasProductConfigurationSpecification: !!configs[0].productConfigurationSpecification,
              keys: Object.keys(configs[0])
            });
            
            if (configs[0].checkProductConfigurationItem?.[0]?.productConfiguration) {
              const productConfig = configs[0].checkProductConfigurationItem[0].productConfiguration;
              console.log('🔍 Product configuration structure:', {
                hasProductOffering: !!productConfig.productOffering,
                hasConfigurationCharacteristic: !!productConfig.configurationCharacteristic,
                hasConfigurationPrice: !!productConfig.configurationPrice,
                hasProduct: !!productConfig.product,
                productOfferingKeys: productConfig.productOffering ? Object.keys(productConfig.productOffering) : [],
                configurationCharacteristicCount: productConfig.configurationCharacteristic?.length || 0,
                configurationPriceCount: productConfig.configurationPrice?.length || 0
              });
            }
          }
          
          return configs;
        } else {
          console.warn(`⚠️ Endpoint ${endpoint} returned empty or invalid data`);
          continue;
        }
        
      } catch (error) {
        console.warn(`❌ Endpoint ${endpoint} failed:`, error);
        continue;
      }
    }
    
    // 🔧 FALLBACK: Try original API client
    console.log('🔄 All endpoints failed, falling back to API client...');
    try {
      const fallbackConfigs = await productConfigurationApi.getCheckConfigurations({ limit: 100 });
      console.log('📋 Fallback configs:', fallbackConfigs);
      return fallbackConfigs;
    } catch (error) {
      console.error('❌ All configuration loading methods failed:', error);
      throw new Error('Failed to load configurations from all available endpoints');
    }
  },

  async getConfigurationById(id: string) {
    console.log('📥 Getting configuration by ID with all fields:', id);
    
    try {
      // Direct fetch to get all fields
      const response = await fetch(`/api/tmf-api/productConfigurationManagement/v5/checkProductConfiguration/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const config = await response.json();
      console.log('📋 Configuration by ID:', config);
      
      return config;
    } catch (error) {
      console.error('❌ Failed to get configuration by ID:', error);
      throw error;
    }
  },

  async deleteConfiguration(id: string) {
    console.log('🗑️ Enhanced delete operation for:', id);
    
    // Try multiple delete endpoints
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    
    const deleteEndpoints = [
      `${baseURL}/tmf-api/productConfigurationManagement/v5/checkProductConfiguration/${id}`,
      `${baseURL}/productConfigurationManagement/v5/checkProductConfiguration/${id}`,
      `${baseURL}/checkProductConfiguration/${id}`,
      `https://prodigyhub.onrender.com/tmf-api/productConfigurationManagement/v5/checkProductConfiguration/${id}`,
    ];
    
    let lastError: Error | null = null;
    let attemptCount = 0;
    
    for (const endpoint of deleteEndpoints) {
      attemptCount++;
      try {
        console.log(`🔄 Attempt ${attemptCount}: DELETE ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log(`📡 Response: ${response.status} ${response.statusText}`);
        
        // Success statuses
        if (response.ok || response.status === 204) {
          console.log('✅ Configuration deleted successfully');
          return { success: true, endpoint, status: response.status };
        }
        
        // Not found - consider as success (already deleted)
        if (response.status === 404) {
          console.log('ℹ️ Configuration not found (may already be deleted)');
          return { success: true, endpoint, status: 404, note: 'Already deleted' };
        }
        
        // Method not allowed
        if (response.status === 405) {
          lastError = new Error('DELETE_METHOD_NOT_ALLOWED');
          continue;
        }
        
        lastError = new Error(`HTTP_${response.status}: ${response.statusText}`);
        
      } catch (fetchError: any) {
        console.warn(`❌ Endpoint ${endpoint} failed:`, fetchError);
        lastError = fetchError;
        continue;
      }
    }
    
    // All endpoints failed
    if (lastError) {
      if (lastError.message === 'DELETE_METHOD_NOT_ALLOWED') {
        throw new Error('DELETE_NOT_SUPPORTED');
      }
      if (lastError.message.includes('fetch') || lastError.name === 'TypeError') {
        throw new Error('NETWORK_ERROR');
      }
      throw lastError;
    }
    
    throw new Error('ALL_ENDPOINTS_FAILED');
  },

  async checkBackendStatus() {
    const status = {
      isOnline: false,
      health: false,
      api: false,
      deleteSupported: false,
      latency: null as number | null,
      error: null as string | null
    };
    
    const startTime = Date.now();
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    
    try {
      // Test API endpoint
      const apiResponse = await fetch(`${baseURL}/tmf-api/productConfigurationManagement/v5/checkProductConfiguration?limit=1`);
      status.api = apiResponse.ok;
      status.isOnline = status.api;
      
      // Test health endpoint
      try {
        const healthResponse = await fetch(`${baseURL}/health`);
        status.health = healthResponse.ok;
        if (!status.isOnline) status.isOnline = status.health;
      } catch {
        // Health endpoint might not exist, that's OK
      }
      
      // Test DELETE support
      try {
        const optionsResponse = await fetch(`${baseURL}/tmf-api/productConfigurationManagement/v5/checkProductConfiguration/test`, {
          method: 'OPTIONS'
        });
        const allowMethods = optionsResponse.headers.get('allow') || '';
        status.deleteSupported = allowMethods.toUpperCase().includes('DELETE');
      } catch {
        status.deleteSupported = false;
      }
      
      status.latency = Date.now() - startTime;
      
    } catch (error: any) {
      status.error = error.message;
      status.latency = Date.now() - startTime;
      
      // Try remote server as backup
      try {
        const remoteResponse = await fetch('https://prodigyhub.onrender.com/health');
        if (remoteResponse.ok) {
          status.health = true;
          status.isOnline = true;
          status.error = 'Local API unavailable, remote server accessible';
        }
      } catch {
        // Both failed
      }
    }
    
    return status;
  }
};