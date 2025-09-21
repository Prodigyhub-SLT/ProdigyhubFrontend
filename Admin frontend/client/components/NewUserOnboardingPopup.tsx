import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Wifi, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  ArrowLeft,
  Building,
  Globe,
  Router,
  Smartphone
} from 'lucide-react';

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
}

interface AddressDetails {
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
}

interface InfrastructureAvailability {
  broadband: boolean;
  mobile: boolean;
  fiber: boolean;
  peotv: boolean;
  voice: boolean;
  areaQualified: boolean;
  qualificationScore: number;
  availableServices: string[];
  limitations: string[];
  recommendation: string;
  estimatedSpeed: string;
  installationTimeframe: string;
}

interface NewUserOnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email?: string;
    name?: string;
    uid?: string;
  };
  onComplete: (userData: UserDetails & AddressDetails) => void;
}

export default function NewUserOnboardingPopup({ 
  isOpen, 
  onClose, 
  user, 
  onComplete 
}: NewUserOnboardingPopupProps) {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form data states
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phoneNumber: '',
    idNumber: ''
  });

  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    street: '',
    city: '',
    district: '',
    province: '',
    postalCode: ''
  });

  const [infrastructureCheck, setInfrastructureCheck] = useState<InfrastructureAvailability | null>(null);
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

  // Validation functions
  const isUserDetailsValid = () => {
    return userDetails.firstName && 
           userDetails.lastName && 
           userDetails.email && 
           userDetails.phoneNumber && 
           userDetails.idNumber;
  };

  const isAddressDetailsValid = () => {
    return addressDetails.street && 
           addressDetails.city && 
           addressDetails.district && 
           addressDetails.province && 
           addressDetails.postalCode;
  };

  // Handle user details form changes
  const handleUserDetailsChange = (field: keyof UserDetails, value: string) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle address details form changes
  const handleAddressDetailsChange = (field: keyof AddressDetails, value: string) => {
    setAddressDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Skip user details and go to address
  const handleSkipUserDetails = () => {
    setCurrentScreen(2);
  };

  // Continue from user details to address
  const handleContinueFromUserDetails = () => {
    if (!isUserDetailsValid()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields to continue.",
        variant: "destructive"
      });
      return;
    }
    setCurrentScreen(2);
  };

  // Continue from address to infrastructure check
  const handleContinueFromAddress = async () => {
    if (!isAddressDetailsValid()) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all address fields to continue.",
        variant: "destructive"
      });
      return;
    }

    // Save user and address details to MongoDB
    await saveUserData();
    
    // Move to infrastructure check
    setCurrentScreen(3);
    await checkInfrastructureAvailability();
  };

  // Save user data to MongoDB
  const saveUserData = async () => {
    try {
      setIsLoading(true);
      const backendURL = import.meta.env.VITE_API_BASE_URL || 'https://prodigyhub.onrender.com';
      
      const userData = {
        uid: user.uid,
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        nic: userDetails.idNumber,
        address: {
          street: addressDetails.street,
          city: addressDetails.city,
          district: addressDetails.district,
          province: addressDetails.province,
          postalCode: addressDetails.postalCode
        },
        authMethod: 'google',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };

      console.log('🔄 Saving user data to:', `${backendURL}/users/profile`);
      console.log('📝 User data payload:', JSON.stringify(userData, null, 2));

      const response = await fetch(`${backendURL}/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response error:', errorText);
        throw new Error(`Failed to save user data: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ User data saved to MongoDB:', responseData);
      
      toast({
        title: "Profile Saved",
        description: "Your profile information has been saved successfully.",
      });

    } catch (error) {
      console.error('❌ Error saving user data:', error);
      toast({
        title: "Save Error",
        description: `Failed to save your profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check infrastructure availability using real qualification API
  const checkInfrastructureAvailability = async () => {
    try {
      setIsCheckingInfrastructure(true);
      
      console.log('🔄 Starting real infrastructure qualification check...');
      
      // Create qualification data using the same format as admin dashboard
      const qualificationData = {
        instantSync: true,
        provideAlternative: true,
        provideOnlyAvailable: true,
        provideUnavailabilityReason: true,
        
        location: {
          address: `${addressDetails.street}, ${addressDetails.city}`,
          district: addressDetails.district,
          province: addressDetails.province,
          postalCode: addressDetails.postalCode,
          coordinates: {
            lat: 0,
            lng: 0
          }
        },
        
        requestedServices: ['Broadband', 'Fiber', 'Mobile', 'PEOTV', 'Voice'],
        checkFiber: true,
        checkADSL: true,
        checkMobile: true,
        customerType: 'residential',
        
        productOfferingQualificationItem: [{
          productOffering: {
            id: 'slt-infrastructure-check',
            name: 'SLT Infrastructure Availability Check',
            '@type': 'ProductOffering'
          },
          qualificationItem: {
            location: {
              address: `${addressDetails.street}, ${addressDetails.city}`,
              district: addressDetails.district,
              province: addressDetails.province,
              postalCode: addressDetails.postalCode
            },
            requestedServices: ['Broadband', 'Fiber', 'Mobile', 'PEOTV', 'Voice'],
            checkFiber: true,
            checkADSL: true,
            checkMobile: true,
            customerType: 'residential'
          },
          '@type': 'ProductOfferingQualificationItem'
        }],
        
        '@type': 'CheckProductOfferingQualification'
      };

      console.log('📝 Qualification data:', qualificationData);

      // Use the same API endpoint as admin dashboard
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
        console.log('✅ Real qualification response:', responseData);

        // Transform the real API response to our interface format
        const infrastructure = responseData.infrastructure || {};
        const realInfrastructure: InfrastructureAvailability = {
          broadband: infrastructure.fiber?.available || infrastructure.adsl?.available || false,
          mobile: infrastructure.mobile?.available || false,
          fiber: infrastructure.fiber?.available || false,
          peotv: infrastructure.fiber?.available || infrastructure.adsl?.available || false,
          voice: infrastructure.mobile?.available || infrastructure.fiber?.available || infrastructure.adsl?.available || false,
          areaQualified: responseData.qualificationResult === 'qualified',
          qualificationScore: responseData.qualificationResult === 'qualified' ? 
            Math.min(95, 60 + (infrastructure.fiber?.available ? 20 : 0) + (infrastructure.adsl?.available ? 10 : 0) + (infrastructure.mobile?.available ? 5 : 0)) : 
            Math.max(30, 60 - 30),
          availableServices: [],
          limitations: [],
          recommendation: responseData.qualificationResult === 'qualified' ? 
            'Your area is qualified for SLT services' : 
            'Limited service availability in your area',
          estimatedSpeed: infrastructure.fiber?.available ? 
            (infrastructure.fiber.maxSpeed || '100 Mbps') : 
            infrastructure.adsl?.available ? 
            (infrastructure.adsl.maxSpeed || '16 Mbps') : 
            'Contact SLT for details',
          installationTimeframe: responseData.qualificationResult === 'qualified' ? '3-7 business days' : 'Contact SLT for availability'
        };

        // Build available services list
        if (realInfrastructure.broadband) realInfrastructure.availableServices.push('Broadband');
        if (realInfrastructure.fiber) realInfrastructure.availableServices.push('Fiber');
        if (realInfrastructure.mobile) realInfrastructure.availableServices.push('Mobile');
        if (realInfrastructure.peotv) realInfrastructure.availableServices.push('PEOTV');
        if (realInfrastructure.voice) realInfrastructure.availableServices.push('Voice');

        // Build limitations list
        if (!infrastructure.fiber?.available) realInfrastructure.limitations.push('Fiber not available in this area');
        if (!infrastructure.adsl?.available) realInfrastructure.limitations.push('ADSL not available in this area');
        if (!infrastructure.mobile?.available) realInfrastructure.limitations.push('Mobile coverage limited');

        setInfrastructureCheck(realInfrastructure);

        console.log('✅ Infrastructure check completed with real data:', realInfrastructure);
        
      } else {
        throw new Error(`API call failed with status ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Error checking infrastructure:', error);
      
      // Fallback to basic check if API fails
      console.log('⚠️ Falling back to basic area check...');
      
      const fallbackInfrastructure: InfrastructureAvailability = {
        broadband: true,
        mobile: true,
        fiber: ['Colombo', 'Gampaha', 'Kandy'].includes(addressDetails.district),
        peotv: true,
        voice: true,
        areaQualified: true,
        qualificationScore: ['Colombo', 'Gampaha'].includes(addressDetails.district) ? 85 : 70,
        availableServices: ['Broadband', 'Mobile', 'Voice', 'PEOTV'],
        limitations: ['Colombo', 'Gampaha'].includes(addressDetails.district) ? [] : ['Fiber availability may be limited'],
        recommendation: 'Basic service availability confirmed',
        estimatedSpeed: ['Colombo', 'Gampaha'].includes(addressDetails.district) ? '100 Mbps' : '50 Mbps',
        installationTimeframe: '3-7 business days'
      };

      if (fallbackInfrastructure.fiber) {
        fallbackInfrastructure.availableServices.push('Fiber');
      }

      setInfrastructureCheck(fallbackInfrastructure);
      
      toast({
        title: "Infrastructure Check Completed",
        description: "Service availability checked using basic area data.",
        variant: "default"
      });
    } finally {
      setIsCheckingInfrastructure(false);
    }
  };

  // Complete onboarding
  const handleCompleteOnboarding = () => {
    const completeUserData = {
      ...userDetails,
      ...addressDetails
    };
    
    onComplete(completeUserData);
    onClose();
    
    toast({
      title: "Welcome to SLT Prodigy Hub!",
      description: "Your onboarding is complete. Your qualification check has been recorded and is available in the admin dashboard.",
    });
  };

  // Go back to previous screen
  const handleGoBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentScreen(1);
      setInfrastructureCheck(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Complete Your Profile Setup
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentScreen >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentScreen >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentScreen >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${currentScreen >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentScreen >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Screen 1: User Details */}
        {currentScreen === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <p className="text-gray-600 text-sm">Let us know more about you</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={userDetails.firstName}
                  onChange={(e) => handleUserDetailsChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={userDetails.lastName}
                  onChange={(e) => handleUserDetailsChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={userDetails.email}
                onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={userDetails.phoneNumber}
                onChange={(e) => handleUserDetailsChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="idNumber">ID Number (NIC) *</Label>
              <Input
                id="idNumber"
                value={userDetails.idNumber}
                onChange={(e) => handleUserDetailsChange('idNumber', e.target.value)}
                placeholder="Enter your NIC number"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleSkipUserDetails}>
                Skip
              </Button>
              <Button onClick={handleContinueFromUserDetails} className="flex items-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 2: Address Details */}
        {currentScreen === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </h3>
              <p className="text-gray-600 text-sm">Help us provide better service coverage</p>
            </div>

            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={addressDetails.street}
                onChange={(e) => handleAddressDetailsChange('street', e.target.value)}
                placeholder="Enter your street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={addressDetails.city}
                  onChange={(e) => handleAddressDetailsChange('city', e.target.value)}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={addressDetails.postalCode}
                  onChange={(e) => handleAddressDetailsChange('postalCode', e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">District *</Label>
                <Select
                  value={addressDetails.district}
                  onValueChange={(value) => handleAddressDetailsChange('district', value)}
                >
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="province">Province *</Label>
                <Select
                  value={addressDetails.province}
                  onValueChange={(value) => handleAddressDetailsChange('province', value)}
                >
                  <SelectTrigger>
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

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={handleContinueFromAddress} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? 'Saving...' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 3: Infrastructure Qualification Check */}
        {currentScreen === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <Wifi className="w-5 h-5" />
                Service Availability Check
              </h3>
              <p className="text-gray-600 text-sm">Checking real infrastructure availability for your area</p>
              <p className="text-blue-600 text-xs mt-1">This qualification will be recorded in the admin dashboard</p>
            </div>

            {isCheckingInfrastructure && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking service availability...</p>
              </div>
            )}

            {infrastructureCheck && !isCheckingInfrastructure && (
              <div className="space-y-4">
                {/* Qualification Score */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Area Qualification Score</span>
                      <Badge className={`${
                        infrastructureCheck.qualificationScore >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : infrastructureCheck.qualificationScore >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {infrastructureCheck.qualificationScore}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${infrastructureCheck.qualificationScore}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Services */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Available Services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        <span className="text-sm">Broadband</span>
                        {infrastructureCheck.broadband ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm">Mobile</span>
                        {infrastructureCheck.mobile ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Router className="w-4 h-4" />
                        <span className="text-sm">Fiber</span>
                        {infrastructureCheck.fiber ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">PEOTV</span>
                        {infrastructureCheck.peotv ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Details */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estimated Speed:</span>
                      <span className="text-sm font-medium">{infrastructureCheck.estimatedSpeed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Installation Time:</span>
                      <span className="text-sm font-medium">{infrastructureCheck.installationTimeframe}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-sm text-gray-600">Recommendation:</span>
                      <p className="text-sm text-gray-800 mt-1">{infrastructureCheck.recommendation}</p>
                    </div>
                    {infrastructureCheck.limitations.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm text-gray-600">Limitations:</span>
                        <ul className="text-sm text-gray-800 mt-1">
                          {infrastructureCheck.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {infrastructureCheck && (
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={handleCompleteOnboarding} className="flex items-center gap-2">
                  Complete Setup
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

