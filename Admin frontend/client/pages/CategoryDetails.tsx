import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Settings, Smartphone, Globe, Building } from 'lucide-react';

// Import the Broadband Details component
import BroadbandDetails from './BroadbandDetails';

interface CategoryDetailsProps {
  category: string;
  formData: any;
  setFormData: (data: any) => void;
}

// Business Types
const BUSINESS_TYPES = [
  { value: 'SME', label: 'Small & Medium Enterprise', description: 'Up to 250 employees' },
  { value: 'Enterprise', label: 'Enterprise', description: '250-1000 employees' },
  { value: 'Corporate', label: 'Corporate', description: '1000+ employees' }
];

// Mobile Data Plans
const MOBILE_DATA_PLANS = [
  { value: '5gb', label: '5 GB Data Plan', data: 5, price: 1299 },
  { value: '15gb', label: '15 GB Data Plan', data: 15, price: 2299 },
  { value: '30gb', label: '30 GB Data Plan', data: 30, price: 3799 },
  { value: 'unlimited', label: 'Unlimited Data Plan', data: -1, price: 4999 }
];

// Cloud Service Types
const CLOUD_SERVICE_TYPES = [
  { value: 'Storage', label: 'Cloud Storage', description: 'Secure file storage and backup' },
  { value: 'Computing', label: 'Cloud Computing', description: 'Virtual machines and processing power' },
  { value: 'Hosting', label: 'Web Hosting', description: 'Website and application hosting' },
  { value: 'Backup', label: 'Backup Services', description: 'Automated data backup solutions' }
];

