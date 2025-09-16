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
    MessageSquare,
    TrendingUp,
    CreditCard,
    DollarSign,
    MoreHorizontal,
    Menu,
    Bell,
    User,
    Search,
    Globe,
    Settings,
    HelpCircle,
    Sparkles,
    ShoppingBag
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
    hoverColor: string;
}

interface ValueAddedService {
    name: string;
    color: string;
    initial: string;
    description: string;
}

export default function UserDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [activeService, setActiveService] = useState('broadband');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [qualificationCompleted, setQualificationCompleted] = useState(false);
    const [showQualificationAlert, setShowQualificationAlert] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
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
            setShowQualificationAlert(true);
            setTimeout(() => setShowQualificationAlert(false), 5000); // Hide after 5 seconds
            console.log('🚫 Tab access blocked - user is force-locked (new user)');
            return;
        }
        
        console.log('✅ Tab access granted');
        setActiveTab(tabId);
    };

    const handleQualificationComplete = () => {
        const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
        
        if (isForceLocked) {
            console.log('🎯 Manual qualification completion - unlocking all tabs');
            setQualificationCompleted(true);
            localStorage.setItem('qualification_completed', 'true');
            localStorage.removeItem('force_locked_until_manual_completion'); // Remove force lock
            // Allow access to other tabs
            setActiveTab('dashboard');
        } else {
            console.log('⚠️ Qualification completion called but user was not force-locked');
        }
    };

    const services: ServiceData[] = [
        { name: 'Mobile', icon: <Phone className="w-5 h-5" />, isActive: false },
        { name: 'Broadband', icon: <Globe className="w-5 h-5" />, isActive: true },
        { name: 'Digital TV', icon: <Smartphone className="w-5 h-5" />, isActive: false },
    ];
    
    const secondNavTabs = [
        { id: 'dashboard', name: 'Dashboard', icon: <Home className="w-4 h-4" /> },
        { id: 'packages', name: 'Packages', icon: <Package className="w-4 h-4" /> },
        { id: 'inventory', name: 'Inventory', icon: <Database className="w-4 h-4" /> },
        { id: 'qualification', name: 'Qualification', icon: <Award className="w-4 h-4" /> },
        { id: 'customize', name: 'Customize', icon: <Palette className="w-4 h-4" /> },
        { id: 'messages', name: 'Messages', icon: <MessageSquare className="w-4 h-4" /> }
    ];

    const dataUsage = [
        { 
            name: 'My Package', 
            used: '55.2', 
            total: '87.1GB', 
            color: 'from-purple-500 to-purple-600', 
            percentage: 63,
            icon: Database,
            textColor: 'text-purple-600'
        },
        { 
            name: 'Extra GB', 
            used: '0.4', 
            total: '1.0GB', 
            color: 'from-blue-500 to-blue-600', 
            percentage: 40,
            icon: TrendingUp,
            textColor: 'text-blue-600'
        },
        { 
            name: 'Bonus Data', 
            used: 'N/A', 
            total: 'N/A', 
            color: 'from-gray-400 to-gray-500', 
            percentage: 0,
            icon: Gift,
            textColor: 'text-gray-500'
        },
        { 
            name: 'Add-Ons Data', 
            used: '40.5', 
            total: '45.0GB', 
            color: 'from-indigo-500 to-indigo-600', 
            percentage: 90,
            icon: Zap,
            textColor: 'text-indigo-600'
        },
        { 
            name: 'Free Data', 
            used: 'N/A', 
            total: 'N/A', 
            color: 'from-gray-400 to-gray-500', 
            percentage: 0,
            icon: Wifi,
            textColor: 'text-gray-500'
        }
    ];

    const quickLinks = [
        { 
            name: 'New Services', 
            icon: Sparkles, 
            color: 'from-cyan-500 to-cyan-600',
            hoverColor: 'hover:from-cyan-600 hover:to-cyan-700'
        },
        { 
            name: 'Digital Life', 
            icon: Monitor, 
            color: 'from-teal-500 to-teal-600',
            hoverColor: 'hover:from-teal-600 hover:to-teal-700'
        },
        { 
            name: 'Hot Device', 
            icon: ShoppingBag, 
            color: 'from-pink-500 to-pink-600',
            hoverColor: 'hover:from-pink-600 hover:to-pink-700'
        }
        { 
            name: 'Bill', 
            icon: FileText, 
            color: 'from-orange-500 to-orange-600',
            hoverColor: 'hover:from-orange-600 hover:to-orange-700'
        },
        { 
            name: 'Complaints', 
            icon: MessageCircle, 
            color: 'from-red-500 to-red-600',
            hoverColor: 'hover:from-red-600 hover:to-red-700'
        },
        { 
            name: 'More', 
            icon: MoreHorizontal, 
            color: 'from-gray-500 to-gray-600',
            hoverColor: 'hover:from-gray-600 hover:to-gray-700'
        },
    ];

    const valueAddedServices = [
        { name: 'Duthaya', color: 'from-blue-500 to-blue-600', initial: 'D', description: 'Security' },
        { name: 'Kaspersky', color: 'from-green-500 to-green-600', initial: 'K', description: 'Antivirus' },
        { name: 'PEOTV GO', color: 'from-purple-500 to-purple-600', initial: 'PEO', description: 'Streaming' },
        { name: 'SLT Kimaki', color: 'from-red-500 to-red-600', initial: 'S', description: 'Services' },
        { name: 'Storage', color: 'from-indigo-500 to-indigo-600', initial: 'S', description: 'Cloud' }
    ];

    // Handle URL parameters and set initial tab + qualification state
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabParam = urlParams.get('tab');
        const fromSignup = urlParams.get('from') === 'signup';
        
        // Check qualification status from localStorage
        const hasCompletedQualification = localStorage.getItem('qualification_completed') === 'true';
        const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
        
        if (tabParam && secondNavTabs.some(tab => tab.id === tabParam)) {
            setActiveTab(tabParam);
            
            if (tabParam === 'qualification' && fromSignup) {
                localStorage.removeItem('qualification_completed');
                setQualificationCompleted(false);
                console.log('🔒 FORCED LOCK: New user from signup redirected to qualification tab - tabs will be locked until completion');
                localStorage.setItem('force_locked_until_manual_completion', 'true');
            } else if (tabParam === 'qualification' && !fromSignup) {
                setQualificationCompleted(hasCompletedQualification);
                console.log('✅ Existing user visiting qualification tab - no force lock applied');
            } else {
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
            if (isForceLocked) {
                const isFromSignup = urlParams.get('from') === 'signup';
                
                if (!isFromSignup) {
                    localStorage.removeItem('force_locked_until_manual_completion');
                    setQualificationCompleted(true);
                    console.log('✅ No tab parameter - existing user signing in, cleared force lock flag and allowing access to all tabs');
                } else {
                    setQualificationCompleted(false);
                    console.log('🔒 No tab parameter - user is force-locked (new user)');
                }
            } else {
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
            
            if (isForceLocked && qualificationCompleted) {
                console.log('🚨 FORCE LOCK VIOLATION: User is force-locked but tabs are unlocked! Forcing locked state.');
                setQualificationCompleted(false);
                localStorage.removeItem('qualification_completed');
                return;
            }
            
            if (activeTab === 'qualification' && !localStorageQualification && qualificationCompleted) {
                console.log('🚨 WARNING: Qualification state mismatch detected! Forcing locked state.');
                setQualificationCompleted(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTab, qualificationCompleted]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src="https://via.placeholder.com/120x40/FF6B35/FFFFFF?text=SLT+Mobitel" alt="SLT Mobitel" className="h-10" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                                <Bell className="w-5 h-5" />
                            </Button>
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
                            <Button variant="ghost" size="sm">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Service Navigation */}
            <nav className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center space-x-8 py-4">
                        {services.map((service) => (
                            <button
                                key={service.name}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                    activeService === service.name.toLowerCase() ? 'bg-white/20' : 'hover:bg-white/20'
                                } transition-all duration-300`}
                                onClick={() => setActiveService(service.name.toLowerCase())}
                            >
                                {service.icon}
                                <span className="font-semibold">{service.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Sub Navigation */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center space-x-6 py-3">
                        {secondNavTabs.map((tab) => {
                            const isForceLocked = localStorage.getItem('force_locked_until_manual_completion') === 'true';
                            const isLocked = isForceLocked && tab.id !== 'qualification';
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    disabled={isLocked}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : isLocked
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                    title={isLocked ? 'Complete qualification first' : `Go to ${tab.name}`}
                                >
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                    {isLocked && <span className="ml-1 text-xs">🔒</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Qualification Required Alert */}
            {showQualificationAlert && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                        <AlertDescription className="text-sm">
                            🔒 Please complete the qualification process first before accessing other tabs. 
                            Complete your address details and infrastructure check in the Qualification tab.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Tab Content based on activeTab state */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Quick Actions Card */}
                            <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Wifi className="w-6 h-6 text-blue-600" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                        <Zap className="w-5 h-5 mr-2" />
                                        Package Upgrade
                                    </Button>
                                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Get Extra GB
                                    </Button>
                                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Get Data Add-ons
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Data Usage Cards */}
                            <div className="space-y-4">
                                {dataUsage.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <Card key={index} className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} shadow-md`}>
                                                            <Icon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="font-semibold text-gray-800">{item.name}</span>
                                                    </div>
                                                    <span className={`text-sm font-medium ${item.textColor}`}>
                                                        {item.used} used from {item.total}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                                    <div 
                                                        className={`bg-gradient-to-r ${item.color} h-3 rounded-full transition-all duration-700 shadow-sm`}
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="mt-2 text-right">
                                                    <span className={`text-xs font-medium ${item.textColor}`}>
                                                        {item.percentage}% used
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Quick Links */}
                            <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-gray-800">Quick Links</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3">
                                        {quickLinks.map((action, index) => {
                                            const Icon = action.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    className={`flex flex-col items-center space-y-2 p-3 rounded-xl bg-gradient-to-r ${action.color} ${action.hoverColor} text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                                                >
                                                    <Icon className="w-6 h-6" />
                                                    <span className="text-xs text-center leading-tight">{action.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Billing Card */}
                            <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                        Billing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 font-medium">Total Payable:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold text-green-600">Rs 0.00</span>
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Pay Now
                                        </Button>
                                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                            <History className="w-5 h-5 mr-2" />
                                            Bill History
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Value Added Services */}
                            <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Star className="w-6 h-6 text-yellow-500" />
                                        Value Added Services
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-5 gap-3">
                                        {valueAddedServices.map((service, index) => (
                                            <div key={index} className="flex flex-col items-center space-y-2 group cursor-pointer">
                                                <div className={`bg-gradient-to-r ${service.color} text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300`}>
                                                    {service.initial}
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-xs font-medium text-gray-700 block">{service.name}</span>
                                                    <span className="text-xs text-gray-500">{service.description}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
                
                {activeTab === 'packages' && (
                    <CustomerPackagesTab />
                )}

                {activeTab === 'inventory' && (
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-white shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-gray-800">Inventory</CardTitle>
                                <CardDescription className="text-gray-600">Inventory management features coming soon...</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                {activeTab === 'qualification' && (
                    <QualificationTab onQualificationComplete={handleQualificationComplete} />
                )}

                {activeTab === 'customize' && (
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-white shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-gray-800">Customize</CardTitle>
                                <CardDescription className="text-gray-600">Customization features coming soon...</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-white shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-gray-800">Messages</CardTitle>
                                <CardDescription className="text-gray-600">Messaging features coming soon...</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}
                
                {/* Full Width Promotional Banner - placed outside the grid for full width */}
                <div className="mt-6">
                    <Card className="w-full shadow-xl border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-blue-800/90"></div>
                        <CardContent className="relative p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                                <div className="space-y-4 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <Zap className="w-8 h-8 text-yellow-400" />
                                        <h2 className="text-2xl font-bold">SPEED BASED UNLIMITED DATA</h2>
                                    </div>
                                    <p className="text-lg text-blue-100">Play, Learn, Work, Entertainment</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-blue-200">SLT-MOBITEL FIBRE</p>
                                        <p className="text-sm text-blue-200">SPEED BASED Unlimited Data plans</p>
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                        Learn More
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}