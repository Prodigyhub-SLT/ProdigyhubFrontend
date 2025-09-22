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
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    nic?: string;
    authMethod?: string;
    photoURL?: string;
    address?: {
      street?: string;
      city?: string;
      district?: string;
      province?: string;
      postalCode?: string;
    };
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

  // Debug logging for user data
  console.log('🔍 NewUserOnboardingPopup - User data:', {
    photoURL: user?.photoURL,
    email: user?.email,
    name: user?.name,
    uid: user?.uid
  });

  // Form data states - pre-populate with existing data
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    idNumber: user?.nic || ''
  });

  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    district: user?.address?.district || '',
    province: user?.address?.province || '',
    postalCode: user?.address?.postalCode || ''
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

    try {
      // Save user and address details to MongoDB
      await saveUserData();
      
      // Move to infrastructure check
      setCurrentScreen(3);
      
      // Start infrastructure check
      await checkInfrastructureAvailability();
    } catch (error) {
      console.error('❌ Error in handleContinueFromAddress:', error);
      
      // Even if saving fails, allow user to continue to infrastructure check
      setCurrentScreen(3);
      
      toast({
        title: "Proceeding with Infrastructure Check",
        description: "Data save may have failed, but continuing with service availability check.",
        variant: "default"
      });
      
      // Still run infrastructure check
      try {
        await checkInfrastructureAvailability();
      } catch (checkError) {
        console.error('❌ Infrastructure check also failed:', checkError);
      }
    }
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
        authMethod: user.authMethod || 'email', // Use actual auth method
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };

      console.log('👤 User info for save:', {
        uid: user.uid,
        email: user.email,
        authMethod: user.authMethod,
        hasUid: !!user.uid
      });

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
      // Don't throw error - allow infrastructure check to continue even if save fails
      console.warn('⚠️ Continuing despite save failure - user can complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  // Check infrastructure availability - EXACT COPY from QualificationTab
  const checkInfrastructureAvailability = async () => {
    console.log('🚀 checkInfrastructureAvailability CALLED!');
    console.log('📍 Address details:', addressDetails);
    
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
        const matchedArea = areas.find((area: any) => 
          area.district === addressDetails.district && 
          area.province === addressDetails.province &&
          area.status === 'active'
        );

        if (matchedArea) {
          // Transform QualificationTab infrastructure format to our popup format
          const qualTabInfra = matchedArea.infrastructure;
          const transformedInfrastructure: InfrastructureAvailability = {
            broadband: qualTabInfra?.fiber?.available || qualTabInfra?.adsl?.available || false,
            mobile: qualTabInfra?.mobile?.available || false,
            fiber: qualTabInfra?.fiber?.available || false,
            peotv: qualTabInfra?.fiber?.available || qualTabInfra?.adsl?.available || false,
            voice: qualTabInfra?.mobile?.available || qualTabInfra?.fiber?.available || qualTabInfra?.adsl?.available || false,
            areaQualified: true,
            qualificationScore: 85,
            availableServices: [],
            limitations: [],
            recommendation: `Found infrastructure data for ${matchedArea.name}. Infrastructure check completed.`,
            estimatedSpeed: qualTabInfra?.fiber?.available ? 
              (qualTabInfra.fiber.maxSpeed || '100 Mbps') : 
              qualTabInfra?.adsl?.available ? 
              (qualTabInfra.adsl.maxSpeed || '16 Mbps') : 
              '10 Mbps',
            installationTimeframe: '3-7 business days'
          };

          // Build available services list
          if (transformedInfrastructure.broadband) transformedInfrastructure.availableServices.push('Broadband');
          if (transformedInfrastructure.fiber) transformedInfrastructure.availableServices.push('Fiber');
          if (transformedInfrastructure.mobile) transformedInfrastructure.availableServices.push('Mobile');
          if (transformedInfrastructure.peotv) transformedInfrastructure.availableServices.push('PEOTV');
          if (transformedInfrastructure.voice) transformedInfrastructure.availableServices.push('Voice');

          // Build limitations list
          if (!qualTabInfra?.fiber?.available) transformedInfrastructure.limitations.push('Fiber not available in this area');
          if (!qualTabInfra?.adsl?.available) transformedInfrastructure.limitations.push('ADSL not available in this area');
          if (!qualTabInfra?.mobile?.available) transformedInfrastructure.limitations.push('Mobile coverage limited');

          setInfrastructureCheck(transformedInfrastructure);
          toast({
            title: "Infrastructure Found",
            description: `Found infrastructure data for ${matchedArea.name}. Infrastructure check completed and saved to Qualification Records.`,
          });
          
          // Create qualification record - EXACT same as QualificationTab
          await createInfrastructureQualificationRecord(matchedArea.infrastructure, matchedArea);
          
        } else {
          // If area not found in system, all services should be unavailable - EXACT same as QualificationTab
          const defaultInfrastructure: InfrastructureAvailability = {
            broadband: false,
            mobile: false,
            fiber: false,
            peotv: false,
            voice: false,
            areaQualified: false,
            qualificationScore: 30,
            availableServices: [],
            limitations: ['Area not currently covered by SLT services'],
            recommendation: 'This area is not currently in our system. All services are marked as unavailable.',
            estimatedSpeed: 'Contact SLT for details',
            installationTimeframe: 'Contact SLT for availability'
          };
          
          setInfrastructureCheck(defaultInfrastructure);
          toast({
            title: "Area Not Found",
            description: "This area is not currently in our system. All services are marked as unavailable.",
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

  // Create qualification record - EXACT COPY from QualificationTab
  const createInfrastructureQualificationRecord = async (infrastructureData: any, areaDataParam: any) => {
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
              address: `${addressDetails.street}, ${addressDetails.city}, ${addressDetails.district}, ${addressDetails.province}`,
              street: addressDetails.street,
              city: addressDetails.city,
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
            text: `SLT_AREA_MATCH:${JSON.stringify({ matchedArea: areaDataParam, qualificationResult: areaDataParam ? 'qualified' : 'unqualified' })}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          },
          {
            text: `SLT_USER_EMAIL:${user.email}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          }
        ],
        channel: {},
        checkProductOfferingQualificationItem: [],
        relatedParty: [{
          id: user.uid || 'onboarding-user',
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: user.email,
          role: 'Customer',
          '@type': 'RelatedPartyRefOrPartyRoleRef'
        }],
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
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Qualification record created:', responseData.id);
      } else {
        console.warn('⚠️ Failed to create qualification record:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Error creating qualification record:', error);
      // Don't fail the onboarding if qualification record creation fails
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

  // Determine starting screen and reset form when popup opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInfrastructureCheck(null);
      return;
    }

    // Always start on screen 1 - users must manually progress through screens
    setCurrentScreen(1);
    console.log('🔄 Starting onboarding at user details screen');
  }, [isOpen]);

  // Auto-trigger infrastructure check when reaching screen 3
  useEffect(() => {
    if (currentScreen === 3 && !infrastructureCheck && !isCheckingInfrastructure) {
      console.log('🎯 Auto-triggering infrastructure check for screen 3');
      checkInfrastructureAvailability();
    }
  }, [currentScreen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto bg-white border-0 shadow-2xl">
        {/* Professional Header */}
        <DialogHeader className="relative">
          <div className="relative bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg p-6 border-b border-gray-200">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('❌ Image failed to load:', user.photoURL);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log('✅ Image loaded successfully:', user.photoURL)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {userDetails.firstName} {userDetails.lastName}
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">Complete Your Profile</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                {currentScreen === 1 
                  ? "Let us know more about you and you can complete it later in profile"
                  : currentScreen === 2 
                  ? "Help us provide better service coverage and You can complete it later in profile"
                  : "You can complete it later"
                }
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Clean Progress Indicator */}
        <div className="flex items-center justify-center mb-6 px-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentScreen >= 1 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-400 border border-gray-300'
            }`}>
              <span className="text-sm font-semibold">1</span>
            </div>
            <div className={`w-12 h-0.5 ${
              currentScreen >= 2 
                ? 'bg-blue-600' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentScreen >= 2 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-400 border border-gray-300'
            }`}>
              <span className="text-sm font-semibold">2</span>
            </div>
            <div className={`w-12 h-0.5 ${
              currentScreen >= 3 
                ? 'bg-blue-600' 
                : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentScreen >= 3 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-400 border border-gray-300'
            }`}>
              <span className="text-sm font-semibold">3</span>
            </div>
          </div>
        </div>

        {/* Screen 1: User Details */}
        {currentScreen === 1 && (
          <div className="px-6 pb-6 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 mb-3">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
                  <Input
                    id="firstName"
                    value={userDetails.firstName}
                    onChange={(e) => handleUserDetailsChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={userDetails.lastName}
                    onChange={(e) => handleUserDetailsChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                  placeholder="Enter your email"
                  disabled
                  className="h-10 bg-gray-50"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={userDetails.phoneNumber}
                  onChange={(e) => handleUserDetailsChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                  className="h-10"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="idNumber" className="text-sm font-medium text-gray-700">ID Number (NIC) *</Label>
                <Input
                  id="idNumber"
                  value={userDetails.idNumber}
                  onChange={(e) => handleUserDetailsChange('idNumber', e.target.value)}
                  placeholder="Enter your NIC number"
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={handleSkipUserDetails}
                className="px-6 py-2"
              >
                Skip
              </Button>
              <Button 
                onClick={handleContinueFromUserDetails} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 2: Address Details */}
        {currentScreen === 2 && (
          <div className="px-6 pb-6 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 mb-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Address Information</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street Address *</Label>
                <Input
                  id="street"
                  value={addressDetails.street}
                  onChange={(e) => handleAddressDetailsChange('street', e.target.value)}
                  placeholder="Enter your street address"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                  <Input
                    id="city"
                    value={addressDetails.city}
                    onChange={(e) => handleAddressDetailsChange('city', e.target.value)}
                    placeholder="Enter your city"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={addressDetails.postalCode}
                    onChange={(e) => handleAddressDetailsChange('postalCode', e.target.value)}
                    placeholder="Enter postal code"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="district" className="text-sm font-medium text-gray-700">District *</Label>
                  <Select
                    value={addressDetails.district}
                    onValueChange={(value) => handleAddressDetailsChange('district', value)}
                  >
                    <SelectTrigger className="h-10">
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
                <div className="space-y-1">
                  <Label htmlFor="province" className="text-sm font-medium text-gray-700">Province *</Label>
                  <Select
                    value={addressDetails.province}
                    onValueChange={(value) => handleAddressDetailsChange('province', value)}
                  >
                    <SelectTrigger className="h-10">
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

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={handleGoBack} 
                className="flex items-center gap-2 px-6 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={handleContinueFromAddress} 
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 3: Infrastructure Qualification Check */}
        {currentScreen === 3 && (
          <div className="px-6 pb-6 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 mb-3">
                <Wifi className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-900">Service Availability Check</h3>
              </div>
              <p className="text-gray-600 text-sm">Checking real infrastructure availability for your area</p>
              <p className="text-blue-600 text-xs mt-1">This qualification will be recorded in the admin dashboard</p>
            </div>

            {isCheckingInfrastructure && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Checking service availability...</p>
                <p className="text-gray-500 text-sm mt-1">Analyzing infrastructure data for your location</p>
              </div>
            )}

            {infrastructureCheck && !isCheckingInfrastructure && (
              <div className="space-y-4">
                {/* Qualification Score */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Area Qualification Score</span>
                    <Badge className={`px-2 py-1 text-xs font-semibold ${
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
                      className="h-2 rounded-full bg-blue-600" 
                      style={{ width: `${infrastructureCheck.qualificationScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Available Services */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Available Services
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      <Wifi className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Broadband</span>
                      {infrastructureCheck.broadband ? (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Mobile</span>
                      {infrastructureCheck.mobile ? (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      <Router className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Fiber</span>
                      {infrastructureCheck.fiber ? (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">PEOTV</span>
                      {infrastructureCheck.peotv ? (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Estimated Speed:</span>
                      <span className="text-sm font-semibold text-gray-900">{infrastructureCheck.estimatedSpeed}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Installation Time:</span>
                      <span className="text-sm font-semibold text-gray-900">{infrastructureCheck.installationTimeframe}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-sm text-gray-600 font-medium block mb-1">Recommendation:</span>
                      <p className="text-sm text-gray-700">{infrastructureCheck.recommendation}</p>
                    </div>
                    {infrastructureCheck.limitations.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm text-gray-600 font-medium block mb-1">Limitations:</span>
                        <ul className="space-y-1">
                          {infrastructureCheck.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {infrastructureCheck && (
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack} 
                  className="flex items-center gap-2 px-6 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleCompleteOnboarding} 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                >
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

