import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Monitor, 
  Sun, 
  Moon,
  Bell,
  Shield,
  Globe,
  Palette,
  Gauge,
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  Eye,
  Zap,
  Clock,
  Volume2,
  Smartphone,
  Mail,
  MessageSquare,
  Users,
  Lock,
  Trash2  // ← ADD THIS LINE
} from 'lucide-react';

interface SettingsState {
  appearance: {
    theme: 'light' | 'dark' | 'system';
    colorScheme: 'default' | 'blue' | 'green' | 'purple';
    compactMode: boolean;
    showSidebar: boolean;
    fontSize: number;
  };
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
    orderUpdates: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
    weeklyReports: boolean;
  };
  performance: {
    autoRefresh: boolean;
    refreshInterval: number;
    enableAnimations: boolean;
    lazyLoading: boolean;
    compressionLevel: number;
    cacheSize: number;
  };
  privacy: {
    analyticsTracking: boolean;
    errorReporting: boolean;
    usageStats: boolean;
    shareWithTeam: boolean;
    publicProfile: boolean;
  };
  language: {
    locale: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
  };
  dashboard: {
    defaultView: string;
    autoOpenDashboard: boolean;
    showRecentActivity: boolean;
    showSystemHealth: boolean;
    maxRecentItems: number;
    chartAnimations: boolean;
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<SettingsState>({
    appearance: {
      theme: theme as 'light' | 'dark' | 'system' || 'system',
      colorScheme: 'default',
      compactMode: false,
      showSidebar: true,
      fontSize: 14
    },
    notifications: {
      email: true,
      push: true,
      desktop: false,
      sound: true,
      orderUpdates: true,
      systemAlerts: true,
      marketingEmails: false,
      weeklyReports: true
    },
    performance: {
      autoRefresh: true,
      refreshInterval: 30,
      enableAnimations: true,
      lazyLoading: true,
      compressionLevel: 50,
      cacheSize: 100
    },
    privacy: {
      analyticsTracking: true,
      errorReporting: true,
      usageStats: true,
      shareWithTeam: false,
      publicProfile: false
    },
    language: {
      locale: 'en-US',
      timezone: 'UTC-05:00',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'en-US'
    },
    dashboard: {
      defaultView: 'enhanced',
      autoOpenDashboard: true,
      showRecentActivity: true,
      showSystemHealth: true,
      maxRecentItems: 10,
      chartAnimations: true
    }
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings,
          appearance: {
            ...prev.appearance,
            ...parsedSettings.appearance,
            theme: theme as 'light' | 'dark' | 'system' || 'system'
          }
        }));
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    }
  }, []);

  // Sync theme with next-themes when it changes
  useEffect(() => {
    if (theme && theme !== settings.appearance.theme) {
      setSettings(prev => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          theme: theme as 'light' | 'dark' | 'system'
        }
      }));
    }
  }, [theme]);

  // Apply appearance settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.fontSize = `${settings.appearance.fontSize}px`;
    
    // Apply compact mode
    if (settings.appearance.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', settings.appearance.colorScheme);
    
  }, [settings.appearance]);

  const updateSetting = (category: keyof SettingsState, key: string, value: any) => {
    // Handle theme changes specially
    if (category === 'appearance' && key === 'theme') {
      setTheme(value);
    }
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    // Reset to default settings
    setSettings({
      appearance: {
        theme: 'system',
        colorScheme: 'default',
        compactMode: false,
        showSidebar: true,
        fontSize: 14
      },
      notifications: {
        email: true,
        push: true,
        desktop: false,
        sound: true,
        orderUpdates: true,
        systemAlerts: true,
        marketingEmails: false,
        weeklyReports: true
      },
      performance: {
        autoRefresh: true,
        refreshInterval: 30,
        enableAnimations: true,
        lazyLoading: true,
        compressionLevel: 50,
        cacheSize: 100
      },
      privacy: {
        analyticsTracking: true,
        errorReporting: true,
        usageStats: true,
        shareWithTeam: false,
        publicProfile: false
      },
      language: {
        locale: 'en-US',
        timezone: 'UTC-05:00',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US'
      },
      dashboard: {
        defaultView: 'enhanced',
        autoOpenDashboard: true,
        showRecentActivity: true,
        showSystemHealth: true,
        maxRecentItems: 10,
        chartAnimations: true
      }
    });
    setHasChanges(true);
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tmf-dashboard-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings exported",
      description: "Your settings have been downloaded as a JSON file.",
    });
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string);
            setSettings(importedSettings);
            setHasChanges(true);
            toast({
              title: "Settings imported",
              description: "Your settings have been imported successfully.",
            });
          } catch (error) {
            toast({
              title: "Import failed",
              description: "Invalid settings file format.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Customize your dashboard experience and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" disabled className="opacity-50 cursor-not-allowed">Notifications</TabsTrigger>
          <TabsTrigger value="performance" disabled className="opacity-50 cursor-not-allowed">Performance</TabsTrigger>
          <TabsTrigger value="privacy" disabled className="opacity-50 cursor-not-allowed">Privacy</TabsTrigger>
          <TabsTrigger value="dashboard" disabled className="opacity-50 cursor-not-allowed">Dashboard</TabsTrigger>
          <TabsTrigger value="advanced" disabled className="opacity-50 cursor-not-allowed">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Theme
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={settings.appearance.theme} 
                    onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select 
                    value={settings.appearance.colorScheme} 
                    onValueChange={(value) => updateSetting('appearance', 'colorScheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-gray-600">Use smaller spacing and denser layouts</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Sidebar</Label>
                    <p className="text-sm text-gray-600">Display the navigation sidebar by default</p>
                  </div>
                  <Switch
                    checked={settings.appearance.showSidebar}
                    onCheckedChange={(checked) => updateSetting('appearance', 'showSidebar', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {settings.appearance.fontSize}px</Label>
                  <Slider
                    value={[settings.appearance.fontSize]}
                    onValueChange={(value) => updateSetting('appearance', 'fontSize', value[0])}
                    max={18}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Notification Methods
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Desktop Notifications</Label>
                      <p className="text-sm text-gray-600">System desktop notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.desktop}
                      onCheckedChange={(checked) => updateSetting('notifications', 'desktop', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sound Alerts</Label>
                      <p className="text-sm text-gray-600">Play sound for notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.sound}
                      onCheckedChange={(checked) => updateSetting('notifications', 'sound', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Content Preferences
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Updates</Label>
                      <p className="text-sm text-gray-600">Notifications for order status changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.orderUpdates}
                      onCheckedChange={(checked) => updateSetting('notifications', 'orderUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Alerts</Label>
                      <p className="text-sm text-gray-600">Important system status updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-600">Product updates and promotions</p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketingEmails}
                      onCheckedChange={(checked) => updateSetting('notifications', 'marketingEmails', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-600">Summary of your activity</p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyReports}
                      onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance & Data
              </CardTitle>
              <CardDescription>
                Optimize performance and data usage settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Refresh</Label>
                    <p className="text-sm text-gray-600">Automatically refresh dashboard data</p>
                  </div>
                  <Switch
                    checked={settings.performance.autoRefresh}
                    onCheckedChange={(checked) => updateSetting('performance', 'autoRefresh', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Refresh Interval: {settings.performance.refreshInterval} seconds</Label>
                  <Slider
                    value={[settings.performance.refreshInterval]}
                    onValueChange={(value) => updateSetting('performance', 'refreshInterval', value[0])}
                    max={300}
                    min={10}
                    step={10}
                    className="w-full"
                    disabled={!settings.performance.autoRefresh}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10s</span>
                    <span>150s</span>
                    <span>300s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Animations</Label>
                    <p className="text-sm text-gray-600">Show transitions and animations</p>
                  </div>
                  <Switch
                    checked={settings.performance.enableAnimations}
                    onCheckedChange={(checked) => updateSetting('performance', 'enableAnimations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lazy Loading</Label>
                    <p className="text-sm text-gray-600">Load content as needed to improve performance</p>
                  </div>
                  <Switch
                    checked={settings.performance.lazyLoading}
                    onCheckedChange={(checked) => updateSetting('performance', 'lazyLoading', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cache Size: {settings.performance.cacheSize} MB</Label>
                  <Slider
                    value={[settings.performance.cacheSize]}
                    onValueChange={(value) => updateSetting('performance', 'cacheSize', value[0])}
                    max={500}
                    min={50}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>50 MB</span>
                    <span>275 MB</span>
                    <span>500 MB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-gray-600">Help improve the app with usage analytics</p>
                  </div>
                  <Switch
                    checked={settings.privacy.analyticsTracking}
                    onCheckedChange={(checked) => updateSetting('privacy', 'analyticsTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Error Reporting</Label>
                    <p className="text-sm text-gray-600">Automatically report errors to help fix bugs</p>
                  </div>
                  <Switch
                    checked={settings.privacy.errorReporting}
                    onCheckedChange={(checked) => updateSetting('privacy', 'errorReporting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Usage Statistics</Label>
                    <p className="text-sm text-gray-600">Share anonymous usage statistics</p>
                  </div>
                  <Switch
                    checked={settings.privacy.usageStats}
                    onCheckedChange={(checked) => updateSetting('privacy', 'usageStats', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share with Team</Label>
                    <p className="text-sm text-gray-600">Make your activity visible to team members</p>
                  </div>
                  <Switch
                    checked={settings.privacy.shareWithTeam}
                    onCheckedChange={(checked) => updateSetting('privacy', 'shareWithTeam', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-gray-600">Allow others to see your profile information</p>
                  </div>
                  <Switch
                    checked={settings.privacy.publicProfile}
                    onCheckedChange={(checked) => updateSetting('privacy', 'publicProfile', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Dashboard Preferences
              </CardTitle>
              <CardDescription>
                Customize your dashboard layout and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default View</Label>
                  <Select 
                    value={settings.dashboard.defaultView} 
                    onValueChange={(value) => updateSetting('dashboard', 'defaultView', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Standard Dashboard</SelectItem>
                      <SelectItem value="enhanced">Enhanced Dashboard</SelectItem>
                      <SelectItem value="catalog">Product Catalog</SelectItem>
                      <SelectItem value="ordering">Product Ordering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Recent Items: {settings.dashboard.maxRecentItems}</Label>
                  <Slider
                    value={[settings.dashboard.maxRecentItems]}
                    onValueChange={(value) => updateSetting('dashboard', 'maxRecentItems', value[0])}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-open Dashboard</Label>
                    <p className="text-sm text-gray-600">Open dashboard automatically on login</p>
                  </div>
                  <Switch
                    checked={settings.dashboard.autoOpenDashboard}
                    onCheckedChange={(checked) => updateSetting('dashboard', 'autoOpenDashboard', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Recent Activity</Label>
                    <p className="text-sm text-gray-600">Display recent activity in sidebar</p>
                  </div>
                  <Switch
                    checked={settings.dashboard.showRecentActivity}
                    onCheckedChange={(checked) => updateSetting('dashboard', 'showRecentActivity', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show System Health</Label>
                    <p className="text-sm text-gray-600">Display system status indicators</p>
                  </div>
                  <Switch
                    checked={settings.dashboard.showSystemHealth}
                    onCheckedChange={(checked) => updateSetting('dashboard', 'showSystemHealth', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Chart Animations</Label>
                    <p className="text-sm text-gray-600">Animate charts and graphs</p>
                  </div>
                  <Switch
                    checked={settings.dashboard.chartAnimations}
                    onCheckedChange={(checked) => updateSetting('dashboard', 'chartAnimations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration and data management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Language & Region</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={settings.language.locale} 
                      onValueChange={(value) => updateSetting('language', 'locale', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                        <SelectItem value="fr-FR">Français</SelectItem>
                        <SelectItem value="de-DE">Deutsch</SelectItem>
                        <SelectItem value="ja-JP">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={settings.language.timezone} 
                      onValueChange={(value) => updateSetting('language', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-12:00">UTC-12:00</SelectItem>
                        <SelectItem value="UTC-08:00">UTC-08:00 (PST)</SelectItem>
                        <SelectItem value="UTC-05:00">UTC-05:00 (EST)</SelectItem>
                        <SelectItem value="UTC+00:00">UTC+00:00 (GMT)</SelectItem>
                        <SelectItem value="UTC+01:00">UTC+01:00 (CET)</SelectItem>
                        <SelectItem value="UTC+09:00">UTC+09:00 (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Settings Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={exportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  <Button variant="outline" onClick={importSettings}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Cache & Storage</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Clear Application Cache</p>
                    <p className="text-sm text-gray-600">
                      This will clear all cached data and may improve performance
                    </p>
                  </div>
                  <Button variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
