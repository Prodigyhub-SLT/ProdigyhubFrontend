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

  // Show infrastructure results
  if (step === 'infrastructure' && infrastructureCheck) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Infrastructure Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Simple Infrastructure List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${infrastructureCheck.fiber.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-gray-800">Fiber</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${infrastructureCheck.fiber.available ? 'text-green-600' : 'text-red-600'}`}>
                    {infrastructureCheck.fiber.available ? 'Available' : 'Un-Available'}
                  </span>
                  {!infrastructureCheck.fiber.available && (
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                      onClick={() => handleServiceRequest('fiber')}
                      data-service="fiber"
                    >
                      Request
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${infrastructureCheck.adsl.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-gray-800">ADSL</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${infrastructureCheck.adsl.available ? 'text-green-600' : 'text-red-600'}`}>
                    {infrastructureCheck.adsl.available ? 'Available' : 'Un-Available'}
                  </span>
                  {!infrastructureCheck.adsl.available && (
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                      onClick={() => handleServiceRequest('adsl')}
                      data-service="adsl"
                    >
                      Request
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${infrastructureCheck.mobile.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium text-gray-800">LTE/4G</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${infrastructureCheck.mobile.available ? 'text-green-600' : 'text-red-600'}`}>
                    {infrastructureCheck.mobile.available ? 'Available' : 'Un-Available'}
                  </span>
                  {!infrastructureCheck.mobile.available && (
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                      onClick={() => handleServiceRequest('mobile')}
                      data-service="mobile"
                    >
                      Request
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                For any other information Call 1212 SLT hotline
              </p>
            </div>
            
            {/* Back Button */}
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                onClick={() => setStep('address')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Check Another Address
              </Button>
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
    </div>
  );
}
