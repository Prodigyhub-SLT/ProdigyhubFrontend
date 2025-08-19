import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  UserPlus, 
  Building, 
  ArrowRight, 
  LogOut,
  Home,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOptionSelect = (option: 'existing' | 'new') => {
    setSelectedOption(option);
    // For now, just show the selection
    // Later you can add navigation to specific flows
    console.log(`User selected: ${option} customer option`);
  };

  const handleContinue = () => {
    if (selectedOption === 'existing') {
      // Navigate to existing customer flow
      console.log('Navigating to existing customer flow');
      // navigate('/existing-customer');
    } else if (selectedOption === 'new') {
      // Navigate to new customer flow
      console.log('Navigating to new customer flow');
      // navigate('/new-customer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="text-white">
                <div className="text-xl font-bold">SLTMOBITEL</div>
                <div className="text-sm text-blue-200">The Connection</div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="text-blue-200 text-lg">
            Let's get you started with SLT services
          </p>
        </div>

        {/* Customer Type Selection */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Are you an existing SLT Customer?
              </CardTitle>
              <CardDescription className="text-blue-200">
                Please select the option that best describes your situation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Option Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Existing Customer Option */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedOption === 'existing' 
                      ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/25' 
                      : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                  }`}
                  onClick={() => handleOptionSelect('existing')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Existing Customer
                    </h3>
                    <p className="text-blue-100 text-sm">
                      I already have SLT services and want to manage my account
                    </p>
                    {selectedOption === 'existing' && (
                      <Badge className="mt-3 bg-green-500 text-white">
                        Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* New Customer Option */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedOption === 'new' 
                      ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/25' 
                      : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/50'
                  }`}
                  onClick={() => handleOptionSelect('new')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      New Customer
                    </h3>
                    <p className="text-blue-100 text-sm">
                      I'm new to SLT and want to explore available services
                    </p>
                    {selectedOption === 'new' && (
                      <Badge className="mt-3 bg-green-500 text-white">
                        Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Continue Button */}
              {selectedOption && (
                <div className="text-center pt-4">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
                    onClick={handleContinue}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Info Card */}
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-200">Name:</span>
                <span className="text-white font-medium">{user?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200">Email:</span>
                <span className="text-white font-medium">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200">Role:</span>
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  {user?.role || 'User'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-200">Department:</span>
                <span className="text-white font-medium">{user?.department || 'General'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
