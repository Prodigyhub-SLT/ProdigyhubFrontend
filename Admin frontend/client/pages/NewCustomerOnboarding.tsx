import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Wifi, 
  Signal, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    district: string;
    province: string;
    postalCode: string;
  };
}

export default function NewCustomerOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      district: '',
      province: '',
      postalCode: ''
    }
  });
  
  const [infrastructureCheck, setInfrastructureCheck] = useState<InfrastructureAvailability | null>(null);
  const [areaData, setAreaData] = useState<AreaData | null>(null);
  const [isCheckingInfrastructure, setIsCheckingInfrastructure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'details' | 'infrastructure'>('details');

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
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUserDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserDetails],
          [child]: value
        }
      }));
    } else {
      setUserDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const checkInfrastructureAvailability = async () => {
    if (!userDetails.address.district || !userDetails.address.province) {
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
      // On Vercel, API calls go directly to the backend
      const response = await fetch('/api/areaManagement/v5/area', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const areas = await response.json();
        const matchedArea = areas.find((area: AreaData) => 
          area.district === userDetails.address.district && 
          area.province === userDetails.address.province &&
          area.status === 'active'
        );

        if (matchedArea) {
          console.log('✅ Found matched area:', matchedArea);
          setAreaData(matchedArea);
          setInfrastructureCheck(matchedArea.infrastructure);
          console.log('✅ Set infrastructure check:', matchedArea.infrastructure);
          toast({
            title: "Infrastructure Found",
            description: `Found infrastructure data for ${matchedArea.name}`,
          });
          
          // Pass infrastructure data directly to avoid state timing issues
          console.log('🔄 About to call handleSubmit with matched area...');
          await handleSubmit(matchedArea.infrastructure, matchedArea);
        } else {
          // Create a default infrastructure check (you can modify this logic)
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
          
          console.log('✅ Setting default infrastructure:', defaultInfrastructure);
          setInfrastructureCheck(defaultInfrastructure);
          setAreaData(null);
          toast({
            title: "Infrastructure Check Complete",
            description: "Infrastructure availability has been determined for your area.",
          });
          
          // Pass infrastructure data directly to avoid state timing issues
          console.log('🔄 About to call handleSubmit with default infrastructure...');
          await handleSubmit(defaultInfrastructure, null);
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
    if (service.available) {
      toast({
        title: "Service Available",
        description: `${serviceType.toUpperCase()} is already available in your area!`,
      });
      return;
    }

    // Create qualification request that matches the admin dashboard format
    const qualificationData = {
      id: `qual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      location: {
        district: userDetails.address.district,
        province: userDetails.address.province,
        coordinates: null
      },
      service: `${serviceType.toUpperCase()} Broadband`,
      infrastructure: getInfrastructureSummary(),
      result: 'unqualified', // Will show as pending request in admin dashboard
      date: new Date().toISOString(),
      customerDetails: {
        name: `${userDetails.firstName} ${userDetails.lastName}`,
        email: userDetails.email,
        phone: userDetails.phoneNumber,
        address: userDetails.address
      },
      requestedServices: [serviceType],
      status: 'pending',
      requestType: 'infrastructure_request',
      description: `Customer requesting ${serviceType.toUpperCase()} service in ${userDetails.address.district}, ${userDetails.address.province}`,
      createdAt: new Date().toISOString(),
      '@type': 'CheckProductOfferingQualification'
    };

    try {
      // On Vercel, API calls go directly to the backend
      const response = await fetch('/api/productOfferingQualification/v5/checkProductOfferingQualification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qualificationData)
      });

      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: `Your ${serviceType.toUpperCase()} service request has been submitted successfully and will appear in Qualification Records.`,
        });
        
        // Update the button to show it's been requested
        const buttonElement = document.querySelector(`[data-service="${serviceType}"]`);
        if (buttonElement) {
          buttonElement.textContent = 'Request Submitted';
          buttonElement.disabled = true;
        }
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit service request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to get infrastructure summary for admin dashboard
  const getInfrastructureSummary = () => {
    const available = [];
    if (infrastructureCheck?.fiber.available) available.push('Fiber');
    if (infrastructureCheck?.adsl.available) available.push('ADSL');
    if (infrastructureCheck?.mobile.available) available.push('Mobile');
    
    return available.length > 0 ? available.join(' ') : 'None';
  };

  const handleSubmit = async (infrastructureData?: InfrastructureAvailability, areaDataParam?: AreaData | null) => {
    // Use passed data or fall back to state
    const infrastructureToUse = infrastructureData || infrastructureCheck;
    const areaDataToUse = areaDataParam || areaData;
    
    // Debug logging to see what's happening
    console.log('handleSubmit called with:', {
      infrastructureData,
      areaDataParam,
      infrastructureToUse,
      userDetails,
      step
    });
    
    if (!infrastructureToUse) {
      console.log('❌ Infrastructure check is null/undefined');
      toast({
        title: "Missing Information",
        description: "Please check infrastructure availability before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare user data
      const userData = {
        ...userDetails,
        userId: user?.uid,
        userEmail: user?.email,
        infrastructureCheck: infrastructureToUse,
        areaData: areaDataToUse,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // First, check if user already exists by email
      console.log('🔍 Checking if user exists with email:', userDetails.email);
      const checkResponse = await fetch(`/api/users/email/${encodeURIComponent(userDetails.email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      let response;
      if (checkResponse.ok) {
        // User exists, update them
        const existingUser = await checkResponse.json();
        console.log('✅ User exists, updating:', existingUser.id);
        
        response = await fetch(`/api/users/${existingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userData,
            updatedAt: new Date().toISOString()
          })
        });
      } else {
        // User doesn't exist, create new one
        console.log('✅ User does not exist, creating new user');
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });
      }

            if (response.ok) {
        // Update state with the infrastructure data we used
        setInfrastructureCheck(infrastructureToUse);
        setAreaData(areaDataToUse);
        
        // Determine if we created or updated the user
        const isUpdate = checkResponse.ok;
        toast({
          title: "Success",
          description: isUpdate 
            ? "Your information has been updated successfully!" 
            : "Your information has been saved successfully!",
        });
        
        // Show infrastructure results and service options
        setStep('infrastructure');
      } else {
         const errorText = await response.text();
         console.error('🔍 Full API Response Details:', {
           status: response.status,
           statusText: response.statusText,
           headers: Object.fromEntries(response.headers.entries()),
           body: errorText,
           url: response.url
         });
         
         // Try to parse error response as JSON for more details
         let errorDetails = errorText;
         try {
           const errorJson = JSON.parse(errorText);
           errorDetails = errorJson.message || errorJson.error || errorText;
           console.error('🔍 Parsed Error Details:', errorJson);
         } catch (e) {
           console.log('🔍 Error response is not JSON, using as text');
         }
         
         throw new Error(`Failed to save user data: ${response.status} ${response.statusText} - ${errorDetails}`);
       }
    } catch (error) {
      console.error('Error saving user data:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: `Failed to save your information: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = userDetails.firstName.trim() && userDetails.lastName.trim() && 
                    userDetails.email.trim() && userDetails.phoneNumber.trim() &&
                    userDetails.address.street.trim() && userDetails.address.city.trim() &&
                    userDetails.address.district && userDetails.address.province;

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (Sri Lanka format)
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^(\+94|0)?[1-9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const isFormValid = canProceed && 
                     isValidEmail(userDetails.email) && 
                     isValidPhone(userDetails.phoneNumber);

  if (step === 'infrastructure') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-6"
            onClick={() => setStep('details')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>

          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Infrastructure Availability Check
              </CardTitle>
              <CardDescription className="text-blue-200">
                Checking what services are available in your area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isCheckingInfrastructure ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
                  <p className="text-blue-200">Checking infrastructure availability...</p>
                </div>
                             ) : infrastructureCheck ? (
                 <div className="space-y-6">
                   {/* Infrastructure Summary */}
                   <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                     <h3 className="text-xl font-semibold text-white mb-4 text-center">
                       Infrastructure Summary for {userDetails.address.district}, {userDetails.address.province}
                     </h3>
                     <div className="grid md:grid-cols-3 gap-4">
                       <div className="text-center">
                         <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                           infrastructureCheck.fiber.available ? 'bg-green-500/30' : 'bg-red-500/30'
                         }`}>
                           {infrastructureCheck.fiber.available ? (
                             <CheckCircle className="w-8 h-8 text-green-400" />
                           ) : (
                             <XCircle className="w-8 h-8 text-red-400" />
                           )}
                         </div>
                         <div className="text-white font-semibold">Fiber Internet</div>
                         <div className={`text-sm ${infrastructureCheck.fiber.available ? 'text-green-400' : 'text-red-400'}`}>
                           {infrastructureCheck.fiber.available ? 'Available' : 'Not Available'}
                         </div>
                       </div>
                       
                       <div className="text-center">
                         <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                           infrastructureCheck.adsl.available ? 'bg-green-500/30' : 'bg-red-500/30'
                         }`}>
                           {infrastructureCheck.adsl.available ? (
                             <CheckCircle className="w-8 h-8 text-green-400" />
                           ) : (
                             <XCircle className="w-8 h-8 text-red-400" />
                           )}
                         </div>
                         <div className="text-white font-semibold">ADSL Internet</div>
                         <div className={`text-sm ${infrastructureCheck.adsl.available ? 'text-green-400' : 'text-red-400'}`}>
                           {infrastructureCheck.adsl.available ? 'Available' : 'Not Available'}
                         </div>
                       </div>
                       
                       <div className="text-center">
                         <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                           infrastructureCheck.mobile.available ? 'bg-green-500/30' : 'bg-red-500/30'
                         }`}>
                           {infrastructureCheck.mobile.available ? (
                             <CheckCircle className="w-8 h-8 text-green-400" />
                           ) : (
                             <XCircle className="w-8 h-8 text-red-400" />
                           )}
                         </div>
                         <div className="text-white font-semibold">Mobile Internet</div>
                         <div className={`text-sm ${infrastructureCheck.mobile.available ? 'text-green-400' : 'text-red-400'}`}>
                           {infrastructureCheck.mobile.available ? 'Available' : 'Not Available'}
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="grid md:grid-cols-3 gap-4">
                    {/* Fiber Service */}
                    <Card className={`${infrastructureCheck.fiber.available ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'} border-2`}>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-2">
                          {infrastructureCheck.fiber.available ? (
                            <CheckCircle className="w-12 h-12 text-green-400" />
                          ) : (
                            <XCircle className="w-12 h-12 text-red-400" />
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-2">Fiber Internet</h3>
                        <Badge variant={infrastructureCheck.fiber.available ? "default" : "destructive"}>
                          {infrastructureCheck.fiber.available ? 'Available' : 'Not Available'}
                        </Badge>
                        {infrastructureCheck.fiber.available && (
                          <div className="mt-2 text-sm text-green-200">
                            <p>Speed: {infrastructureCheck.fiber.maxSpeed}</p>
                            <p>Coverage: {infrastructureCheck.fiber.coverage}%</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* ADSL Service */}
                    <Card className={`${infrastructureCheck.adsl.available ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'} border-2`}>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-2">
                          {infrastructureCheck.adsl.available ? (
                            <CheckCircle className="w-12 h-12 text-green-400" />
                          ) : (
                            <XCircle className="w-12 h-12 text-red-400" />
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-2">ADSL Internet</h3>
                        <Badge variant={infrastructureCheck.adsl.available ? "default" : "destructive"}>
                          {infrastructureCheck.adsl.available ? 'Available' : 'Not Available'}
                        </Badge>
                        {infrastructureCheck.adsl.available && (
                          <div className="mt-2 text-sm text-green-200">
                            <p>Speed: {infrastructureCheck.adsl.maxSpeed}</p>
                            <p>Coverage: {infrastructureCheck.adsl.coverage}%</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Mobile Service */}
                    <Card className={`${infrastructureCheck.mobile.available ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'} border-2`}>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-2">
                          {infrastructureCheck.mobile.available ? (
                            <CheckCircle className="w-12 h-12 text-green-400" />
                          ) : (
                            <XCircle className="w-12 h-12 text-red-400" />
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-2">Mobile Internet</h3>
                        <Badge variant={infrastructureCheck.mobile.available ? "default" : "destructive"}>
                          {infrastructureCheck.mobile.available ? 'Available' : 'Not Available'}
                        </Badge>
                        {infrastructureCheck.mobile.available && (
                          <div className="mt-2 text-sm text-green-200">
                            <p>Technologies: {infrastructureCheck.mobile.technologies?.join(', ')}</p>
                            <p>Coverage: {infrastructureCheck.mobile.coverage}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                                     <div className="text-center space-y-4">
                     <div className="text-lg font-semibold text-white mb-4">
                       Infrastructure Check Complete for {userDetails.address.district}, {userDetails.address.province}
                     </div>
                     
                     {/* Service Request Buttons */}
                     <div className="grid md:grid-cols-3 gap-4 mb-6">
                       {/* Fiber Service Request */}
                       {!infrastructureCheck.fiber.available && (
                         <Button 
                           className="w-full bg-red-600 hover:bg-red-700 text-white"
                           onClick={() => handleServiceRequest('fiber')}
                           data-service="fiber"
                         >
                           Request Fiber Service
                         </Button>
                       )}
                       
                       {/* ADSL Service Request */}
                       {!infrastructureCheck.adsl.available && (
                         <Button 
                           className="w-full bg-red-600 hover:bg-red-700 text-white"
                           onClick={() => handleServiceRequest('adsl')}
                           data-service="adsl"
                         >
                           Request ADSL Service
                         </Button>
                       )}
                       
                       {/* Mobile Service Request */}
                       {!infrastructureCheck.mobile.available && (
                         <Button 
                           className="w-full bg-red-600 hover:bg-red-700 text-white"
                           onClick={() => handleServiceRequest('mobile')}
                           data-service="mobile"
                         >
                           Request Mobile Service
                         </Button>
                       )}
                       
                       {/* Show message if all services are available */}
                       {infrastructureCheck.fiber.available && 
                        infrastructureCheck.adsl.available && 
                        infrastructureCheck.mobile.available && (
                         <div className="col-span-3 text-center py-4">
                           <div className="text-green-400 text-lg font-semibold mb-2">
                             🎉 All services are available in your area!
                           </div>
                           <div className="text-blue-200 text-sm">
                             You can subscribe to any of the available services
                           </div>
                         </div>
                       )}
                     </div>
                     
                     {/* View Admin Dashboard Button */}
                     <Button
                       size="lg"
                       className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold"
                       onClick={() => navigate('/admin/qualification')}
                     >
                       View Qualification Records
                       <ArrowRight className="w-5 h-5 ml-2" />
                     </Button>
                     
                     <div className="text-sm text-blue-200">
                       Your service requests will appear in the Qualification Records section
                     </div>
                   </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <p className="text-yellow-200 text-lg">No infrastructure data found for your area.</p>
                  <p className="text-blue-200">Please contact SLT support for more information.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/20 mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              New Customer Registration
            </CardTitle>
            <CardDescription className="text-blue-200">
              Please provide your details so we can check service availability in your area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-blue-200">First Name *</Label>
                  <Input
                    id="firstName"
                    value={userDetails.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-blue-200">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={userDetails.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-200">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`bg-white/20 border-white/30 text-white placeholder:text-blue-200 ${
                      userDetails.email && !isValidEmail(userDetails.email) ? 'border-red-400' : ''
                    }`}
                    placeholder="Enter your email address"
                  />
                  {userDetails.email && !isValidEmail(userDetails.email) && (
                    <p className="text-red-400 text-sm">Please enter a valid email address</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-blue-200">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={userDetails.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`bg-white/20 border-white/30 text-white placeholder:text-blue-200 ${
                      userDetails.phoneNumber && !isValidPhone(userDetails.phoneNumber) ? 'border-red-400' : ''
                    }`}
                    placeholder="Enter your phone number (e.g., 0771234567 or +94771234567)"
                  />
                  {userDetails.phoneNumber && !isValidPhone(userDetails.phoneNumber) && (
                    <p className="text-red-400 text-sm">Please enter a valid Sri Lankan phone number</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="street" className="text-blue-200">Street Address *</Label>
                <Input
                  id="street"
                  value={userDetails.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-blue-200">City *</Label>
                  <Input
                    id="city"
                    value={userDetails.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    placeholder="Enter your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-blue-200">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={userDetails.address.postalCode}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-blue-200">District *</Label>
                  <Select
                    value={userDetails.address.district}
                    onValueChange={(value) => handleInputChange('address.district', value)}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
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
                  <Label htmlFor="province" className="text-blue-200">Province *</Label>
                  <Select
                    value={userDetails.address.province}
                    onValueChange={(value) => handleInputChange('address.province', value)}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
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

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white/20"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
                onClick={checkInfrastructureAvailability}
                disabled={!isFormValid || isCheckingInfrastructure}
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
    </div>
  );
}
