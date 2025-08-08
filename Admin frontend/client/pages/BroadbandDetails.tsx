import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wifi, Zap, Router, Smartphone } from 'lucide-react';

interface BroadbandDetailsProps {
  formData: any;
  setFormData: (data: any) => void;
}

// SLT Speed Tiers Configuration
const SLT_SPEED_TIERS = {
  Fiber: [
    { value: '21mbps_512kbps', label: '21 Mbps / 512 Kbps', download: 21, upload: 0.512 },
    { value: '300mbps_150mbps', label: '300 Mbps / 150 Mbps', download: 300, upload: 150 },
    { value: '100mbps_10mbps', label: '100 Mbps / 10 Mbps', download: 100, upload: 10 }
  ],
  Fiber_1Gbps: [
    { value: '1000mbps_500mbps', label: '1000 Mbps / 500 Mbps', download: 1000, upload: 500 }
  ],
  ADSL: [
    { value: '21mbps_512kbps', label: '21 Mbps / 512 Kbps', download: 21, upload: 0.512 }
  ],
  '4G_LTE': [
    { value: '100mbps_10mbps', label: '100 Mbps / 10 Mbps', download: 100, upload: 10 }
  ]
};

// SLT Entertainment Add-ons
const ENTERTAINMENT_ADDONS = [
  { id: 'netflix', name: 'Netflix', description: 'Netflix subscription included' },
  { id: 'amazon_prime', name: 'Amazon Prime', description: 'Amazon Prime Video & Music' },
  { id: 'apple_tv', name: 'Apple TV+', description: 'Apple TV+ streaming service' },
  { id: 'peotvgo', name: 'PEOTVGO', description: 'Local streaming platform' },
  { id: 'hulu', name: 'Hulu', description: 'Hulu streaming service' },
  { id: 'spotify', name: 'Spotify', description: 'Spotify Premium music' },
  { id: 'youtube_premium', name: 'YouTube Premium', description: 'Ad-free YouTube experience' }
];

