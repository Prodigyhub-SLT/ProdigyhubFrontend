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
  const [qualificationCompleted, setQualificationCompleted] = useState(false);
  const [showQualificationAlert, setShowQualificationAlert] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const profileTriggerRef = useRef<HTMLDivElement>(null);
  
  // Debug log for initial state
  console.log('🚀 UserDashboard mounted with initial state:', { 
    qualificationCompleted, 
    activeTab,
    urlSearch: location.search
  });
  




  const handleTabClick = (tabId: string) => {
    console.log('🔍 Tab click attempt:', { tabId, qualificationCompleted, currentTab: activeTab });
    
    // Double-check qualification state from localStorage
    const localStorageQualification = localStorage.getItem('qualification_completed') === 'true';
    const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
    console.log('🔍 localStorage check:', { localStorageQualification, qualificationCompleted, isForceLocked });
    
    // Only block access if user is force-locked (new user)
    if (isForceLocked && tabId !== 'qualification') {
      // Show message that qualification must be completed first
      setShowQualificationAlert(true);
      setTimeout(() => setShowQualificationAlert(false), 5000); // Hide after 5 seconds
      console.log('🚫 Tab access blocked - user is force-locked (new user)');
      return;
    }
    
    console.log('✅ Tab access granted');
    setActiveTab(tabId);
  };

  const handleQualificationComplete = () => {
    // Check if user is force-locked
    const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
    
    if (isForceLocked) {
      console.log('🎯 Manual qualification completion - unlocking all tabs');
      setQualificationCompleted(true);
      localStorage.setItem('qualification_completed', 'true');
      localStorage.removeItem('force_locked_until_manual_completion'); // Remove force lock
      // Allow access to other tabs
      setActiveTab('summary');
    } else {
      console.log('⚠️ Qualification completion called but user was not force-locked');
    }
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
    if (userNeedsOnboarding) {
      // Don't allow closing if user still needs onboarding
      return;
    }
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

  // Tab configuration for second navigation bar
  const secondNavTabs = [
    { id: 'summary', name: 'Summary', icon: <Home className="w-4 h-4" /> },
    { id: 'packages', name: 'Packages', icon: <Package className="w-4 h-4" /> },
    { id: 'inventory', name: 'Inventory', icon: <Database className="w-4 h-4" /> },
    { id: 'qualification', name: 'Qualification', icon: <Award className="w-4 h-4" /> },
    { id: 'customize', name: 'Customize', icon: <Palette className="w-4 h-4" /> },
    { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  // Check if user needs onboarding (new Google users without profile details)
  useEffect(() => {
    const checkUserOnboardingStatus = async () => {
      if (!user || !user.uid) return;

      // Only check for Google authenticated users
      if (user.authMethod === 'google') {
        try {
          const backendURL = import.meta.env.VITE_API_BASE_URL || 'https://prodigyhub.onrender.com';
          console.log('🔍 Checking onboarding status for Google user:', user.uid);
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
            
            // Check if user has completed onboarding
            const hasUserDetails = userData.firstName && userData.lastName && userData.phoneNumber && userData.nic;
            const hasAddressDetails = userData.address && 
                                    userData.address.street && 
                                    userData.address.city && 
                                    userData.address.district && 
                                    userData.address.province;
            
            const needsOnboarding = !userData.onboardingCompleted || !hasUserDetails || !hasAddressDetails;
            
            console.log('🔍 Onboarding check details:', {
              onboardingCompleted: userData.onboardingCompleted,
              hasUserDetails,
              hasAddressDetails,
              needsOnboarding
            });
            
            if (needsOnboarding) {
              console.log('🆕 New Google user needs onboarding');
              setUserNeedsOnboarding(true);
              setShowOnboardingPopup(true);
            } else {
              console.log('✅ Google user has completed onboarding');
              setUserNeedsOnboarding(false);
            }
          } else {
            // User not found in MongoDB, needs onboarding
            console.log('🆕 Google user not found in database (status:', response.status, '), needs onboarding');
            setUserNeedsOnboarding(true);
            setShowOnboardingPopup(true);
          }
        } catch (error) {
          console.error('❌ Error checking user onboarding status:', error);
          // On error, assume user needs onboarding for safety
          console.log('⚠️ Falling back to showing onboarding popup due to error');
          setUserNeedsOnboarding(true);
          setShowOnboardingPopup(true);
        }
      }
    };

    checkUserOnboardingStatus();
  }, [user]);

  // Handle URL parameters and set initial tab + qualification state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    const fromSignup = urlParams.get('from') === 'signup';
    
    // Check qualification status from localStorage
    const hasCompletedQualification = localStorage.getItem('qualification_completed') === 'true';
    const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
    
    if (tabParam && ['summary', 'packages', 'inventory', 'qualification', 'customize', 'messages'].includes(tabParam)) {
      setActiveTab(tabParam);
      
      // Only apply force lock for NEW users coming from signup
      if (tabParam === 'qualification' && fromSignup) {
        // FORCE LOCKED STATE for new users coming to qualification tab from signup
        localStorage.removeItem('qualification_completed');
        setQualificationCompleted(false);
        console.log('🔒 FORCED LOCK: New user from signup redirected to qualification tab - tabs will be locked until completion');
        
        // Add a flag to prevent any automatic unlocking
        localStorage.setItem('force_locked_until_manual_completion', 'true');
      } else if (tabParam === 'qualification' && !fromSignup) {
        // Existing user visiting qualification tab - don't force lock
        setQualificationCompleted(hasCompletedQualification);
        console.log('✅ Existing user visiting qualification tab - no force lock applied');
      } else {
        // Other tabs - respect existing qualification state
        setQualificationCompleted(hasCompletedQualification);
        if (hasCompletedQualification) {
          console.log('✅ User accessing other tab with completed qualification');
        } else if (isForceLocked) {
          console.log('🔒 User accessing other tab but is force-locked (new user)');
        } else {
          console.log('🔒 User accessing other tab without completed qualification - will be blocked');
        }
      }
    } else {
      // No tab parameter - check if user is force-locked (new user) or existing user
      if (isForceLocked) {
        // Check if this is actually a new user or an existing user with stale flag
        // If user has no from=signup parameter, they're an existing user signing in
        const isFromSignup = urlParams.get('from') === 'signup';
        
        if (!isFromSignup) {
          // Existing user signing in - clear the force lock flag and allow access
          localStorage.removeItem('force_locked_until_manual_completion');
          setQualificationCompleted(true);
          console.log('✅ No tab parameter - existing user signing in, cleared force lock flag and allowing access to all tabs');
        } else {
          // User is force-locked (new user) - keep tabs locked
          setQualificationCompleted(false);
          console.log('🔒 No tab parameter - user is force-locked (new user)');
        }
      } else {
        // Existing user - allow access to all tabs regardless of qualification status
        setQualificationCompleted(true);
        console.log('✅ No tab parameter - existing user, allowing access to all tabs');
      }
    }
  }, [location.search]);

  // Monitor qualification state changes
  useEffect(() => {
    console.log('🔄 Qualification state changed:', { 
      qualificationCompleted, 
      activeTab,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack
    });
  }, [qualificationCompleted, activeTab]);

  // Periodic check to ensure qualification state is correct for new users
  useEffect(() => {
    const interval = setInterval(() => {
      const localStorageQualification = localStorage.getItem('qualification_completed') === 'true';
      const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
      
      // If user is force-locked, ensure tabs stay locked regardless of other state
      if (isForceLocked && qualificationCompleted) {
        console.log('🚨 FORCE LOCK VIOLATION: User is force-locked but tabs are unlocked! Forcing locked state.');
        setQualificationCompleted(false);
        localStorage.removeItem('qualification_completed'); // Remove any qualification completion
        return;
      }
      
      // If we're on qualification tab and localStorage says not completed, ensure state is locked
      if (activeTab === 'qualification' && !localStorageQualification && qualificationCompleted) {
        console.log('🚨 WARNING: Qualification state mismatch detected! Forcing locked state.');
        setQualificationCompleted(false);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [activeTab, qualificationCompleted]);













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
          <div className="flex items-center space-x-2 h-full">
            {services.map((service) => (
              <Button
                key={service.name}
                variant={service.isActive ? "default" : "outline"}
                className={`group relative overflow-hidden px-6 rounded-full transition-all duration-300 ${
                  service.isActive 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                    : 'text-gray-700 bg-white/60 border border-gray-200 hover:bg-white hover:shadow-md'
                }`}
                style={{height: '40px'}}
                onClick={() => setActiveService(service.name.toLowerCase())}
              >
                <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                  {service.icon}
                </span>
                <span className="ml-2 font-semibold tracking-wide">{service.name}</span>
                {service.isActive && (
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10"></span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/70 backdrop-blur shadow-md border-b" style={{height: '64px'}}>
        <div className="px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center space-x-2 h-full">
            {secondNavTabs.map((tab) => {
              const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
              const isLocked = isForceLocked && tab.id !== 'qualification';
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "outline"}
                  className={`group relative overflow-hidden px-6 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      : isLocked
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100/60 border border-gray-200'
                      : 'text-gray-700 bg-white/60 border border-gray-200 hover:bg-white hover:shadow-md'
                  }`}
                  style={{height: '40px'}}
                  onClick={() => handleTabClick(tab.id)}
                  disabled={isLocked}
                >
                  <span className="transition-transform duration-300 group-hover:-translate-y-0.5 mr-2">
                    {tab.icon}
                  </span>
                  <span className="font-semibold tracking-wide">{tab.name}</span>
                  {isLocked && <span className="ml-2 text-xs">🔒</span>}
                  {isActive && (
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10"></span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Qualification Required Alert */}
      {showQualificationAlert && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Alert className="border-orange-200 bg-orange-50 text-orange-800">
            <AlertDescription className="text-sm">
              🔒 Please complete the qualification process first before accessing other tabs. 
              Complete your address details and infrastructure check in the Qualification tab.
            </AlertDescription>
          </Alert>
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
      {user && (
        <NewUserOnboardingPopup
          isOpen={showOnboardingPopup}
          onClose={handleOnboardingClose}
          user={user}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

