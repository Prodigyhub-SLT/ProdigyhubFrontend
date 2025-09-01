import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Camera, Lock, User, Mail, Phone } from 'lucide-react';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+94',
    idNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Function to generate background color from profile picture
  const generateBackgroundColor = (imageUrl: string) => {
    console.log('Generating background color for:', imageUrl);
    
    // Create a canvas to analyze the image colors
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      console.log('Image loaded, analyzing colors...');
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
          
          console.log('Generated color:', `rgb(${r}, ${g}, ${b})`);
          
          // Apply the color to the profile picture container
          const profileContainer = document.getElementById('profile-picture-container');
          if (profileContainer) {
            profileContainer.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            console.log('Background color applied successfully');
          } else {
            console.log('Profile container not found');
          }
        }
      } catch (error) {
        console.log('Could not analyze image colors:', error);
      }
    };
    
    img.onerror = () => {
      console.log('Failed to load image for color analysis');
    };
    
    img.src = imageUrl;
  };

  useEffect(() => {
    if (user) {
      // Split full name into first and last name
      const nameParts = (user.name || '').split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phoneNumber: '',
        countryCode: '+94',
        idNumber: ''
      });
      
      // Generate background color from existing avatar if available
      if (user.avatar) {
        console.log('User has avatar, generating background color...');
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          generateBackgroundColor(user.avatar);
        }, 100);
      } else {
        console.log('No avatar found for user');
      }
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
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
      if (updateUser) {
        await updateUser({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
          idNumber: formData.idNumber
        });
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4 h-10 w-10 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div 
              id="profile-picture-container"
              className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg transition-colors duration-300"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || 'U'
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

        {/* Main Form Card */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Message Display */}
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('successfully') 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
