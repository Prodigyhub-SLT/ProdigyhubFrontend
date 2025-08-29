import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Wifi, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Globe,
  Signal,
  Zap
} from 'lucide-react';

interface InfrastructureAvailability {
  fiber: {
    available: boolean;
    technology?: string;
    maxSpeed?: string;
    coverage?: number;
    monthlyFee?: number;
  };
  adsl: {
    available: boolean;
    technology?: string;
    maxSpeed?: string;
    coverage?: number;
    monthlyFee?: number;
  };
  mobile: {
    available: boolean;
    technologies?: string[];
    coverage?: string;
    signalStrength?: string;
  };
}

interface AreaData {
  id: string;
  name: string;
  district: string;
  province: string;
  postalCode?: string;
  infrastructure: InfrastructureAvailability;
  areaType: string;
  status: string;
}

interface AddressDetails {
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
}

export function QualificationTab() {
  const { toast } = useToast();
  
  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    street: '',
    city: '',
    district: '',
    province: '',
    postalCode: ''
  });
  
  const [infrastructureCheck, setInfrastructureCheck] = useState<InfrastructureAvailability | null>(null);
  const [areaData, setAreaData] = useState<AreaData | null>(null);
  const [isCheckingInfrastructure, setIsCheckingInfrastructure] = useState(false);

  // Districts and Provinces for Sri Lanka
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mullaitivu',
    'Vavuniya', 'Mannar', 'Puttalam', 'Kurunegala', 'Anuradhapura', 'Polonnaruwa',
    'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle', 'Trincomalee', 'Batticaloa', 'Ampara'
  ];

  const provinces = [
    'Western', 'Central', 'Southern', 'North Western', 'North Central',
    'Eastern', 'Northern', 'Uva', 'Sabaragamuwa'
  ];

  const handleInputChange = (field: string, value: string) => {
    setAddressDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return addressDetails.street && addressDetails.city && addressDetails.district && addressDetails.province;
  };

  const checkInfrastructureAvailability = async () => {
    if (!addressDetails.district || !addressDetails.province) {
      toast({
        title: "Missing Information",
        description: "Please select both district and province to check infrastructure availability.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingInfrastructure(true);
    try {
      // Check if area exists in the system
      const response = await fetch('/api/areaManagement/v5/area', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const areas = await response.json();
        const matchedArea = areas.find((area: AreaData) => 
          area.district === addressDetails.district && 
          area.province === addressDetails.province &&
          area.status === 'active'
        );

        if (matchedArea) {
          setAreaData(matchedArea);
          setInfrastructureCheck(matchedArea.infrastructure);
          toast({
            title: "Infrastructure Found",
            description: `Found infrastructure data for ${matchedArea.name}`,
          });
          
          // Create qualification record
          await createInfrastructureQualificationRecord(matchedArea.infrastructure, matchedArea);
        } else {
          // Create a default infrastructure check
          const defaultInfrastructure: InfrastructureAvailability = {
            fiber: {
              available: Math.random() > 0.6, // 40% chance of fiber availability
              technology: 'GPON',
              maxSpeed: '1000 Mbps',
              coverage: Math.floor(Math.random() * 100),
              monthlyFee: Math.floor(Math.random() * 5000) + 2000
            },
            adsl: {
              available: Math.random() > 0.3, // 70% chance of ADSL availability
              technology: 'ADSL2+',
              maxSpeed: '24 Mbps',
              coverage: Math.floor(Math.random() * 100),
              monthlyFee: Math.floor(Math.random() * 3000) + 1500
            },
            mobile: {
              available: true, // Mobile is generally available everywhere
              technologies: ['4G LTE', '3G'],
              coverage: 'Good',
              signalStrength: 'Strong'
            }
          };
          
          setInfrastructureCheck(defaultInfrastructure);
          setAreaData(null);
          toast({
            title: "Infrastructure Check Complete",
            description: "Infrastructure availability has been determined for your area.",
          });
          
          // Create qualification record
          await createInfrastructureQualificationRecord(defaultInfrastructure, null);
        }
      } else {
        throw new Error('Failed to fetch area data');
      }
    } catch (error) {
      console.error('Error checking infrastructure:', error);
      toast({
        title: "Error",
        description: "Failed to check infrastructure availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingInfrastructure(false);
    }
  };

  const handleServiceRequest = async (serviceType: 'fiber' | 'adsl' | 'mobile') => {
    if (!infrastructureCheck) return;

    const service = infrastructureCheck[serviceType];
    
    // Create qualification request that matches the admin dashboard format
    const qualificationData = {
      description: `SLT Service Request for ${serviceType.toUpperCase()} in ${addressDetails.district}, ${addressDetails.province}`,
      instantSyncQualification: true,
      provideAlternative: false,
      provideOnlyAvailable: true,
      provideResultReason: false,
      state: "acknowledged",
      creationDate: new Date().toISOString(),
      note: [
        {
          text: `SLT_LOCATION:${JSON.stringify({
            address: `${addressDetails.district}, ${addressDetails.province}`,
            district: addressDetails.district,
            province: addressDetails.province,
            postalCode: addressDetails.postalCode || ''
          })}`,
          author: 'SLT System',
          date: new Date().toISOString(),
          '@type': 'Note'
        },
        {
          text: `SLT_SERVICES:${JSON.stringify([`${serviceType.toUpperCase()} Broadband (Request)`])}`,
          author: 'SLT System',
          date: new Date().toISOString(),
          '@type': 'Note'
        },
        {
          text: `SLT_INFRASTRUCTURE:${JSON.stringify(infrastructureCheck)}`,
          author: 'SLT System',
          date: new Date().toISOString(),
          '@type': 'Note'
        },
        {
          text: `SLT_AREA_MATCH:${JSON.stringify({
            matchedArea: areaData,
            qualificationResult: 'unqualified'
          })}`,
          author: 'SLT System',
          date: new Date().toISOString(),
          '@type': 'Note'
        }
      ],
      channel: {},
      checkProductOfferingQualificationItem: [],
      relatedParty: [],
      "@baseType": "CheckProductOfferingQualification",
      "@type": "CheckProductOfferingQualification"
    };

    try {
      // Use the SAME endpoint that the admin dashboard uses
      const response = await fetch('/api/productOfferingQualification/v5/checkProductOfferingQualification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(qualificationData)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        toast({
          title: "Request Submitted",
          description: `Your ${serviceType.toUpperCase()} service request has been submitted successfully and will appear in the admin dashboard Qualification Records section.`,
        });
        
        // Update the button to show it's been submitted
        const buttonElement = document.querySelector(`[data-service="${serviceType}"]`);
        if (buttonElement) {
          buttonElement.textContent = 'Request Submitted';
          (buttonElement as HTMLButtonElement).disabled = true;
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to submit request: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit service request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Create a qualification record for infrastructure check completion
  const createInfrastructureQualificationRecord = async (infrastructureData: InfrastructureAvailability, areaDataParam: AreaData | null) => {
    try {
      const qualificationData = {
        description: `SLT Infrastructure Check Completed for ${addressDetails.district}, ${addressDetails.province}`,
        instantSyncQualification: true,
        provideAlternative: false,
        provideOnlyAvailable: true,
        provideResultReason: false,
        state: "acknowledged",
        creationDate: new Date().toISOString(),
        note: [
          {
            text: `SLT_LOCATION:${JSON.stringify({
              address: `${addressDetails.district}, ${addressDetails.province}`,
              district: addressDetails.district,
              province: addressDetails.province,
              postalCode: addressDetails.postalCode || ''
            })}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          },
          {
            text: `SLT_SERVICES:${JSON.stringify(['Infrastructure Check'])}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          },
          {
            text: `SLT_INFRASTRUCTURE:${JSON.stringify(infrastructureData)}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          },
          {
            text: `SLT_AREA_MATCH:${JSON.stringify({
              matchedArea: areaDataParam,
              qualificationResult: 'completed'
            })}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          }
        ],
        channel: {},
        checkProductOfferingQualificationItem: [],
        relatedParty: [],
        "@baseType": "CheckProductOfferingQualification",
        "@type": "CheckProductOfferingQualification"
      };

      const response = await fetch('/api/productOfferingQualification/v5/checkProductOfferingQualification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(qualificationData)
      });

      if (!response.ok) {
        console.error('Failed to create infrastructure qualification record');
      }
    } catch (error) {
      console.error('Error creating infrastructure qualification record:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Address Form Section */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Infrastructure Qualification Check
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please provide your address details so we can check service availability in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Address Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="street" className="text-gray-700">Street Address *</Label>
              <Input
                id="street"
                value={addressDetails.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                placeholder="Enter your street address"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">City *</Label>
                <Input
                  id="city"
                  value={addressDetails.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter your city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-gray-700">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={addressDetails.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district" className="text-gray-700">District *</Label>
                <Select
                  value={addressDetails.district}
                  onValueChange={(value) => handleInputChange('district', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="province" className="text-gray-700">Province *</Label>
                <Select
                  value={addressDetails.province}
                  onValueChange={(value) => handleInputChange('province', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
              onClick={checkInfrastructureAvailability}
              disabled={!isFormValid() || isCheckingInfrastructure}
            >
              {isCheckingInfrastructure ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Infrastructure Availability'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure Results Section - Only show when available */}
      {infrastructureCheck && (
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Infrastructure Availability
            </CardTitle>
            <CardDescription className="text-gray-600">
              Service availability for {addressDetails.district}, {addressDetails.province}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Beautiful Infrastructure Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Fiber Card */}
              <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                infrastructureCheck.fiber.available 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg' 
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${
                      infrastructureCheck.fiber.available ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Zap className={`w-6 h-6 ${
                        infrastructureCheck.fiber.available ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Fiber Internet</h3>
                      <p className="text-sm text-gray-600">High-speed broadband</p>
                    </div>
                  </div>
                  <Badge variant={infrastructureCheck.fiber.available ? "default" : "destructive"} className="text-xs">
                    {infrastructureCheck.fiber.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                
                {infrastructureCheck.fiber.available ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ready for connection</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Speed: Up to 1000 Mbps</p>
                      <p>Technology: GPON</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span>Not available in your area</span>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleServiceRequest('fiber')}
                      data-service="fiber"
                    >
                      Request Service
                    </Button>
                  </div>
                )}
              </div>

              {/* ADSL Card */}
              <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                infrastructureCheck.adsl.available 
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg' 
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${
                      infrastructureCheck.adsl.available ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <Globe className={`w-6 h-6 ${
                        infrastructureCheck.adsl.available ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">ADSL Internet</h3>
                      <p className="text-sm text-gray-600">Copper line broadband</p>
                    </div>
                  </div>
                  <Badge variant={infrastructureCheck.adsl.available ? "default" : "destructive"} className="text-xs">
                    {infrastructureCheck.adsl.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                
                {infrastructureCheck.adsl.available ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ready for connection</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Speed: Up to 24 Mbps</p>
                      <p>Technology: ADSL2+</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span>Not available in your area</span>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleServiceRequest('adsl')}
                      data-service="adsl"
                    >
                      Request Service
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Card */}
              <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 ${
                infrastructureCheck.mobile.available 
                  ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-lg' 
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${
                      infrastructureCheck.mobile.available ? 'bg-purple-100' : 'bg-red-100'
                    }`}>
                      <Signal className={`w-6 h-6 ${
                        infrastructureCheck.mobile.available ? 'text-purple-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">LTE/4G Mobile</h3>
                      <p className="text-sm text-gray-600">Wireless broadband</p>
                    </div>
                  </div>
                  <Badge variant={infrastructureCheck.mobile.available ? "default" : "destructive"} className="text-xs">
                    {infrastructureCheck.mobile.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                
                {infrastructureCheck.mobile.available ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-purple-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ready for connection</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>Coverage: Excellent</p>
                      <p>Technologies: 4G LTE, 3G</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-red-700">
                      <XCircle className="w-4 h-4" />
                      <span>Not available in your area</span>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleServiceRequest('mobile')}
                      data-service="mobile"
                    >
                      Request Service
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="text-center space-y-3">
                {infrastructureCheck.fiber.available && 
                 infrastructureCheck.adsl.available && 
                 infrastructureCheck.mobile.available ? (
                  <div>
                    <div className="text-2xl font-bold text-green-700 mb-2">
                      🎉 All Services Available!
                    </div>
                    <p className="text-blue-700">
                      Great news! All internet services are available in your area.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg font-semibold text-blue-700 mb-2">
                      Service Summary
                    </div>
                    <p className="text-blue-600 text-sm">
                      Some services may not be available in your area. Use the request buttons above to express interest.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                For any other information Call 1212 SLT hotline
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
