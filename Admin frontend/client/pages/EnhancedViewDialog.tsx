import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  Smartphone, 
  Globe, 
  Building,
  Zap,
  Router,
  Settings,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  Server,
  HardDrive,
  Cpu
} from 'lucide-react';

// Entertainment Add-ons mapping
const ENTERTAINMENT_ADDONS = {
  'netflix': 'Netflix',
  'amazon_prime': 'Amazon Prime',
  'apple_tv': 'Apple TV+',
  'peotvgo': 'PEOTVGO',
  'hulu': 'Hulu',
  'spotify': 'Spotify',
  'youtube_premium': 'YouTube Premium'
};

// Utility Functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'done': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'inProgress': return 'bg-yellow-100 text-yellow-800';
    case 'acknowledged': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Broadband': return <Wifi className="w-4 h-4" />;
    case 'Business': return <Building className="w-4 h-4" />;
    case 'Mobile': return <Smartphone className="w-4 h-4" />;
    case 'Cloud_Service': return <Globe className="w-4 h-4" />;
    default: return <Settings className="w-4 h-4" />;
  }
};

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

interface EnhancedViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConfig: any;
}

export function EnhancedViewDialog({ isOpen, onClose, selectedConfig }: EnhancedViewDialogProps) {
  if (!selectedConfig) return null;

  // Debug logging
  console.log('🔍 EnhancedViewDialog - selectedConfig:', selectedConfig);
  console.log('🔍 EnhancedViewDialog - config keys:', Object.keys(selectedConfig));

  const renderBroadbandDetails = () => {
    console.log('🔍 Rendering Broadband Details for:', selectedConfig);
    
    return (
    <div className="space-y-4">
      {/* Debug Information - Remove this in production */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-xs font-mono">
          <div><strong>Debug - Available Properties:</strong></div>
          <div>connectionType: {selectedConfig.connectionType || 'undefined'}</div>
          <div>packageType: {selectedConfig.packageType || 'undefined'}</div>
          <div>speedTier: {selectedConfig.speedTier || 'undefined'}</div>
          <div>contractTerm: {selectedConfig.contractTerm || 'undefined'}</div>
          <div>staticIP: {selectedConfig.staticIP !== undefined ? String(selectedConfig.staticIP) : 'undefined'}</div>
          <div>All keys: {Object.keys(selectedConfig).join(', ')}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getConnectionIcon(selectedConfig.connectionType)}
              <span className="text-sm font-medium">Connection Type</span>
            </div>
            <Badge variant="outline">{selectedConfig.connectionType?.replace('_', ' ') || 'Not specified'}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Package Type</span>
            </div>
            <Badge variant="secondary">{selectedConfig.packageType || 'Not specified'}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Speed Tier</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {selectedConfig.speedTier?.replace('_', ' / ') || 'Not specified'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Contract Term</span>
            </div>
            <Badge variant="outline">{selectedConfig.contractTerm?.replace('_', ' ') || 'Not specified'}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Static IP</span>
            </div>
            <Badge variant={selectedConfig.staticIP ? "default" : "secondary"}>
              {selectedConfig.staticIP ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {selectedConfig.entertainmentAddons && selectedConfig.entertainmentAddons.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Entertainment Add-ons</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedConfig.entertainmentAddons.map((addon: string) => (
                  <Badge key={addon} variant="outline" className="text-xs">
                    {ENTERTAINMENT_ADDONS[addon as keyof typeof ENTERTAINMENT_ADDONS] || addon}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special alerts for specific configurations */}
      {selectedConfig.connectionType === 'Fiber_1Gbps' && selectedConfig.packageType === 'Unlimited' && (
        <Alert className="bg-blue-50 border-blue-200">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Unlimited Entertainment Express:</strong> Includes Netflix, Amazon Prime, Apple TV+, PEOTVGO, and more streaming services.
          </AlertDescription>
        </Alert>
      )}

      {selectedConfig.packageType === 'Unlimited' && selectedConfig.staticIP && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Configuration Issue:</strong> Static IP is not available for unlimited packages as per SLT policy.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderMobileDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Data Plan</span>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              {selectedConfig.mobileDataPlan?.toUpperCase() || 'Not specified'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Voice Minutes</span>
            </div>
            <Badge variant="outline">{selectedConfig.voiceMinutes || 'Not specified'}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">SMS Count</span>
            </div>
            <Badge variant="outline">{selectedConfig.smsCount || 'Not specified'}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">Additional Services</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs">International Roaming</span>
                <Badge variant={selectedConfig.roamingEnabled ? "default" : "secondary"} className="text-xs">
                  {selectedConfig.roamingEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Call Waiting</span>
                <Badge variant={selectedConfig.callWaiting ? "default" : "secondary"} className="text-xs">
                  {selectedConfig.callWaiting ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Voice Mail</span>
                <Badge variant={selectedConfig.voiceMail ? "default" : "secondary"} className="text-xs">
                  {selectedConfig.voiceMail ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedConfig.roamingEnabled && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            International roaming charges apply based on destination country. Data usage abroad may incur additional charges.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderBusinessDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Business Type</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {selectedConfig.businessType || 'Not specified'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Contract Term</span>
            </div>
            <Badge variant="outline">{selectedConfig.contractTerm?.replace('_', ' ') || 'Not specified'}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Business Features</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs">Bandwidth Guarantee</span>
                <Badge variant={selectedConfig.bandwidthGuarantee ? "default" : "secondary"} className="text-xs">
                  {selectedConfig.bandwidthGuarantee ? 'Enabled (+15%)' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Dedicated Support</span>
                <Badge variant={selectedConfig.dedicatedSupport ? "default" : "secondary"} className="text-xs">
                  {selectedConfig.dedicatedSupport ? 'Enabled (+20%)' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Redundant Connection</span>
                <Badge variant={selectedConfig.redundantConnection ? "default" : "secondary"} className="text-xs">
                  {selectedConfig.redundantConnection ? 'Enabled (+25%)' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Business packages include enterprise-grade security, priority support, and custom solutions with SLA guarantees.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderCloudServiceDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Service Type</span>
            </div>
            <Badge className="bg-red-100 text-red-800">
              {selectedConfig.cloudServiceType || 'Not specified'}
            </Badge>
          </div>

          {selectedConfig.cloudServiceType === 'Storage' && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Storage Capacity</span>
              </div>
              <Badge variant="outline">{selectedConfig.storageCapacity?.toUpperCase() || 'Not specified'}</Badge>
            </div>
          )}

          {selectedConfig.cloudServiceType === 'Computing' && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Compute Instances</span>
                </div>
                <Badge variant="outline">{selectedConfig.computeInstances || 1}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">CPU Cores</span>
                </div>
                <Badge variant="outline">{selectedConfig.cpuCores || 2} Cores</Badge>
              </div>
            </>
          )}

          {selectedConfig.cloudServiceType === 'Hosting' && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Hosting Plan</span>
                </div>
                <Badge variant="outline">{selectedConfig.hostingPlan || 'Not specified'}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">Domain Count</span>
                </div>
                <Badge variant="outline">{selectedConfig.domainCount || 1}</Badge>
              </div>
            </>
          )}

          {selectedConfig.cloudServiceType === 'Backup' && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Backup Frequency</span>
                </div>
                <Badge variant="outline">{selectedConfig.backupFrequency || 'Daily'}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Retention Period</span>
                </div>
                <Badge variant="outline">{selectedConfig.retentionPeriod?.replace('days', ' Days') || '30 Days'}</Badge>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Service Features</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">99.9% Uptime SLA</span>
                <Badge variant="default" className="text-xs">Included</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Automated Backups</span>
                <Badge variant="outline" className="text-xs">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">24/7 Monitoring</span>
                <Badge variant="default" className="text-xs">Included</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          Cloud services include high availability, automated backups, scalable resources, and 24/7 technical support.
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getCategoryIcon(selectedConfig.category)}
            Configuration Details - {selectedConfig.category?.replace('_', ' ')}
          </DialogTitle>
          <DialogDescription>
            Detailed view of the SLT product configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusColor(selectedConfig.status || 'acknowledged')}>
                  {(selectedConfig.status || 'acknowledged').toUpperCase()}
                </Badge>
                <div className="text-sm text-gray-600">
                  ID: {selectedConfig.id}
                </div>
              </div>
              {selectedConfig.createdAt && (
                <div className="text-xs text-gray-500">
                  Created: {new Date(selectedConfig.createdAt).toLocaleString()}
                </div>
              )}
            </div>
            
            {selectedConfig.pricing && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  LKR {selectedConfig.pricing.monthlyFee?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            )}
          </div>

          {/* Pricing Information */}
          {selectedConfig.pricing && (
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-medium text-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                Pricing Information
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    LKR {selectedConfig.pricing.monthlyFee?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Monthly Fee</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    LKR {selectedConfig.pricing.setupFee?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Setup Fee</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    LKR {selectedConfig.pricing.deposit?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Security Deposit</div>
                </div>
              </div>
            </div>
          )}

          {/* Raw Data Debug Section - Remove in production */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-lg text-orange-600">
              🔍 Debug - Raw Configuration Data
            </h4>
            <div className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-64">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(selectedConfig, null, 2)}
              </pre>
            </div>
          </div>

          {/* Category-specific Configuration Details */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-lg">
              <Settings className="w-5 h-5 text-gray-600" />
              Service Configuration
            </h4>
            
            {selectedConfig.category === 'Broadband' && renderBroadbandDetails()}
            {selectedConfig.category === 'Mobile' && renderMobileDetails()}
            {selectedConfig.category === 'Business' && renderBusinessDetails()}
            {selectedConfig.category === 'Cloud_Service' && renderCloudServiceDetails()}
          </div>

          {/* Validation Results */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Validation Status
            </h4>
            {!selectedConfig.validationMessages || selectedConfig.validationMessages.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">No validation issues found - Configuration is valid</span>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedConfig.validationMessages.map((message: string, index: number) => (
                  <Alert key={index} className={message.includes('ERROR') ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                    <AlertCircle className={`h-4 w-4 ${message.includes('ERROR') ? 'text-red-600' : 'text-yellow-600'}`} />
                    <AlertDescription className={message.includes('ERROR') ? 'text-red-800' : 'text-yellow-800'}>
                      {message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}}