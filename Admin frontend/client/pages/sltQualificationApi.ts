// sltQualificationApi.ts - Enhanced API for SLT Product Qualification with MongoDB

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
    technology: string; // FTTH, FTTC, FTTN
    maxSpeed: string;
    coverage: 'full' | 'partial' | 'none';
    installationTime?: string;
    monthlyFee?: number;
  };
  adsl: {
    available: boolean;
    technology: string; // ADSL2+, ADSL
    maxSpeed: string;
    lineQuality: 'excellent' | 'good' | 'fair' | 'poor';
    distanceFromExchange?: number;
    monthlyFee?: number;
  };
  mobile: {
    available: boolean;
    technologies: string[]; // 4G, 5G
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
  '@type': 'SLTLocationQualification';
}

export interface SLTQualificationResponse {
  id: string;
  href: string;
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
  '@type': 'SLTLocationQualification';
}

export interface QualificationStats {
  totalQualifications: number;
  fiberAvailable: number;
  adslAvailable: number;
  bothAvailable: number;
  neitherAvailable: number;
  successRate: number;
  avgResponseTime: string;
  coverageByProvince: Record<string, {
    fiber: number;
    adsl: number;
    total: number;
  }>;
}

class SLTQualificationAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
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
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`SLT Qualification API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Check location availability for specific services
  async checkLocationQualification(request: SLTQualificationRequest): Promise<SLTQualificationResponse> {
    return await this.request<SLTQualificationResponse>('/productOfferingQualification/v5/slt/checkLocation', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get all qualification history
  async getQualificationHistory(params?: {
    province?: string;
    district?: string;
    serviceType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<SLTQualificationResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/productOfferingQualification/v5/slt/qualifications${queryString ? `?${queryString}` : ''}`;
    
    return await this.request<SLTQualificationResponse[]>(endpoint);
  }

  // Get qualification by ID
  async getQualificationById(id: string): Promise<SLTQualificationResponse> {
    return await this.request<SLTQualificationResponse>(`/productOfferingQualification/v5/slt/qualifications/${id}`);
  }

  // Get qualification statistics and analytics
  async getQualificationStats(): Promise<QualificationStats> {
    return await this.request<QualificationStats>('/productOfferingQualification/v5/slt/stats');
  }

  // Check bulk locations (for enterprise customers)
  async checkBulkLocations(locations: SLTLocationData[]): Promise<SLTQualificationResponse[]> {
    return await this.request<SLTQualificationResponse[]>('/productOfferingQualification/v5/slt/checkBulk', {
      method: 'POST',
      body: JSON.stringify({
        locations,
        '@type': 'BulkLocationQualification'
      }),
    });
  }

  // Get coverage map data for visualization
  async getCoverageMapData(province?: string): Promise<{
    fiberCoverage: Array<{
      district: string;
      coverage: number;
      technology: string;
    }>;
    adslCoverage: Array<{
      district: string;
      coverage: number;
      maxSpeed: string;
    }>;
  }> {
    const endpoint = province 
      ? `/productOfferingQualification/v5/slt/coverage?province=${province}`
      : '/productOfferingQualification/v5/slt/coverage';
    
    return await this.request(endpoint);
  }

  // Get available service packages for a location
  async getAvailablePackages(location: SLTLocationData): Promise<Array<{
    id: string;
    name: string;
    type: 'fiber' | 'adsl' | 'mobile';
    speed: string;
    monthlyFee: number;
    setupFee: number;
    features: string[];
    availability: 'available' | 'limited' | 'unavailable';
  }>> {
    return await this.request('/productOfferingQualification/v5/slt/packages', {
      method: 'POST',
      body: JSON.stringify({
        location,
        '@type': 'PackageAvailabilityCheck'
      }),
    });
  }

  // Update qualification status (for internal use)
  async updateQualificationStatus(id: string, updates: Partial<SLTQualificationResponse>): Promise<SLTQualificationResponse> {
    return await this.request<SLTQualificationResponse>(`/productOfferingQualification/v5/slt/qualifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Delete qualification record
  async deleteQualification(id: string): Promise<void> {
    await this.request<void>(`/productOfferingQualification/v5/slt/qualifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Get infrastructure details for a specific area
  async getInfrastructureDetails(district: string): Promise<{
    fiberNetworks: Array<{
      type: string;
      coverage: number;
      capacity: string;
      lastUpgrade: string;
    }>;
    adslExchanges: Array<{
      name: string;
      location: string;
      capacity: number;
      technology: string;
      coverageRadius: number;
    }>;
    mobileNetworks: Array<{
      operator: string;
      technologies: string[];
      coverage: number;
    }>;
  }> {
    return await this.request(`/productOfferingQualification/v5/slt/infrastructure/${district}`);
  }

  // Submit feedback on qualification result
  async submitQualificationFeedback(qualificationId: string, feedback: {
    rating: number;
    comment?: string;
    actualInstallationTime?: string;
    serviceQuality?: string;
  }): Promise<void> {
    await this.request(`/productOfferingQualification/v5/slt/qualifications/${qualificationId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        ...feedback,
        '@type': 'QualificationFeedback'
      }),
    });
  }
}

// Create singleton instance
export const sltQualificationApi = new SLTQualificationAPI();

// Helper functions for data processing
export const formatSpeed = (speed: string): string => {
  if (speed.includes('Mbps')) return speed;
  if (speed.includes('Gbps')) return speed;
  return `${speed} Mbps`;
};

export const calculateInstallationFee = (serviceType: string, location: SLTLocationData): number => {
  // Mock calculation based on service type and location
  const baseFees = {
    'Fiber Broadband': 15000,
    'ADSL Broadband': 5000,
    'PEO TV': 8000,
    'Enterprise Solution': 25000
  };
  
  const locationMultiplier = location.province === 'Western' ? 1.0 : 1.2;
  return (baseFees[serviceType as keyof typeof baseFees] || 5000) * locationMultiplier;
};

export const getEstimatedInstallationTime = (
  serviceType: string, 
  infrastructure: InfrastructureAvailability
): string => {
  if (serviceType.includes('Fiber')) {
    return infrastructure.fiber.available ? '3-5 business days' : 'Infrastructure development required (2-4 weeks)';
  }
  if (serviceType.includes('ADSL')) {
    return infrastructure.adsl.available ? '1-2 business days' : 'Line installation required (5-7 business days)';
  }
  return '1-3 business days';
};

export const generateQualificationReport = (qualification: SLTQualificationResponse): {
  summary: string;
  recommendations: string[];
  alternatives: string[];
} => {
  const { infrastructure, qualificationResult, requestedServices } = qualification;
  
  let summary = '';
  const recommendations: string[] = [];
  const alternatives: string[] = [];

  if (qualificationResult === 'qualified') {
    summary = `Location is fully qualified for all requested services (${requestedServices.join(', ')})`;
    if (infrastructure.fiber.available) {
      recommendations.push('Fiber broadband recommended for best performance');
    }
    if (infrastructure.adsl.available) {
      recommendations.push('ADSL available as backup option');
    }
  } else if (qualificationResult === 'conditional') {
    summary = 'Location has limited service availability';
    if (!infrastructure.fiber.available && infrastructure.adsl.available) {
      alternatives.push('ADSL broadband available as alternative');
    }
    if (infrastructure.mobile.available) {
      alternatives.push('Mobile broadband available');
    }
  } else {
    summary = 'Location currently not serviceable for requested services';
    recommendations.push('Contact SLT for infrastructure development timeline');
  }

  return { summary, recommendations, alternatives };
};

// Export validation helpers
export const validateSriLankanAddress = (address: string): boolean => {
  // Basic validation for Sri Lankan addresses
  return address.length >= 10 && /[0-9]/.test(address);
};

export const validatePostalCode = (postalCode: string): boolean => {
  // Sri Lankan postal codes are 5 digits
  return /^\d{5}$/.test(postalCode);
};

export const getSriLankanDistricts = (): string[] => {
  return [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];
};

export const getSriLankanProvinces = (): string[] => {
  return [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern',
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ];
};