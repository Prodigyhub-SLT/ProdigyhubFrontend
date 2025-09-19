import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Search, 
  Smartphone, 
  Wifi, 
  Phone, 
  MessageSquare, 
  Signal,
  CreditCard,
  FileText,
  Plus,
  Gift,
  MapPin,
  Clock,
  Calendar,
  Star,
  Settings,
  Home,
  HelpCircle,
  Shield,
  Zap,
  Globe,
  Radio,
  Headphones,
  AlertTriangle,
  CheckCircle,
  Info,
  Tv,
  Monitor,
  Package,
  Users,
  Building
} from 'lucide-react';

const TelecomDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMainTab, setActiveMainTab] = useState('broadband');
  const [activeSubTab, setActiveSubTab] = useState('summary');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mainTabs = [
    { id: 'broadband', label: 'Broadband', icon: Wifi },
    { id: 'peotv', label: 'PEOTV', icon: Tv },
    { id: 'voice', label: 'Voice', icon: Phone },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'promotion', label: 'Promotion', icon: Gift }
  ];

  const subTabs = [
    { id: 'summary', label: 'Summary', icon: Home },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'qualification', label: 'Qualification', icon: CheckCircle },
    { id: 'customize', label: 'Customize', icon: Settings },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ];

  const quickLinks = [
    { id: 1, name: 'New Services', icon: Plus, color: 'bg-blue-500' },
    { id: 2, name: 'Digital Life', icon: Monitor, color: 'bg-green-500' },
    { id: 3, name: 'Hot Device', icon: Smartphone, color: 'bg-purple-500' },
    { id: 4, name: 'Bill', icon: FileText, color: 'bg-orange-500' },
    { id: 5, name: 'Complaints', icon: AlertTriangle, color: 'bg-red-500' },
    { id: 6, name: 'More', icon: Settings, color: 'bg-gray-500' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'warning',
      title: 'Fair Usage Policy: 80% of high-speed data used.',
      time: '2 hours ago',
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'success',
      title: 'Your International Pack is now active.',
      time: '1 day ago',
      icon: CheckCircle
    },
    {
      id: 3,
      type: 'info',
      title: 'Scheduled maintenance in your area tonight at 2 AM.',
      time: '3 days ago',
      icon: Info
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SLT</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SLTMOBITEL</h1>
                  <p className="text-xs text-gray-500">The Connection</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search"
                  className="bg-gray-100 border-0 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-0">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeMainTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sub Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-0">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeSubTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome Back John !</h2>
        </div>

        {/* Special Offer Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg p-4 text-white mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gift className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Special Offer</h3>
              <p className="text-sm opacity-90">Get 50% off on your next data package upgrade. Limit time offer</p>
            </div>
          </div>
          <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Claim Now
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'warning' ? 'bg-yellow-100' :
                        activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          activity.type === 'warning' ? 'text-yellow-600' :
                          activity.type === 'success' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* News & Updates */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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

          {/* Right Column - Quick Links */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button 
                      key={link.id}
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
