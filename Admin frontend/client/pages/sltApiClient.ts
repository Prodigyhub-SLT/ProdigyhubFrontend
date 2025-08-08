// sltApiClient.ts - API Client for existing MongoDB endpoints

export interface SLTLocationData {
  address: string;
  district: string;
  province: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface InfrastructureAvailability {
  fiber: {
    available: boolean;
    technology: string;
    maxSpeed: string;
    coverage: 'full' | 'partial' | 'none';
    installationTime?: string;
    monthlyFee?: number;
  };
  adsl: {
    available: boolean;
    technology: string;
    maxSpeed: string;
    lineQuality: 'excellent' | 'good' | 'fair' | 'poor';
    distanceFromExchange?: number;
    monthlyFee?: number;
  };
  mobile: {
    available: boolean;
    technologies: string[];
    coverage: string;
    signalStrength?: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface SLTQualificationRequest {
  location: SLTLocationData;
  requestedServices: string[];
  checkFiber: boolean;
  checkADSL: boolean;
  checkMobile: boolean;
  includeAlternatives: boolean;
  customerType?: 'residential' | 'business' | 'enterprise';
}

export interface SLTQualificationResponse {
  id: string;
  href?: string;
  state: 'acknowledged' | 'inProgress' | 'done' | 'terminatedWithError';
  creationDate: string;
  completionDate?: string;
  location: SLTLocationData;
  infrastructure: InfrastructureAvailability;
  requestedServices: string[];
  qualificationResult: 'qualified' | 'unqualified' | 'conditional';
  alternativeOptions?: Array<{
    service: string;
    technology: string;
    speed: string;
    monthlyFee: number;
    availability: string;
  }>;
  estimatedInstallationTime?: string;
  notes?: string[];
  '@type': string;
}

export interface QualificationStats {
  totalQualifications: number;
  fiberAvailable: number;
  adslAvailable: number;
  bothAvailable: number;
  neitherAvailable: number;
  successRate: number;
  avgResponseTime: string;
}

class SLTAPIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://prodigyhub.onrender.com';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
    
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
      
      console.log(`📡 Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      console.log(`✅ API Response received`);
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Create qualification using existing TMF679 endpoint
  async createQualification(request: SLTQualificationRequest): Promise<SLTQualificationResponse> {
    // Transform to match your existing API format
    const tmfRequest = {
      instantSync: true,
      provideAlternative: request.includeAlternatives,
      provideOnlyAvailable: true,
      provideUnavailabilityReason: true,
      
      // Custom SLT data in productOfferingQualificationItem
      productOfferingQualificationItem: [{
        productOffering: {
          id: `slt-${request.requestedServices[0]?.toLowerCase().replace(/\s+/g, '-')}`,
          name: request.requestedServices[0],
          '@type': 'ProductOffering'
        },
        qualificationItem: {
          location: request.location,
          requestedServices: request.requestedServices,
          checkFiber: request.checkFiber,
          checkADSL: request.checkADSL,
          checkMobile: request.checkMobile,
          customerType: request.customerType || 'residential'
        },
        '@type': 'ProductOfferingQualificationItem'
      }],
      
      '@type': 'CheckProductOfferingQualification'
    };

    console.log('🔍 Creating qualification:', tmfRequest);

    try {
      const response = await this.request<any>(
        '/productOfferingQualification/v5/checkProductOfferingQualification',
        {
          method: 'POST',
          body: JSON.stringify(tmfRequest),
        }
      );

      // Transform response to SLT format
      return this.transformToSLTResponse(response, request);
    } catch (error) {
      console.warn('MongoDB API call failed, generating mock response');
      // Fallback to local processing if API fails
      return this.generateMockResponse(request);
    }
  }

  // Get all qualifications
  async getQualifications(params?: {
    province?: string;
    district?: string;
    serviceType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<SLTQualificationResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = `/productOfferingQualification/v5/checkProductOfferingQualification${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.request<any[]>(endpoint);
      
      // Transform all responses to SLT format
      return response.map(item => this.transformStoredResponse(item));
    } catch (error) {
      console.warn('Failed to fetch qualifications from MongoDB, returning empty array');
      return [];
    }
  }

  // Get qualification by ID
  async getQualificationById(id: string): Promise<SLTQualificationResponse> {
    try {
      const response = await this.request<any>(
        `/productOfferingQualification/v5/checkProductOfferingQualification/${id}`
      );
      
      return this.transformStoredResponse(response);
    } catch (error) {
      console.error('Failed to fetch qualification by ID:', error);
      throw error;
    }
  }

  // Update qualification
  async updateQualification(id: string, updates: Partial<SLTQualificationResponse>): Promise<SLTQualificationResponse> {
    try {
      const response = await this.request<any>(
        `/productOfferingQualification/v5/checkProductOfferingQualification/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );
      
      return this.transformStoredResponse(response);
    } catch (error) {
      console.error('Failed to update qualification:', error);
      throw error;
    }
  }

  // Delete qualification
  async deleteQualification(id: string): Promise<void> {
    try {
      await this.request<void>(
        `/productOfferingQualification/v5/checkProductOfferingQualification/${id}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      console.error('Failed to delete qualification:', error);
      throw error;
    }
  }

  // Calculate stats from qualifications
  async getStats(): Promise<QualificationStats> {
    try {
      const qualifications = await this.getQualifications();
      return this.calculateStats(qualifications);
    } catch (error) {
      console.warn('Failed to calculate stats');
      return {
        totalQualifications: 0,
        fiberAvailable: 0,
        adslAvailable: 0,
        bothAvailable: 0,
        neitherAvailable: 0,
        successRate: 0,
        avgResponseTime: '0s'
      };
    }
  }

  // Transform TMF response to SLT format
  private transformToSLTResponse(tmfResponse: any, originalRequest: SLTQualificationRequest): SLTQualificationResponse {
    // Generate infrastructure data based on location
    const infrastructure = this.generateInfrastructureData(originalRequest.location);
    
    // Determine qualification result
    const qualificationResult = this.determineQualificationResult(infrastructure, originalRequest.requestedServices);
    
    // Generate alternative options if needed
    const alternativeOptions = originalRequest.includeAlternatives ? 
      this.generateAlternativeOptions(infrastructure) : undefined;

    return {
      id: tmfResponse.id || `SLT-QUAL-${Date.now()}`,
      href: tmfResponse.href,
      state: tmfResponse.state || 'done',
      creationDate: tmfResponse.creationDate || new Date().toISOString(),
      completionDate: tmfResponse.completionDate || new Date().toISOString(),
      location: originalRequest.location,
      infrastructure,
      requestedServices: originalRequest.requestedServices,
      qualificationResult,
      alternativeOptions,
      estimatedInstallationTime: this.calculateInstallationTime(infrastructure),
      '@type': 'SLTLocationQualification'
    };
  }

  // Transform stored MongoDB response back to SLT format
  private transformStoredResponse(stored: any): SLTQualificationResponse {
    // Extract SLT data from stored TMF format
    const qualificationItem = stored.productOfferingQualificationItem?.[0]?.qualificationItem;
    
    if (!qualificationItem) {
      // Handle legacy format or create from available data
      return this.createFallbackResponse(stored);
    }

    return {
      id: stored.id,
      href: stored.href,
      state: stored.state || 'done',
      creationDate: stored.creationDate,
      completionDate: stored.completionDate,
      location: qualificationItem.location,
      infrastructure: this.generateInfrastructureData(qualificationItem.location),
      requestedServices: qualificationItem.requestedServices || [],
      qualificationResult: stored.qualificationResult || 'qualified',
      alternativeOptions: stored.alternativeOptions,
      estimatedInstallationTime: stored.estimatedInstallationTime,
      '@type': 'SLTLocationQualification'
    };
  }

  // Create fallback response for incompatible stored data
  private createFallbackResponse(stored: any): SLTQualificationResponse {
    return {
      id: stored.id,
      href: stored.href,
      state: stored.state || 'done',
      creationDate: stored.creationDate || new Date().toISOString(),
      completionDate: stored.completionDate,
      location: {
        address: 'Unknown',
        district: 'Unknown',
        province: 'Unknown',
        postalCode: ''
      },
      infrastructure: this.generateDefaultInfrastructure(),
      requestedServices: ['Unknown Service'],
      qualificationResult: 'qualified',
      '@type': 'SLTLocationQualification'
    };
  }

  // Generate mock response for testing
  private generateMockResponse(request: SLTQualificationRequest): SLTQualificationResponse {
    const infrastructure = this.generateInfrastructureData(request.location);
    const qualificationResult = this.determineQualificationResult(infrastructure, request.requestedServices);
    
    return {
      id: `SLT-QUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      state: 'done',
      creationDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      location: request.location,
      infrastructure,
      requestedServices: request.requestedServices,
      qualificationResult,
      alternativeOptions: request.includeAlternatives ? this.generateAlternativeOptions(infrastructure) : undefined,
      estimatedInstallationTime: this.calculateInstallationTime(infrastructure),
      '@type': 'SLTLocationQualification'
    };
  }

  // Generate infrastructure data based on location
  private generateInfrastructureData(location: SLTLocationData): InfrastructureAvailability {
    const isUrbanArea = ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Matara'].includes(location.district);
    const isWesternProvince = location.province === 'Western';
    
    // More realistic availability based on Sri Lankan infrastructure
    const fiberAvailable = isUrbanArea ? Math.random() > 0.3 : Math.random() > 0.7;
    const adslAvailable = Math.random() > 0.15; // ADSL more widely available
    
    return {
      fiber: {
        available: fiberAvailable,
        technology: fiberAvailable ? 'FTTH' : 'N/A',
        maxSpeed: fiberAvailable ? (isWesternProvince ? '100 Mbps' : '50 Mbps') : 'N/A',
        coverage: fiberAvailable ? 'full' : 'none',
        installationTime: fiberAvailable ? '3-5 business days' : undefined,
        monthlyFee: fiberAvailable ? (isWesternProvince ? 2500 : 2000) : undefined
      },
      adsl: {
        available: adslAvailable,
        technology: adslAvailable ? 'ADSL2+' : 'N/A',
        maxSpeed: adslAvailable ? (isUrbanArea ? '16 Mbps' : '8 Mbps') : 'N/A',
        lineQuality: adslAvailable ? (['excellent', 'good', 'fair'] as const)[Math.floor(Math.random() * 3)] : 'poor',
        distanceFromExchange: adslAvailable ? Math.floor(Math.random() * 2500) + 500 : undefined,
        monthlyFee: adslAvailable ? 1500 : undefined
      },
      mobile: {
        available: true,
        technologies: isUrbanArea ? ['4G', '5G'] : ['4G'],
        coverage: isUrbanArea ? 'Excellent' : 'Good',
        signalStrength: isUrbanArea ? 'excellent' : 'good'
      }
    };
  }

  // Generate default infrastructure for fallback
  private generateDefaultInfrastructure(): InfrastructureAvailability {
    return {
      fiber: {
        available: false,
        technology: 'N/A',
        maxSpeed: 'N/A',
        coverage: 'none'
      },
      adsl: {
        available: true,
        technology: 'ADSL2+',
        maxSpeed: '16 Mbps',
        lineQuality: 'good'
      },
      mobile: {
        available: true,
        technologies: ['4G'],
        coverage: 'Good'
      }
    };
  }

  // Determine qualification result
  private determineQualificationResult(
    infrastructure: InfrastructureAvailability,
    requestedServices: string[]
  ): 'qualified' | 'unqualified' | 'conditional' {
    const fiberRequested = requestedServices.some(s => s.toLowerCase().includes('fiber'));
    const adslRequested = requestedServices.some(s => s.toLowerCase().includes('adsl'));
    
    if (fiberRequested && infrastructure.fiber.available) {
      return 'qualified';
    }
    
    if (adslRequested && infrastructure.adsl.available) {
      return 'qualified';
    }
    
    if (infrastructure.fiber.available || infrastructure.adsl.available) {
      return 'conditional';
    }
    
    return 'unqualified';
  }

  // Generate alternative options
  private generateAlternativeOptions(infrastructure: InfrastructureAvailability): Array<{
    service: string;
    technology: string;
    speed: string;
    monthlyFee: number;
    availability: string;
  }> {
    const alternatives = [];
    
    if (infrastructure.fiber.available) {
      alternatives.push({
        service: 'Fiber Broadband',
        technology: infrastructure.fiber.technology,
        speed: infrastructure.fiber.maxSpeed,
        monthlyFee: infrastructure.fiber.monthlyFee || 2500,
        availability: 'Available'
      });
    }
    
    if (infrastructure.adsl.available) {
      alternatives.push({
        service: 'ADSL Broadband',
        technology: infrastructure.adsl.technology,
        speed: infrastructure.adsl.maxSpeed,
        monthlyFee: infrastructure.adsl.monthlyFee || 1500,
        availability: 'Available'
      });
    }
    
    if (infrastructure.mobile.available) {
      alternatives.push({
        service: 'Mobile Broadband',
        technology: infrastructure.mobile.technologies.join('/'),
        speed: '25 Mbps',
        monthlyFee: 1800,
        availability: 'Available'
      });
    }
    
    return alternatives;
  }

  // Calculate installation time
  private calculateInstallationTime(infrastructure: InfrastructureAvailability): string {
    if (infrastructure.fiber.available) {
      return infrastructure.fiber.installationTime || '3-5 business days';
    }
    if (infrastructure.adsl.available) {
      return '1-2 business days';
    }
    return 'Installation time varies';
  }

  // Calculate statistics from qualifications
  private calculateStats(qualifications: SLTQualificationResponse[]): QualificationStats {
    if (qualifications.length === 0) {
      return {
        totalQualifications: 0,
        fiberAvailable: 0,
        adslAvailable: 0,
        bothAvailable: 0,
        neitherAvailable: 0,
        successRate: 0,
        avgResponseTime: '0s'
      };
    }

    const fiberAvailable = qualifications.filter(q => q.infrastructure?.fiber?.available).length;
    const adslAvailable = qualifications.filter(q => q.infrastructure?.adsl?.available).length;
    const bothAvailable = qualifications.filter(q => 
      q.infrastructure?.fiber?.available && q.infrastructure?.adsl?.available
    ).length;
    const qualified = qualifications.filter(q => q.qualificationResult === 'qualified').length;
    
    return {
      totalQualifications: qualifications.length,
      fiberAvailable,
      adslAvailable,
      bothAvailable,
      neitherAvailable: qualifications.length - Math.max(fiberAvailable, adslAvailable),
      successRate: (qualified / qualifications.length) * 100,
      avgResponseTime: '2.8s'
    };
  }
}

// Export singleton instance
export const sltApiClient = new SLTAPIClient();

// Helper functions
export const getSriLankanDistricts = (): string[] => [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

export const getSriLankanProvinces = (): string[] => [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
];

export const validateSriLankanAddress = (address: string): boolean => {
  return address.length >= 10 && /[0-9]/.test(address);
};

export const validatePostalCode = (postalCode: string): boolean => {
  return /^\d{5}$/.test(postalCode);
};