export default function BroadbandDetails({ formData, setFormData }: BroadbandDetailsProps) {
  // Get available speed tiers based on connection type
  const getAvailableSpeedTiers = (connectionType: string) => {
    return SLT_SPEED_TIERS[connectionType as keyof typeof SLT_SPEED_TIERS] || [];
  };

  // Get connection type icon
  const getConnectionIcon = (connectionType: string) => {
    switch (connectionType) {
      case 'Fiber':
      case 'Fiber_1Gbps':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'ADSL':
        return <Router className="w-4 h-4 text-green-600" />;
      case '4G_LTE':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Type & Package Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="connectionType">Connection Type *</Label>
          <Select 
            value={formData.connectionType || 'Fiber'} 
            onValueChange={(value: any) => setFormData(prev => ({ 
              ...prev, 
              connectionType: value,
              speedTier: '' // Reset speed tier when connection type changes
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select connection type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fiber">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Fiber
                </div>
              </SelectItem>
              <SelectItem value="Fiber_1Gbps">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Fiber 1 Gbps
                </div>
              </SelectItem>
              <SelectItem value="ADSL">
                <div className="flex items-center gap-2">
                  <Router className="w-4 h-4 text-green-600" />
                  ADSL
                </div>
              </SelectItem>
              <SelectItem value="4G_LTE">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  4G/LTE
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="packageType">Package Type *</Label>
          <Select 
            value={formData.packageType || 'Unlimited'} 
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, packageType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select package type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Unlimited">
                <div className="flex items-center justify-between w-full">
                  <span>Unlimited</span>
                  <Badge variant="outline" className="ml-2 text-xs">Popular</Badge>
                </div>
              </SelectItem>
              <SelectItem value="Time_based">Time-based</SelectItem>
              <SelectItem value="Anytime">Anytime</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Speed Tier Selection */}
      <div className="space-y-2">
        <Label htmlFor="speedTier">Speed Tier *</Label>
        <Select 
          value={formData.speedTier || ''} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, speedTier: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select speed tier" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableSpeedTiers(formData.connectionType || 'Fiber').map((tier) => (
              <SelectItem key={tier.value} value={tier.value}>
                <div className="flex items-center justify-between w-full">
                  <span>{tier.label}</span>
                  <div className="flex items-center gap-1 ml-2">
                    {getConnectionIcon(formData.connectionType || 'Fiber')}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.speedTier && (
          <div className="text-sm text-gray-600 mt-1">
            Download: {getAvailableSpeedTiers(formData.connectionType || 'Fiber')
              .find(t => t.value === formData.speedTier)?.download} Mbps | 
            Upload: {getAvailableSpeedTiers(formData.connectionType || 'Fiber')
              .find(t => t.value === formData.speedTier)?.upload} Mbps
          </div>
        )}
      </div>

      {/* Contract Term */}
      <div className="space-y-2">
        <Label htmlFor="contractTerm">Contract Term *</Label>
        <Select 
          value={formData.contractTerm || '12_months'} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, contractTerm: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select contract term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12_months">
              <div className="flex items-center justify-between w-full">
                <span>12 Months</span>
                <Badge variant="outline" className="ml-2 text-xs">Standard</Badge>
              </div>
            </SelectItem>
            <SelectItem value="24_months">
              <div className="flex items-center justify-between w-full">
                <span>24 Months</span>
                <Badge variant="secondary" className="ml-2 text-xs">Discount</Badge>
              </div>
            </SelectItem>
            <SelectItem value="no_contract">No Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Static IP Option */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="staticIP" 
            checked={formData.staticIP || false}
            onChange={(e) => setFormData(prev => ({ ...prev, staticIP: e.target.checked }))}
            disabled={formData.packageType === 'Unlimited'}
            className="rounded"
          />
          <Label htmlFor="staticIP" className={formData.packageType === 'Unlimited' ? 'text-gray-400' : ''}>
            Static IP Address
          </Label>
          {formData.packageType === 'Unlimited' && (
            <Badge variant="destructive" className="text-xs">Not Available</Badge>
          )}
        </div>
        {formData.packageType === 'Unlimited' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Static IP option is not available for unlimited packages as per SLT policy.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Entertainment Add-ons */}
      <div className="space-y-4">
        <Label>Entertainment Add-ons</Label>
        <div className="grid grid-cols-2 gap-3">
          {ENTERTAINMENT_ADDONS.map((addon) => (
            <div key={addon.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <input 
                type="checkbox" 
                id={addon.id}
                checked={formData.entertainmentAddons?.includes(addon.id) || false}
                onChange={(e) => {
                  const currentAddons = formData.entertainmentAddons || [];
                  if (e.target.checked) {
                    setFormData(prev => ({ 
                      ...prev, 
                      entertainmentAddons: [...currentAddons, addon.id] 
                    }));
                  } else {
                    setFormData(prev => ({ 
                      ...prev, 
                      entertainmentAddons: currentAddons.filter(id => id !== addon.id) 
                    }));
                  }
                }}
                className="rounded"
              />
              <div className="flex-1">
                <Label htmlFor={addon.id} className="text-sm font-medium cursor-pointer">
                  {addon.name}
                </Label>
                <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Information Based on Selection */}
      {formData.packageType && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Package Information</Label>
          
          {formData.packageType === 'Unlimited' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Unlimited Package:</strong> No data limits, but speed may be reduced during peak hours. 
                Only available for residential customers. No ExtraGB add-ons applicable.
              </AlertDescription>
            </Alert>
          )}

          {formData.packageType === 'Time_based' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Time-based Package:</strong> Free data from 12 midnight to 7 AM. 
                Speed will be reduced to 64 Kbps after reaching daily/monthly data limits.
              </AlertDescription>
            </Alert>
          )}

          {formData.packageType === 'Anytime' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Anytime Package:</strong> Standard data allowance with consistent speeds. 
                Speed reduction to 64 Kbps after data limit. Additional data can be purchased.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Fiber 1Gbps Special Features */}
      {formData.connectionType === 'Fiber_1Gbps' && formData.packageType === 'Unlimited' && (
        <Alert className="bg-blue-50 border-blue-200">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Unlimited Entertainment Express Included:</strong> Netflix, Amazon Prime, Apple TV+, 
            PEOTVGO, Hulu, Roku TV, SriLix, YouTube, Facebook & Messenger, Instagram, TikTok, 
            WhatsApp, Viber, Imo, Botim, Spotify, Skype, Zoom, Teams
          </AlertDescription>
        </Alert>
      )}

      {/* ADSL Migration Info */}
      {formData.connectionType === 'ADSL' && formData.packageType === 'Unlimited' && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>ADSL Migration Eligibility:</strong> Unlimited packages are available for 
            ADSL connections activated more than 6 months ago.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}