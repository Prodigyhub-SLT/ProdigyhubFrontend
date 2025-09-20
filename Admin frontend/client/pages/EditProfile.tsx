import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Camera, Lock, User, Mail, Phone, MapPin, Home, Building, Map } from 'lucide-react';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser, refreshUserProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+94',
    idNumber: ''
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    district: '',
    province: '',
    postalCode: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Function to generate background color from profile picture
  const generateBackgroundColor = (imageUrl: string) => {
    
    // Create a canvas to analyze the image colors
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Set crossOrigin to anonymous to handle CORS
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const data = imageData.data;
          let r = 0, g = 0, b = 0, count = 0;
          
          // Sample pixels from the image (every 10th pixel for performance)
          for (let i = 0; i < data.length; i += 40) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
          
          // Calculate average color
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          
          // Apply the color to the page background
          const pageBackground = document.getElementById('page-background');
          if (pageBackground) {
            pageBackground.style.setProperty('--dynamic-bg-color', `rgb(${r}, ${g}, ${b})`);
          }
        }
      } catch (error) {
        generateFallbackColor();
      }
    };
    
    img.onerror = () => {
      generateFallbackColor();
    };
    
    img.src = imageUrl;
  };

  // Fallback function to generate a color based on user's name
  const generateFallbackColor = () => {
    if (!user?.name) return;
    
    // Generate a consistent color based on the user's name
    let hash = 0;
    for (let i = 0; i < user.name.length; i++) {
      hash = user.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate RGB values from hash
    const r = Math.abs(hash) % 200 + 55; // 55-255 range for better visibility
    const g = Math.abs(hash >> 8) % 200 + 55;
    const b = Math.abs(hash >> 16) % 200 + 55;
    
    // Apply the fallback color to the page background
    const pageBackground = document.getElementById('page-background');
    if (pageBackground) {
      pageBackground.style.setProperty('--dynamic-bg-color', `rgb(${r}, ${g}, ${b})`);
    }
  };

  // Refresh user profile when component mounts to get latest data from MongoDB
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid && refreshUserProfile) {
        console.log('🔄 EditProfile - Refreshing user profile from MongoDB...');
        console.log('🔍 EditProfile - Current user address before refresh:', user.address);
        try {
          await refreshUserProfile();
          console.log('✅ EditProfile - User profile refreshed successfully');
        } catch (error) {
          console.error('❌ EditProfile - Failed to refresh user profile:', error);
        }
      }
    };
    
    loadUserProfile();
  }, []); // Only run once when component mounts
  
  // Also refresh if address data is missing but user exists
  useEffect(() => {
    const checkAddressData = async () => {
      if (user?.uid && (!user.address || Object.values(user.address).every(val => !val)) && refreshUserProfile) {
        console.log('🔄 EditProfile - Address data missing, refreshing profile...');
        try {
          await refreshUserProfile();
          console.log('✅ EditProfile - Profile refreshed due to missing address data');
        } catch (error) {
          console.error('❌ EditProfile - Failed to refresh profile for address data:', error);
        }
      }
    };
    
    checkAddressData();
  }, [user?.uid, user?.address]); // Run when user ID or address changes

  useEffect(() => {
    if (user) {
      console.log('🔄 EditProfile - Loading user data:', user);
      console.log('🏠 EditProfile - User address data:', user.address);
      
      // Handle both combined name and separate firstName/lastName fields
      let firstName = '';
      let lastName = '';
      
      if (user.firstName && user.lastName) {
        // Use separate firstName and lastName fields (from backend response)
        firstName = user.firstName;
        lastName = user.lastName;
      } else if (user.name) {
        // Split full name into first and last name (legacy format)
        const nameParts = user.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Parse phone number if it includes country code
      // Check both profile.phone and direct phoneNumber (for backward compatibility)
      let phoneNumber = user.profile?.phone || user.phoneNumber || '';
      let countryCode = '+94';
      
      if (phoneNumber && phoneNumber.startsWith('+94')) {
        countryCode = '+94';
        phoneNumber = phoneNumber.replace('+94', '').trim();
      } else if (phoneNumber && phoneNumber.startsWith('+')) {
        // Handle other country codes if needed
        const match = phoneNumber.match(/^\+(\d+)\s*(.*)/);
        if (match) {
          countryCode = `+${match[1]}`;
          phoneNumber = match[2];
        }
      }
      
      const newFormData = {
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        idNumber: user.profile?.nic || user.nic || ''
      };
      
      setFormData(newFormData);
      console.log('📝 EditProfile - Form data set:', newFormData);

      // Set address data from user profile
      const newAddressData = {
        street: user.address?.street || '',
        city: user.address?.city || '',
        district: user.address?.district || '',
        province: user.address?.province || '',
        postalCode: user.address?.postalCode || ''
      };
      
      setAddressData(newAddressData);
      console.log('🏠 EditProfile - Address data set:', newAddressData);
      
      // Mark data as loaded
      setDataLoaded(true);
    }
  }, [user]); // This will trigger when user data changes

  useEffect(() => {
    if (user) {
      // Generate background color from existing avatar if available
      if (user.avatar) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          generateBackgroundColor(user.avatar);
        }, 100);
      } else {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          generateFallbackColor();
        }, 100);
      }
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Update user profile
      const updateData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
        nic: formData.idNumber
      };
      
      if (updateUser) {
        await updateUser(updateData);
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Update user address
      const updateData = {
        address: addressData
      };
      
      if (updateUser) {
        await updateUser(updateData);
        setMessage('Address updated successfully!');
      }
    } catch (error) {
      console.error('❌ Address update error:', error);
      setMessage('Failed to update address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    // Navigate to password change page or open password change modal
    navigate('/user/change-password');
  };



  const handleProfilePictureChange = () => {
    // Handle profile picture change
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file upload logic here
        console.log('Profile picture selected:', file);
        
        // Create a URL for the selected file and generate background color
        const imageUrl = URL.createObjectURL(file);
        generateBackgroundColor(imageUrl);
      }
    };
    input.click();
  };

  return (
    <div 
      id="page-background"
      className="min-h-screen py-8 transition-colors duration-500"
      style={{ 
        background: 'linear-gradient(135deg, var(--dynamic-bg-color, #3b82f6) 0%, rgba(0,0,0,0.8) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
                 {/* Header with Back Button - Moved to top left */}
         <div className="absolute top-8 left-8 z-10">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => navigate(-1)}
             className="h-10 w-10 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200"
           >
             <ArrowLeft className="h-5 w-5 text-gray-700" />
           </Button>
         </div>
         
         {/* Page Title - Centered */}
         <div className="text-center mb-8">
           <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
         </div>

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
                                                   <div 
                id="profile-picture-container"
                className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden"
              >
                              {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
             </div>
            
            {/* Edit Profile Picture Button */}
            <Button
              onClick={handleProfilePictureChange}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-600 hover:bg-blue-700 p-0 shadow-lg"
            >
              <Camera className="h-3 w-3 text-white" />
            </Button>
          </div>
        </div>

        {/* Main Form Card with Tabs */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-8">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Details
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Details
                </TabsTrigger>
              </TabsList>

              {/* Profile Details Tab */}
              <TabsContent value="profile">
                <form key={`profile-form-${dataLoaded}`} onSubmit={handleSubmit} className="space-y-6">
                  {/* Two Column Layout for Main Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <div className="flex space-x-2">
                        <Select value={formData.countryCode} onValueChange={(value) => handleInputChange('countryCode', value)}>
                          <SelectTrigger className="w-20 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+94">+94</SelectItem>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+91">+91</SelectItem>
                            <SelectItem value="+86">+86</SelectItem>
                            <SelectItem value="+234">+234</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ID Number - Full Width */}
                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-sm font-medium text-gray-700">
                      ID Number
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="idNumber"
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => handleInputChange('idNumber', e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter ID number"
                        required
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    
                    <Button
                      onClick={handleChangePassword}
                      variant="outline"
                      className="flex-1 h-11 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Address Details Tab */}
              <TabsContent value="address">
                <form key={`address-form-${dataLoaded}`} onSubmit={handleAddressSubmit} className="space-y-6">
                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Street Address */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                        Street Address
                      </Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="street"
                          type="text"
                          value={addressData.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter street address"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="city"
                          type="text"
                          value={addressData.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                        District
                      </Label>
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="district"
                          type="text"
                          value={addressData.district}
                          onChange={(e) => handleAddressChange('district', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter district"
                        />
                      </div>
                    </div>

                    {/* Province */}
                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                        Province
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="province"
                          type="text"
                          value={addressData.province}
                          onChange={(e) => handleAddressChange('province', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter province"
                        />
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                        Postal Code
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="postalCode"
                          type="text"
                          value={addressData.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter postal code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      {isLoading ? 'Saving...' : 'Save Address'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-lg text-sm mt-6 ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
