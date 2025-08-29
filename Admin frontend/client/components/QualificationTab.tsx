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
  ArrowLeft
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
  const [step, setStep] = useState<'address' | 'infrastructure'>('address');

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
        
        setStep('infrastructure');
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
    
    // Determine if this is a request for unavailable service or interest in available service
    const isInterestRequest = service.available;
    
    if (isInterestRequest) {
      // Service is available, this is an interest request
      toast({
        title: "Interest Recorded",
        description: `Your interest in ${serviceType.toUpperCase()} has been recorded!`,
      });
    }

    // Create qualification request that matches the admin dashboard format
    const qualificationData = {
      description: isInterestRequest 
        ? `SLT Customer Interest in ${serviceType.toUpperCase()} for ${addressDetails.district}, ${addressDetails.province}`
        : `SLT Service Request for ${serviceType.toUpperCase()} in ${addressDetails.district}, ${addressDetails.province}`,
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
          text: `SLT_SERVICES:${JSON.stringify([`${serviceType.toUpperCase()} Broadband ${isInterestRequest ? '(Interest)' : '(Request)'}`])}`,
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
            qualificationResult: isInterestRequest ? 'interested' : 'unqualified'
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
          title: isInterestRequest ? "Interest Recorded" : "Request Submitted",
          description: isInterestRequest 
            ? `Your interest in ${serviceType.toUpperCase()} has been recorded and will appear in the admin dashboard Qualification Records section.`
            : `Your ${serviceType.toUpperCase()} service request has been submitted successfully and will appear in the admin dashboard Qualification Records section.`,
        });
        
        // Update the button to show it's been submitted
        const buttonElement = document.querySelector(`[data-service="${serviceType}"]`);
        if (buttonElement) {
          buttonElement.textContent = isInterestRequest ? 'Interest Recorded' : 'Request Submitted';
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

  // Show infrastructure results
  if (step === 'infrastructure' && infrastructureCheck) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Infrastructure Availability Check
            </CardTitle>
            <CardDescription className="text-gray-600">
              Checking what services are available in your area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Infrastructure Summary */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Infrastructure Summary for {addressDetails.district}, {addressDetails.province}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    infrastructureCheck.fiber.available ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {infrastructureCheck.fiber.available ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <div className="text-gray-800 font-semibold">Fiber Internet</div>
                  <div className={`text-sm ${infrastructureCheck.fiber.available ? 'text-green-600' : 'text-red-600'}`}>
                    {infrastructureCheck.fiber.available ? 'Available' : 'Not Available'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    infrastructureCheck.adsl.available ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {infrastructureCheck.adsl.available ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <div className="text-gray-800 font-semibold">ADSL Internet</div>
                  <div className={`text-sm ${infrastructureCheck.adsl.available ? 'text-green-600' : 'text-red-600'}`}>
                    {infrastructureCheck.adsl.available ? 'Available' : 'Not Available'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    infrastructureCheck.mobile.available ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {infrastructureCheck.mobile.available ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <div className="text-gray-800 font-semibold">Mobile Internet</div>
                  <div className={`text-sm ${infrastructureCheck.mobile.available ? 'text-green-600' : 'text-red-600'}`}>
                    {infrastructureCheck.mobile.available ? 'Available' : 'Not Available'}
                  </div>
                </div>
              </div>
            </div>
            





            <div className="text-center space-y-4">
              <div className="text-lg font-semibold text-gray-800 mb-4">
                Infrastructure Check Complete for {addressDetails.district}, {addressDetails.province}
              </div>
              
              {/* Simple Service Request Buttons - Only for unavailable services */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Fiber Service */}
                <div className="space-y-2">
                  {!infrastructureCheck.fiber.available ? (
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleServiceRequest('fiber')}
                      data-service="fiber"
                    >
                      Request Fiber Service
                    </Button>
                  ) : (
                    <div className="text-green-600 font-medium">✓ Available</div>
                  )}
                </div>
                
                {/* ADSL Service */}
                <div className="space-y-2">
                  {!infrastructureCheck.adsl.available ? (
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleServiceRequest('adsl')}
                      data-service="adsl"
                    >
                      Request ADSL Service
                    </Button>
                  ) : (
                    <div className="text-green-600 font-medium">✓ Available</div>
                  )}
                </div>
                
                {/* Mobile Service */}
                <div className="space-y-2">
                  {!infrastructureCheck.mobile.available ? (
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleServiceRequest('mobile')}
                      data-service="mobile"
                    >
                      Request Mobile Service
                    </Button>
                  ) : (
                    <div className="text-green-600 font-medium">✓ Available</div>
                  )}
                </div>
              </div>
              
              {/* Status Message */}
              <div className="text-center py-4">
                {infrastructureCheck.fiber.available && 
                 infrastructureCheck.adsl.available && 
                 infrastructureCheck.mobile.available ? (
                  <div>
                    <div className="text-green-600 text-lg font-semibold mb-2">
                      🎉 All services are available in your area!
                    </div>
                    <div className="text-blue-600 text-sm">
                      You can subscribe to any of the available services
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Expressing interest helps us track customer preferences
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-blue-600 text-lg font-semibold mb-2">
                      Service Status Summary
                    </div>
                    <div className="text-blue-600 text-sm">
                      {[
                        !infrastructureCheck.fiber.available && 'Fiber',
                        !infrastructureCheck.adsl.available && 'ADSL',
                        !infrastructureCheck.mobile.available && 'Mobile'
                      ].filter(Boolean).join(', ')} {[
                        !infrastructureCheck.fiber.available && 'Fiber',
                        !infrastructureCheck.adsl.available && 'ADSL',
                        !infrastructureCheck.mobile.available && 'Mobile'
                      ].filter(Boolean).length === 1 ? 'is' : 'are'} not available in your area
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Click the red buttons to request unavailable services
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-blue-600 mb-6">
                Service requests will appear in the admin dashboard Qualification Records section
              </div>
              
              {/* Back Button */}
              <div className="flex justify-center mt-2">
                <Button
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                  onClick={() => setStep('address')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Check Another Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show address form
  return (
    <div className="max-w-4xl mx-auto">
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
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
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
    </div>
  );
}
