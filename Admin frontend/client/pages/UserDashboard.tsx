import React, { useState, useRef } from 'react';
import { 
  Wifi, 
  Tv, 
  Phone, 
  Smartphone, 
  Megaphone,
  Plus,
  Monitor,
  FileText,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Zap,
  Gift,
  History,
  Star,
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
  Search,
  User,
  Settings,
  Bell,
  AlertTriangle,
  Info,
  Building,
  Globe
} from 'lucide-react';

// Mock user data
const mockUser = {
  name: "John Doe",
  avatar: null,
  id: "USR001"
};

const TelecomDashboard = () => {
  const [activeService, setActiveService] = useState('broadband');
  const [activeTab, setActiveTab] = useState('summary');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profileTriggerRef = useRef(null);

  // Navigation configurations
  const services = [
    { name: 'Broadband', icon: Wifi, id: 'broadband' },
    { name: 'PEOTV', icon: Tv, id: 'peotv' },
    { name: 'Voice', icon: Phone, id: 'voice' },
    { name: 'Mobile', icon: Smartphone, id: 'mobile' },
    { name: 'Promotion', icon: Megaphone, id: 'promotion' }
  ];

  const subTabs = [
    { name: 'Summary', icon: Home, id: 'summary' },
    { name: 'Package', icon: Package, id: 'packages' },
    { name: 'Inventory', icon: Database, id: 'inventory' },
    { name: 'Qualification', icon: Award, id: 'qualification' },
    { name: 'Customize', icon: Palette, id: 'customize' },
    { name: 'Messages', icon: MessageSquare, id: 'messages' }
  ];

  // Quick Links data
  const quickLinks = [
    { name: 'New Services', icon: Plus, color: 'bg-blue-500', id: 'new-services' },
    { name: 'Digital Life', icon: Monitor, color: 'bg-green-500', id: 'digital-life' },
    { name: 'Hot Device', icon: Smartphone, color: 'bg-purple-500', id: 'hot-device' },
    { name: 'Bill', icon: FileText, color: 'bg-orange-500', id: 'bill' },
    { name: 'Complaints', icon: MessageCircle, color: 'bg-red-500', id: 'complaints' },
    { name: 'More', icon: MoreHorizontal, color: 'bg-gray-500', id: 'more' }
  ];

  // Recent Activity data
  const recentActivities = [
    {
      id: 1,
      type: 'warning',
      title: 'Fair Usage Policy: 80% of high-speed data used.',
      time: '2 hours ago',
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    {
      id: 2,
      type: 'success',
      title: 'Your International Pack is now active.',
      time: '1 day ago',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      type: 'info',
      title: 'Scheduled maintenance in your area tonight at 2 AM.',
      time: '3 days ago',
      icon: Info,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    }
  ];

  // News & Updates data
  const newsUpdates = [
    {
      id: 1,
      title: '5G Network Expansion',
      content: 'New 5G towers installed in Kandy and Galle areas',
      time: 'Today',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Holiday Offers',
      content: 'Special discounts on data packages this December',
      time: '2 days ago',
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: 'App Update Available',
      content: 'New features and bug fixes in version 3.2.1',
      time: '1 week ago',
      color: 'bg-purple-500'
    }
  ];

  // Footer sections data
  const footerSections = [
    {
      title: 'TELEPHONE',
      links: ['Fibre', 'Megaline', '4G/LTE']
    },
    {
      title: 'BROADBAND',
      links: ['New Connection', 'Packages', 'Wi-Fi', 'Hosting Services']
    },
    {
      title: 'PEO TV',
      links: ['Packages', 'Channels', 'Video on Demand']
    },
    {
      title: 'ABOUT US',
      links: ['Corporate Responsibility', 'Investors', 'Media Center', 'Careers']
    },
    {
      title: 'BUSINESS',
      links: ['Enterprises', 'SME', 'Wholesale', 'International']
    }
  ];

  // Component handlers
  const handleServiceClick = (serviceId) => {
    setActiveService(serviceId);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleQuickLinkClick = (linkId) => {
    console.log(`Navigating to ${linkId}`);
    // Add navigation logic here
  };

  // Profile Popup Component
  const ProfilePopup = () => {
    if (!showProfilePopup) return null;

    return (
      <div className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {mockUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{mockUser.name}</h3>
              <p className="text-sm text-gray-500">Premium Member</p>
            </div>
          </div>
        </div>
        <div className="p-2">
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-red-600 flex items-center space-x-2">
            <ArrowRight className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  };

  // Tab Content Components
  const SummaryContent = () => (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <h2 className="text-2xl font-bold">Hi John, Welcome to Prodigyhub</h2>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className={`p-4 rounded-lg ${activity.bgColor} flex items-start space-x-3`}>
                    <Icon className={`w-5 h-5 mt-0.5 ${activity.iconColor}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${activity.textColor}`}>{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* News & Updates */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">News & Updates</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-600 px-3 py-1 rounded">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {newsUpdates.map((news) => (
                <div key={news.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${news.color}`}></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{news.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{news.content}</p>
                    <p className="text-xs text-gray-400">{news.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button 
                  key={link.id}
                  onClick={() => handleQuickLinkClick(link.id)}
                  className={`${link.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center space-y-2`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center">{link.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const PackageContent = () => (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Management</h2>
      <p className="text-gray-600">Package management features will be implemented here.</p>
    </div>
  );

  const InventoryContent = () => (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory</h2>
      <p className="text-gray-600">Inventory management features will be implemented here.</p>
    </div>
  );

  const QualificationContent = () => (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Qualification</h2>
      <p className="text-gray-600">Service qualification features will be implemented here.</p>
    </div>
  );

  const CustomizeContent = () => (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Customize</h2>
      <p className="text-gray-600">Customization features will be implemented here.</p>
    </div>
  );

  const MessagesContent = () => (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
      <p className="text-gray-600">Messaging features will be implemented here.</p>
    </div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryContent />;
      case 'packages':
        return <PackageContent />;
      case 'inventory':
        return <InventoryContent />;
      case 'qualification':
        return <QualificationContent />;
      case 'customize':
        return <CustomizeContent />;
      case 'messages':
        return <MessagesContent />;
      default:
        return <SummaryContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SLT</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SLTMOBITEL</h1>
                  <p className="text-xs text-gray-500">The Connection</p>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search"
                  className="bg-gray-100 border-0 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              {/* User Profile */}
              <div className="relative" ref={profileTriggerRef}>
                <div 
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                >
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <ProfilePopup />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Service Navigation */}
      <nav className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-0">
            {services.map((service) => {
              const Icon = service.icon;
              const isActive = activeService === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    isActive 
                      ? 'bg-blue-900 text-white' 
                      : 'text-blue-100 hover:text-white hover:bg-blue-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{service.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sub Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-0">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-900 mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">SLT</span>
              </div>
              <span className="font-medium text-gray-900">SLT_Prodigy Hub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TelecomDashboard;