// Business Details Component
function BusinessDetails({ formData, setFormData }: { formData: any; setFormData: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Business Solutions Configuration</h3>
        <p className="text-gray-600">Enterprise-grade connectivity and services</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type *</Label>
        <Select 
          value={formData.businessType || 'SME'} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, businessType: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Business Features</Label>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input 
              type="checkbox" 
              id="bandwidthGuarantee" 
              checked={formData.bandwidthGuarantee || false}
              onChange={(e) => setFormData(prev => ({ ...prev, bandwidthGuarantee: e.target.checked }))}
              className="rounded"
            />
            <div className="flex-1">
              <Label htmlFor="bandwidthGuarantee" className="font-medium cursor-pointer">
                Bandwidth Guarantee
              </Label>
              <p className="text-sm text-gray-500">SLA-backed bandwidth commitment</p>
            </div>
            <Badge variant="outline">+15%</Badge>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input 
              type="checkbox" 
              id="dedicatedSupport" 
              checked={formData.dedicatedSupport || false}
              onChange={(e) => setFormData(prev => ({ ...prev, dedicatedSupport: e.target.checked }))}
              className="rounded"
            />
            <div className="flex-1">
              <Label htmlFor="dedicatedSupport" className="font-medium cursor-pointer">
                Dedicated Support
              </Label>
              <p className="text-sm text-gray-500">24/7 priority technical support</p>
            </div>
            <Badge variant="outline">+20%</Badge>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input 
              type="checkbox" 
              id="redundantConnection" 
              checked={formData.redundantConnection || false}
              onChange={(e) => setFormData(prev => ({ ...prev, redundantConnection: e.target.checked }))}
              className="rounded"
            />
            <div className="flex-1">
              <Label htmlFor="redundantConnection" className="font-medium cursor-pointer">
                Redundant Connection
              </Label>
              <p className="text-sm text-gray-500">Backup connection for failover</p>
            </div>
            <Badge variant="outline">+25%</Badge>
          </div>
        </div>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Business packages include enterprise-grade security, priority support, and custom solutions.
          All business services come with dedicated account management and SLA guarantees.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Mobile Details Component
function MobileDetails({ formData, setFormData }: { formData: any; setFormData: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Mobile Services Configuration</h3>
        <p className="text-gray-600">Mobile data plans and voice services</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobileDataPlan">Data Plan *</Label>
        <Select 
          value={formData.mobileDataPlan || ''} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, mobileDataPlan: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select data plan" />
          </SelectTrigger>
          <SelectContent>
            {MOBILE_DATA_PLANS.map((plan) => (
              <SelectItem key={plan.value} value={plan.value}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{plan.label}</div>
                    <div className="text-sm text-gray-500">LKR {plan.price}/month</div>
                  </div>
                  {plan.data === -1 ? (
                    <Badge className="ml-2">Unlimited</Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2">{plan.data} GB</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="voiceMinutes">Voice Minutes</Label>
          <Select 
            value={formData.voiceMinutes || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, voiceMinutes: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select minutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500">500 Minutes</SelectItem>
              <SelectItem value="1000">1000 Minutes</SelectItem>
              <SelectItem value="unlimited">Unlimited Minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="smsCount">SMS Count</Label>
          <Select 
            value={formData.smsCount || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, smsCount: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select SMS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="200">200 SMS</SelectItem>
              <SelectItem value="500">500 SMS</SelectItem>
              <SelectItem value="unlimited">Unlimited SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Additional Services</Label>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input 
              type="checkbox" 
              id="roamingEnabled" 
              checked={formData.roamingEnabled || false}
              onChange={(e) => setFormData(prev => ({ ...prev, roamingEnabled: e.target.checked }))}
              className="rounded"
            />
            <div className="flex-1">
              <Label htmlFor="roamingEnabled" className="font-medium cursor-pointer">
                International Roaming
              </Label>
              <p className="text-sm text-gray-500">Use your plan while traveling abroad</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input 
              type="checkbox" 
              id="callWaiting" 
              checked={formData.callWaiting || false}
              onChange={(e) => setFormData(prev => ({ ...prev, callWaiting: e.target.checked }))}
              className="rounded"
            />
            <div className="flex-1">
              <Label htmlFor="callWaiting" className="font-medium cursor-pointer">
                Call Waiting
              </Label>
              <p className="text-sm text-gray-500">Receive calls while on another call</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input 
              type="checkbox" 
              id="voiceMail" 
              checked={formData.voiceMail || false}
              onChange={(e) => setFormData(prev => ({ ...prev, voiceMail: e.target.checked }))}
              className="rounded"
            />
            <div className="flex-1">
              <Label htmlFor="voiceMail" className="font-medium cursor-pointer">
                Voice Mail
              </Label>
              <p className="text-sm text-gray-500">Voicemail service for missed calls</p>
            </div>
          </div>
        </div>
      </div>

      {formData.roamingEnabled && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            International roaming charges apply based on destination country. 
            Data usage abroad may incur additional charges.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Cloud Service Details Component
function CloudServiceDetails({ formData, setFormData }: { formData: any; setFormData: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Cloud Services Configuration</h3>
        <p className="text-gray-600">Cloud hosting, storage, and computing services</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cloudServiceType">Service Type *</Label>
        <Select 
          value={formData.cloudServiceType || 'Storage'} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, cloudServiceType: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {CLOUD_SERVICE_TYPES.map((service) => (
              <SelectItem key={service.value} value={service.value}>
                <div>
                  <div className="font-medium">{service.label}</div>
                  <div className="text-sm text-gray-500">{service.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {formData.cloudServiceType === 'Storage' && (
        <div className="space-y-2">
          <Label htmlFor="storageCapacity">Storage Capacity *</Label>
          <Select 
            value={formData.storageCapacity || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, storageCapacity: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select storage capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100gb">100 GB - LKR 2,500/month</SelectItem>
              <SelectItem value="500gb">500 GB - LKR 10,000/month</SelectItem>
              <SelectItem value="1tb">1 TB - LKR 18,000/month</SelectItem>
              <SelectItem value="5tb">5 TB - LKR 75,000/month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {formData.cloudServiceType === 'Computing' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="computeInstances">Compute Instances *</Label>
            <Input
              type="number"
              value={formData.computeInstances || 1}
              onChange={(e) => setFormData(prev => ({ ...prev, computeInstances: parseInt(e.target.value) || 1 }))}
              min="1"
              max="10"
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpuCores">CPU Cores per Instance</Label>
            <Select 
              value={formData.cpuCores || '2'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, cpuCores: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Cores</SelectItem>
                <SelectItem value="4">4 Cores</SelectItem>
                <SelectItem value="8">8 Cores</SelectItem>
                <SelectItem value="16">16 Cores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {formData.cloudServiceType === 'Hosting' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hostingPlan">Hosting Plan *</Label>
            <Select 
              value={formData.hostingPlan || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hostingPlan: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hosting plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared Hosting - LKR 1,500/month</SelectItem>
                <SelectItem value="vps">VPS Hosting - LKR 8,000/month</SelectItem>
                <SelectItem value="dedicated">Dedicated Server - LKR 25,000/month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domainCount">Number of Domains</Label>
            <Input
              type="number"
              value={formData.domainCount || 1}
              onChange={(e) => setFormData(prev => ({ ...prev, domainCount: parseInt(e.target.value) || 1 }))}
              min="1"
              placeholder="1"
            />
          </div>
        </div>
      )}

      {formData.cloudServiceType === 'Backup' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backupFrequency">Backup Frequency *</Label>
            <Select 
              value={formData.backupFrequency || 'daily'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, backupFrequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Backup</SelectItem>
                <SelectItem value="daily">Daily Backup</SelectItem>
                <SelectItem value="weekly">Weekly Backup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retentionPeriod">Retention Period</Label>
            <Select 
              value={formData.retentionPeriod || '30days'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, retentionPeriod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Days</SelectItem>
                <SelectItem value="30days">30 Days</SelectItem>
                <SelectItem value="90days">90 Days</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Label>Cloud Service Features</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <span className="font-medium">99.9% Uptime SLA</span>
              <p className="text-sm text-gray-500">Guaranteed service availability</p>
            </div>
            <Badge variant="outline">Included</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <span className="font-medium">Automated Backups</span>
              <p className="text-sm text-gray-500">Daily automated data backups</p>
            </div>
            <Badge variant="outline">Available</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <span className="font-medium">24/7 Monitoring</span>
              <p className="text-sm text-gray-500">Continuous system monitoring</p>
            </div>
            <Badge variant="outline">Included</Badge>
          </div>
        </div>
      </div>

      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          Cloud service features include high availability, automated backups, and scalable resources.
          All services include 24/7 monitoring and technical support.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Main CategoryDetails Component
export default function CategoryDetails({ category, formData, setFormData }: CategoryDetailsProps) {
  switch (category) {
    case 'Broadband':
      return <BroadbandDetails formData={formData} setFormData={setFormData} />;
    
    case 'Business':
      return <BusinessDetails formData={formData} setFormData={setFormData} />;
    
    case 'Mobile':
      return <MobileDetails formData={formData} setFormData={setFormData} />;
    
    case 'Cloud_Service':
      return <CloudServiceDetails formData={formData} setFormData={setFormData} />;
    
    default:
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Category Configuration</h3>
          <p className="text-gray-600 mb-4">
            Please select a category to configure specific options.
          </p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configuration options will appear here based on your category selection.
            </AlertDescription>
          </Alert>
        </div>
      );
  }
}