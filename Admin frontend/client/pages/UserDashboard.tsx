import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { QualificationTab } from '../components/QualificationTab';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProfilePopup from '../components/ProfilePopup';
import CustomerPackagesTab from '../components/CustomerPackagesTab';
import InventoryTab from '../components/InventoryTab';
import MessagesTab from '../components/MessagesTab';
import CustomerCustomizeTab from '../components/CustomerCustomizeTab';
import NewUserOnboardingPopup from '../components/NewUserOnboardingPopup';
import { 
  Wifi, 
  Tv, 
  Phone, 
  Smartphone, 
  Megaphone,
  Plus,
  Cloud,
  Monitor,
  FileText,
  MessageCircle,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  Zap,
  Gift,
  Clock,
  History,
  Star,
  LogOut,
  Home,
  Package,
  Database,
  Award,
  Palette,
  MessageSquare
} from 'lucide-react';

interface ServiceData {
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
}

interface DataUsage {
  type: string;
  used: string;
  total: string;
  percentage: number;
}

interface QuickLink {
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface ValueAddedService {
  name: string;
  icon: React.ReactNode;
  color: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeService, setActiveService] = useState('broadband');
  const [activeTab, setActiveTab] = useState('summary');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [completeUserData, setCompleteUserData] = useState<any>(null);
  const profileTriggerRef = useRef<HTMLDivElement>(null);
  
  // Debug log for initial state
  console.log('🚀 UserDashboard mounted with initial state:', { 
    activeTab,
    urlSearch: location.search
  });
  




  const handleTabClick = (tabId: string) => {
    console.log('🔍 Tab click:', { tabId, currentTab: activeTab });
    setActiveTab(tabId);
  };

