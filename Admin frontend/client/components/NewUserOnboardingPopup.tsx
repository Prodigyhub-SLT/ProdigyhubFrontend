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

    // Determine starting screen based on what data is missing
    const hasUserDetails = !!(
      (userDetails.firstName && userDetails.firstName.trim()) && 
      (userDetails.lastName && userDetails.lastName.trim()) && 
      (userDetails.phoneNumber && userDetails.phoneNumber.trim()) && 
      (userDetails.idNumber && userDetails.idNumber.trim())
    );
    
    const hasAddressDetails = !!(
      (addressDetails.street && addressDetails.street.trim()) && 
      (addressDetails.city && addressDetails.city.trim()) && 
      (addressDetails.district && addressDetails.district.trim()) && 
      (addressDetails.province && addressDetails.province.trim()) && 
      (addressDetails.postalCode && addressDetails.postalCode.trim())
    );

    // Start on the appropriate screen
    if (!hasUserDetails) {
      setCurrentScreen(1); // Start with user details
      console.log('🔄 Starting onboarding at user details screen');
    } else if (!hasAddressDetails) {
      setCurrentScreen(2); // Skip to address details
      console.log('🔄 Starting onboarding at address details screen');
    } else {
      setCurrentScreen(3); // Skip to infrastructure check
      console.log('🔄 Starting onboarding at infrastructure check screen');
    }
  }, [isOpen, userDetails, addressDetails]);

  // Auto-trigger infrastructure check when reaching screen 3
  useEffect(() => {
    if (currentScreen === 3 && !infrastructureCheck && !isCheckingInfrastructure) {
      console.log('🎯 Auto-triggering infrastructure check for screen 3');
      checkInfrastructureAvailability();
    }
  }, [currentScreen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-0 shadow-2xl">
        {/* Futuristic Header with Glassmorphism */}
        <DialogHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-t-lg blur-sm"></div>
          <div className="relative bg-black/20 backdrop-blur-md rounded-t-lg p-6 border-b border-white/10">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                <div className="text-right">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                    Welcome, {userDetails.firstName} {userDetails.lastName}
                  </h1>
                  <p className="text-purple-300 text-sm font-medium">Complete Your Profile</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                You can complete it later • Step {currentScreen} of 3
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Futuristic Progress Indicator */}
        <div className="flex items-center justify-center mb-8 px-6">
          <div className="flex items-center space-x-6">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
              currentScreen >= 1 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-gray-700/50 text-gray-400 border border-gray-600'
            }`}>
              <span className="text-sm font-bold">1</span>
              {currentScreen >= 1 && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse opacity-30"></div>
              )}
            </div>
            <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
              currentScreen >= 2 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                : 'bg-gray-700/50'
            }`}></div>
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
              currentScreen >= 2 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-gray-700/50 text-gray-400 border border-gray-600'
            }`}>
              <span className="text-sm font-bold">2</span>
              {currentScreen >= 2 && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse opacity-30"></div>
              )}
            </div>
            <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
              currentScreen >= 3 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                : 'bg-gray-700/50'
            }`}></div>
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
              currentScreen >= 3 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-gray-700/50 text-gray-400 border border-gray-600'
            }`}>
              <span className="text-sm font-bold">3</span>
              {currentScreen >= 3 && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse opacity-30"></div>
              )}
            </div>
          </div>
        </div>

        {/* Screen 1: User Details */}
        {currentScreen === 1 && (
          <div className="px-6 pb-6 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
                <User className="w-4 h-4 text-purple-300" />
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
              </div>
              <p className="text-gray-300 text-sm">Let us know more about you</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-200 font-medium">First Name *</Label>
                <Input
                  id="firstName"
                  value={userDetails.firstName}
                  onChange={(e) => handleUserDetailsChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-200 font-medium">Last Name *</Label>
                <Input
                  id="lastName"
                  value={userDetails.lastName}
                  onChange={(e) => handleUserDetailsChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200 font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={userDetails.email}
                onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled
                className="bg-gray-700/30 border-gray-600 text-gray-300 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-gray-200 font-medium">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={userDetails.phoneNumber}
                onChange={(e) => handleUserDetailsChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-gray-200 font-medium">ID Number (NIC) *</Label>
              <Input
                id="idNumber"
                value={userDetails.idNumber}
                onChange={(e) => handleUserDetailsChange('idNumber', e.target.value)}
                placeholder="Enter your NIC number"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300"
              />
            </div>

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleSkipUserDetails}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500 hover:text-white transition-all duration-300 px-6 py-2"
              >
                Skip
              </Button>
              <Button 
                onClick={handleContinueFromUserDetails} 
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 2: Address Details */}
        {currentScreen === 2 && (
          <div className="px-6 pb-6 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
                <MapPin className="w-4 h-4 text-purple-300" />
                <h3 className="text-lg font-semibold text-white">Address Information</h3>
              </div>
              <p className="text-gray-300 text-sm">Help us provide better service coverage</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street" className="text-gray-200 font-medium">Street Address *</Label>
              <Input
                id="street"
                value={addressDetails.street}
                onChange={(e) => handleAddressDetailsChange('street', e.target.value)}
                placeholder="Enter your street address"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-200 font-medium">City *</Label>
                <Input
                  id="city"
                  value={addressDetails.city}
                  onChange={(e) => handleAddressDetailsChange('city', e.target.value)}
                  placeholder="Enter your city"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-gray-200 font-medium">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={addressDetails.postalCode}
                  onChange={(e) => handleAddressDetailsChange('postalCode', e.target.value)}
                  placeholder="Enter postal code"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="district" className="text-gray-200 font-medium">District *</Label>
                <Select
                  value={addressDetails.district}
                  onValueChange={(value) => handleAddressDetailsChange('district', value)}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {districts.map((district) => (
                      <SelectItem key={district} value={district} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="province" className="text-gray-200 font-medium">Province *</Label>
                <Select
                  value={addressDetails.province}
                  onValueChange={(value) => handleAddressDetailsChange('province', value)}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:bg-gray-700/50 transition-all duration-300">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleGoBack} 
                className="flex items-center gap-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500 hover:text-white transition-all duration-300 px-6 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={handleContinueFromAddress} 
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 3: Infrastructure Qualification Check */}
        {currentScreen === 3 && (
          <div className="px-6 pb-6 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4">
                <Wifi className="w-4 h-4 text-purple-300" />
                <h3 className="text-lg font-semibold text-white">Service Availability Check</h3>
              </div>
              <p className="text-gray-300 text-sm">Checking real infrastructure availability for your area</p>
              <p className="text-purple-300 text-xs mt-1">This qualification will be recorded in the admin dashboard</p>
            </div>

            {isCheckingInfrastructure && (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-6"></div>
                  <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-gray-300 text-lg font-medium">Checking service availability...</p>
                <p className="text-gray-400 text-sm mt-2">Analyzing infrastructure data for your location</p>
              </div>
            )}

            {infrastructureCheck && !isCheckingInfrastructure && (
              <div className="space-y-6">
                {/* Qualification Score */}
                <Card className="bg-gray-800/50 border-gray-600 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-white text-lg">Area Qualification Score</span>
                      <Badge className={`px-3 py-1 text-sm font-bold ${
                        infrastructureCheck.qualificationScore >= 80 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
                          : infrastructureCheck.qualificationScore >= 60
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                      }`}>
                        {infrastructureCheck.qualificationScore}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${infrastructureCheck.qualificationScore}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Services */}
                <Card className="bg-gray-800/50 border-gray-600 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-300" />
                      Available Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600">
                        <Wifi className="w-5 h-5 text-purple-300" />
                        <span className="text-white font-medium">Broadband</span>
                        {infrastructureCheck.broadband ? (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600">
                        <Smartphone className="w-5 h-5 text-purple-300" />
                        <span className="text-white font-medium">Mobile</span>
                        {infrastructureCheck.mobile ? (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600">
                        <Router className="w-5 h-5 text-purple-300" />
                        <span className="text-white font-medium">Fiber</span>
                        {infrastructureCheck.fiber ? (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600">
                        <Building className="w-5 h-5 text-purple-300" />
                        <span className="text-white font-medium">PEOTV</span>
                        {infrastructureCheck.peotv ? (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Details */}
                <Card className="bg-gray-800/50 border-gray-600 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300 font-medium">Estimated Speed:</span>
                      <span className="text-white font-semibold">{infrastructureCheck.estimatedSpeed}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300 font-medium">Installation Time:</span>
                      <span className="text-white font-semibold">{infrastructureCheck.installationTimeframe}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-300 font-medium block mb-2">Recommendation:</span>
                      <p className="text-gray-200 leading-relaxed">{infrastructureCheck.recommendation}</p>
                    </div>
                    {infrastructureCheck.limitations.length > 0 && (
                      <div className="pt-2">
                        <span className="text-gray-300 font-medium block mb-2">Limitations:</span>
                        <ul className="space-y-1">
                          {infrastructureCheck.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-200">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span className="text-sm">{limitation}</span>
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
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack} 
                  className="flex items-center gap-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-purple-500 hover:text-white transition-all duration-300 px-6 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleCompleteOnboarding} 
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40"
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