  const handleQualificationComplete = () => {
    // Qualification completed - no special handling needed since tabs are always accessible
    console.log('✅ Qualification completed');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (userData: any) => {
    console.log('✅ User onboarding completed:', userData);
    setUserNeedsOnboarding(false);
    setShowOnboardingPopup(false);
    
    // Update user context if needed
    // You might want to refresh user data from the backend here
  };

  // Handle onboarding popup close
  const handleOnboardingClose = () => {
    setShowOnboardingPopup(false);
  };

  // Mock data for services
  const services: ServiceData[] = [
    { name: 'Broadband', icon: <Wifi className="w-6 h-6" />, isActive: true },
    { name: 'PEOTV', icon: <Tv className="w-6 h-6" />, isActive: false },
    { name: 'Voice', icon: <Phone className="w-6 h-6" />, isActive: false },
    { name: 'Mobile', icon: <Smartphone className="w-6 h-6" />, isActive: false },
    { name: 'Promotion', icon: <Megaphone className="w-6 h-6" />, isActive: false },
  ];

  // Mock data for broadband sub-services
  const broadbandSubServices = [
    { name: 'Summary', isActive: true },
    { name: 'Daily Usage', isActive: false },
    { name: 'Gift Data', isActive: false },
    { name: 'History', isActive: false },
    { name: 'Redeem Data', isActive: false },
    { name: 'Happy Day', isActive: false },
    { name: 'More', isActive: false, hasDropdown: true },
  ];

  // Mock data for data usage
  const dataUsage: DataUsage[] = [
    { type: 'My Package', used: '55.2', total: '87.1GB', percentage: 63 },
    { type: 'Extra GB', used: '0.4', total: '1.0GB', percentage: 40 },
    { type: 'Bonus Data', used: 'N/A', total: 'N/A', percentage: 0 },
    { type: 'Add-Ons Data', used: '40.5', total: '45.0GB', percentage: 90 },
    { type: 'Free Data', used: 'N/A', total: 'N/A', percentage: 0 },
  ];

  // Mock data for quick links
  const quickLinks: QuickLink[] = [
    { name: 'New Services', icon: <Plus className="w-5 h-5" />, color: 'bg-blue-500' },
    { name: 'Digital Life', icon: <Cloud className="w-5 h-5" />, color: 'bg-green-500' },
    { name: 'Hot Device', icon: <Monitor className="w-5 h-5" />, color: 'bg-purple-500' },
    { name: 'Bill', icon: <FileText className="w-5 h-5" />, color: 'bg-orange-500' },
    { name: 'Complaints', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-red-500' },
    { name: 'More', icon: <ChevronDown className="w-5 h-5" />, color: 'bg-gray-500' },
  ];

  // Mock data for value added services
  const valueAddedServices: ValueAddedService[] = [
    { name: 'Duthaya', icon: <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">D</div>, color: 'bg-blue-500' },
    { name: 'Kaspersky', icon: <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">🛡️</div>, color: 'bg-green-500' },
    { name: 'PEOTV GO', icon: <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">PEO</div>, color: 'bg-purple-500' },
    { name: 'SLT Kimaki', icon: <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">🥷</div>, color: 'bg-red-500' },
    { name: 'Storage', icon: <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">📦</div>, color: 'bg-blue-600' },
  ];

  // Tab configuration for second navigation bar (per service)
  const broadbandTabs = [
    { id: 'summary', name: 'Summary', icon: <Home className="w-4 h-4" /> },
    { id: 'packages', name: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'inventory', name: 'Inventory', icon: <Database className="w-4 h-4" /> },
    { id: 'qualification', name: 'Qualification', icon: <Award className="w-4 h-4" /> },
    { id: 'customize', name: 'Customize', icon: <Palette className="w-4 h-4" /> },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const peotvTabs = [
    { id: 'summary', name: 'Summary', icon: <Home className="w-4 h-4" /> },
    { id: 'packages', name: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const voiceTabs = [
    { id: 'summary', name: 'Summary', icon: <Home className="w-4 h-4" /> },
    { id: 'packages', name: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const mobileTabs = [
    { id: 'summary', name: 'Summary', icon: <Home className="w-4 h-4" /> },
    { id: 'packages', name: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const promotionTabs = [
    { id: 'summary', name: 'Summary', icon: <Home className="w-4 h-4" /> },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const secondNavTabs =
    activeService === 'broadband' ? broadbandTabs :
    activeService === 'peotv' ? peotvTabs :
    activeService === 'voice' ? voiceTabs :
    activeService === 'mobile' ? mobileTabs :
    promotionTabs;

  // Check if user needs onboarding (users without complete profile details)
  useEffect(() => {
    const checkUserOnboardingStatus = async () => {
      if (!user || !user.uid) return;

      // Check for all users who might be missing profile details
      console.log('🔍 Checking onboarding status for user:', user.uid, 'Auth method:', user.authMethod);
      try {
        const backendURL = import.meta.env.VITE_API_BASE_URL || 'https://prodigyhub.onrender.com';
        console.log('🌐 Backend URL:', backendURL);
          
        const response = await fetch(`${backendURL}/users/profile/${user.uid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📊 Profile check response status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log('👤 User data from MongoDB:', userData);
          console.log('🔍 Detailed field check:', {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            nic: userData.nic,
            address: userData.address,
            addressStreet: userData.address?.street,
            addressCity: userData.address?.city,
            addressDistrict: userData.address?.district,
            addressProvince: userData.address?.province
          });

          // Store complete user data for the onboarding popup
          setCompleteUserData({
            ...user,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            nic: userData.nic,
            address: userData.address,
            photoURL: user?.avatar || user?.photoURL // Ensure photoURL is preserved
          });
          
          // Check if user has completed onboarding
          // Be flexible with field checking and handle whitespace
          const hasUserDetails = !!(
            (userData.firstName && userData.firstName.trim()) && 
            (userData.lastName && userData.lastName.trim()) && 
            (userData.phoneNumber && userData.phoneNumber.trim()) && 
            (userData.nic && userData.nic.trim())
          );
          
          const hasAddressDetails = !!(userData.address && 
            (userData.address.street && userData.address.street.trim()) && 
            (userData.address.city && userData.address.city.trim()) && 
            (userData.address.district && userData.address.district.trim()) && 
            (userData.address.province && userData.address.province.trim())
          );
          
          // User needs onboarding if they are missing EITHER user details OR address details
          // AND onboardingCompleted is not true
          const needsOnboarding = !userData.onboardingCompleted && (!hasUserDetails || !hasAddressDetails);
          const isExistingCompleteUser = hasUserDetails && hasAddressDetails;
            
          console.log('🔍 Onboarding check details:', {
            onboardingCompleted: userData.onboardingCompleted,
            hasUserDetails,
            hasAddressDetails,
            isExistingCompleteUser,
            needsOnboarding
          });
          
          if (needsOnboarding) {
            console.log('🆕 User needs onboarding');
            setUserNeedsOnboarding(true);
            setShowOnboardingPopup(true);
          } else {
            console.log('✅ User has completed onboarding');
            setUserNeedsOnboarding(false);
            
            // If this is an existing complete user but onboardingCompleted is not set,
            // update it in the backend to avoid future checks
            if (isExistingCompleteUser && !userData.onboardingCompleted) {
              console.log('🔄 Marking existing complete user as onboarding completed');
              try {
                await fetch(`${backendURL}/users/profile`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    uid: user.uid,
                    onboardingCompleted: true
                  })
                });
                console.log('✅ Updated onboardingCompleted flag for existing user');
              } catch (error) {
                console.warn('⚠️ Failed to update onboardingCompleted flag:', error);
              }
            }
          }
        } else {
          // User not found in MongoDB, needs onboarding
          console.log('🆕 User not found in database (status:', response.status, '), needs onboarding');
          setCompleteUserData({
            ...user,
            photoURL: user?.avatar || user?.photoURL // Ensure photoURL is preserved
          }); // Use basic user data from auth context
          setUserNeedsOnboarding(true);
          setShowOnboardingPopup(true);
        }
      } catch (error) {
        console.error('❌ Error checking user onboarding status:', error);
        // On error, assume user needs onboarding for safety
        console.log('⚠️ Falling back to showing onboarding popup due to error');
        setCompleteUserData({
          ...user,
          photoURL: user?.avatar || user?.photoURL // Ensure photoURL is preserved
        }); // Use basic user data from auth context
        setUserNeedsOnboarding(true);
        setShowOnboardingPopup(true);
      }
    };

    checkUserOnboardingStatus();
  }, [user]);

  // Handle URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && ['summary', 'packages', 'inventory', 'qualification', 'customize', 'messages'].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log('✅ Tab set from URL parameter:', tabParam);
    }
  }, [location.search]);

  // Clean up old qualification system localStorage entries
  useEffect(() => {
    // Remove old qualification system localStorage entries
    localStorage.removeItem('qualification_completed');
    localStorage.removeItem('force_locked_until_manual_completion');
    console.log('🧹 Cleaned up old qualification system localStorage entries');
  }, []);

  // Reset sub-tab when switching top-level service so the sub-nav feels scoped
  useEffect(() => {
    setActiveTab('summary');
  }, [activeService]);













  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <a href="/" className="block">
                <img src="/images/slt-log.jpg" alt="SLT" className="h-10 w-auto rounded-lg object-contain" />
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-black tracking-normal">SLT Prodigy Hub</span>
              <div 
                ref={profileTriggerRef}
                className="relative cursor-pointer"
              >
                <div 
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-700 transition-colors overflow-hidden"
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to letter avatar if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = user?.name?.charAt(0) || 'U';
                        }
                      }}
                    />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <ProfilePopup 
                  isOpen={showProfilePopup}
                  onClose={() => setShowProfilePopup(false)}
                  triggerRef={profileTriggerRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Service Navigation */}
      <div className="bg-white/70 backdrop-blur shadow-md border-b" style={{height: '64px'}}>
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center space-x-3 h-full">
            {services.map((service) => {
              const isSvcActive = activeService === service.name.toLowerCase();
              return (
                <Button
                  key={service.name}
                  variant={isSvcActive ? "default" : "outline"}
                  className={`group relative overflow-hidden px-5 rounded-xl transition-all duration-300 ${
                    isSvcActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] ring-1 ring-white/30'
                      : 'text-gray-700 bg-white/70 border border-gray-200 hover:bg-white hover:shadow-md'
                  }`}
                  style={{height: '44px'}}
                  onClick={() => setActiveService(service.name.toLowerCase())}
                >
                  <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                    {service.icon}
                  </span>
                  <span className="ml-2 font-semibold tracking-wide">{service.name}</span>
                  {isSvcActive && (
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10"></span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Navigation: only show when the current service exposes tabs */}
      {secondNavTabs.length > 0 && (
        <div className="bg-white/70 backdrop-blur shadow-md border-b" style={{height: '72px'}}>
          <div className="px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center space-x-3 h-full">
              {secondNavTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "outline"}
                    className={`group relative overflow-hidden px-6 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] ring-1 ring-white/30'
                      : 'text-gray-700 bg-white/70 border border-gray-200 hover:bg-white hover:shadow-md'
                  }`}
                    style={{height: '44px'}}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="transition-transform duration-300 group-hover:-translate-y-0.5 mr-2">
                    {tab.icon}
                  </span>
                  <span className="font-semibold tracking-wide">{tab.name}</span>
                  {isActive && (
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10"></span>
                  )}
                </Button>
              );
              })}
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel - Package Information and Data Usage */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Package Details */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Package Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-semibold text-gray-800">ANY TRIO SHINE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-semibold text-gray-800">94372298622</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Package Upgrade
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Get Extra GB
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Get Data Add-ons
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Usage Cards */}
              <div className="space-y-4">
                {dataUsage.map((usage, index) => (
                  <Card key={index} className="bg-white shadow-lg border-0">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{usage.type}</span>
                        <span className="text-sm text-gray-500">
                          {usage.used} used from {usage.total}
                        </span>
                      </div>
                      {usage.percentage > 0 && (
                        <Progress value={usage.percentage} className="h-2" />
                      )}
                      {usage.percentage === 0 && (
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-gray-300 rounded-full w-1/3"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Central Panel - Usage Meter */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-gray-600">Your speed is</span>
                      <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">NORMAL</Badge>
                      <span className="text-gray-600">right now</span>
                    </div>
                    <p className="text-gray-600 text-sm">Any Time Usage.</p>
                  </div>

                  {/* Circular Progress Meter */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-blue-600"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.37)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-blue-600">37%</div>
                      <div className="text-sm text-gray-600">REMAINING</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-800">
                      55.2 GB USED OF 87.1 GB
                    </p>
                    <p className="text-sm text-gray-600">(Valid Till: 31-Aug)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Quick Links, Promotions, Billing, VAS */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Quick Links */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {quickLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className={`h-20 flex flex-col items-center justify-center space-y-2 ${link.color} text-white hover:opacity-80`}
                      >
                        {link.icon}
                        <span className="text-xs font-medium">{link.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Promotional Banner */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative p-6 text-white h-full flex flex-col justify-between">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2 text-yellow-300">
                          SPEED BASED UNLIMITED DATA
                        </h3>
                        <p className="text-lg">Play, Learn, Work, Entertainment</p>
                      </div>
                      <div className="text-center text-sm">
                        <p>SLT-MOBITEL FIBRE</p>
                        <p>SPEED BASED Unlimited Data plans</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Billing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Payable:</span>
                    <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">Rs 0.00</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Pay Now
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Bill History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Value Added Services */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">Value Added Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {valueAddedServices.map((service, index) => (
                      <div key={index} className="text-center">
                        {service.icon}
                        <p className="text-xs text-gray-600 mt-2">{service.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Packages Tab Content */}
        {activeTab === 'packages' && (
          <CustomerPackagesTab />
        )}

        {/* Other tabs content can be added here */}
        {activeTab === 'inventory' && (
          <InventoryTab />
        )}

        {activeTab === 'qualification' && (
          <QualificationTab 
            onQualificationComplete={handleQualificationComplete} 
            user={user}
          />
        )}

        {activeTab === 'customize' && (
          <CustomerCustomizeTab />
        )}

        {activeTab === 'messages' && (
          <MessagesTab user={user} />
        )}
      </div>

      {/* New User Onboarding Popup */}
      {completeUserData && (
        <NewUserOnboardingPopup
          isOpen={showOnboardingPopup}
          onClose={handleOnboardingClose}
          user={completeUserData}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

