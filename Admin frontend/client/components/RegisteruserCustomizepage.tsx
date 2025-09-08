import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Loader2, 
  CheckCircle, 
  X 
} from 'lucide-react';

interface CustomPackageRequest {
  serviceType: 'fiber' | 'adsl' | 'mobile' | 'other';
  desiredSpeed: string;
  dataLimit: string;
  additionalFeatures: string[];
  notes: string;
}

interface CustomizeTabProps {
  userId: string; // Passed from parent component or auth context
  addressDetails?: { // Optional, pre-filled from qualification
    district: string;
    province: string;
    postalCode?: string;
  };
  onRequestComplete?: () => void;
}

const RegisterCustomizePage: React.FC<CustomizeTabProps> = ({ userId, addressDetails, onRequestComplete }) => {
  const { toast } = useToast();
  
  const [customRequest, setCustomRequest] = useState<CustomPackageRequest>({
    serviceType: 'fiber',
    desiredSpeed: '',
    dataLimit: '',
    additionalFeatures: [],
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Sample features for selection, aligned with CustomerPackagesTab attributes
  const availableFeatures = [
    'Unlimited Data', 'Voice Calls', 'SMS Bundle', 'International Roaming',
    'Static IP', 'Parental Controls', 'VPN Support', 'Priority Support'
  ];

  const handleInputChange = (field: keyof CustomPackageRequest, value: string) => {
    setCustomRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setCustomRequest(prev => ({
      ...prev,
      additionalFeatures: prev.additionalFeatures.includes(feature)
        ? prev.additionalFeatures.filter(f => f !== feature)
        : [...prev.additionalFeatures, feature]
    }));
  };

  const isFormValid = () => {
    return customRequest.desiredSpeed && customRequest.dataLimit && customRequest.notes;
  };

  const resetForm = () => {
    setCustomRequest({
      serviceType: 'fiber',
      desiredSpeed: '',
      dataLimit: '',
      additionalFeatures: [],
      notes: ''
    });
    setRequestSubmitted(false);
  };

  const submitCustomRequest = async () => {
    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to submit your custom package request.",
        variant: "destructive"
      });
      return;
    }

    if (!addressDetails?.district || !addressDetails?.province) {
      toast({
        title: "Address Required",
        description: "Please complete qualification first or provide address details.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data in TMF679 format, consistent with QualificationTab
      const qualificationData = {
        description: `Custom Package Request for ${customRequest.serviceType.toUpperCase()} by User ${userId}`,
        instantSyncQualification: true,
        provideAlternative: true,
        provideOnlyAvailable: false,
        provideResultReason: true,
        state: "acknowledged",
        creationDate: new Date().toISOString(),
        note: [
          {
            text: `SLT_LOCATION:${JSON.stringify({
              address: `${addressDetails.district}, ${addressDetails.province}`,
              district: addressDetails.district,
              province: addressDetails.province,
              postalCode: addressDetails.postalCode || ''
            })}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          },
          {
            text: `SLT_SERVICES:${JSON.stringify([`${customRequest.serviceType.toUpperCase()} Custom Package (Request)`])}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          },
          {
            text: `SLT_CUSTOM_DETAILS:${JSON.stringify({
              desiredSpeed: customRequest.desiredSpeed,
              dataLimit: customRequest.dataLimit,
              additionalFeatures: customRequest.additionalFeatures,
              notes: customRequest.notes
            })}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          },
          {
            text: `SLT_USER_ID:${userId}`,
            author: 'SLT System',
            date: new Date().toISOString(),
            '@type': 'Note'
          }
        ],
        channel: {},
        checkProductOfferingQualificationItem: [],
        relatedParty: [{ id: userId, role: 'customer' }],
        "@baseType": "CheckProductOfferingQualification",
        "@type": "CheckProductOfferingQualification"
      };

      // Submit to TMF679 endpoint
      const response = await fetch('/api/productOfferingQualification/v5/checkProductOfferingQualification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
          // Add auth headers if required, e.g., Authorization: Bearer token
        },
        body: JSON.stringify(qualificationData)
      });

      if (response.ok) {
        const responseData = await response.json();
        setRequestSubmitted(true);
        toast({
          title: "Request Submitted",
          description: "Your custom package request has been sent to the admin for review. It will appear in the Service Requests tab.",
        });
        
        if (onRequestComplete) onRequestComplete();
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to submit request: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting custom request:', error);
      toast({
        title: "Error",
        description: "Failed to submit custom package request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Customize Your Package</h2>
        
        {/* Info Bar similar to CustomerPackagesTab filter bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700">Request a Custom Package:</span>
            <Alert className="border-blue-200 bg-blue-50 text-blue-800 flex-1">
              <AlertDescription className="text-sm">
                🎯 As a registered customer, create a personalized service package. Specify your preferences and submit for admin review.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Custom Request Form Section */}
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Package Customization</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  Define your ideal internet package requirements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Service Type */}
            <Select 
              value={customRequest.serviceType} 
              onValueChange={(value) => handleInputChange('serviceType', value)}
            >
              <SelectTrigger className="w-full bg-blue-600 text-white border-blue-600 rounded-full">
                <SelectValue placeholder="Select Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiber">Fiber Internet</SelectItem>
                <SelectItem value="adsl">ADSL Internet</SelectItem>
                <SelectItem value="mobile">LTE/4G Mobile</SelectItem>
                <SelectItem value="other">Other/Custom</SelectItem>
              </SelectContent>
            </Select>

            {/* Desired Speed and Data Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desiredSpeed" className="text-sm font-medium text-gray-700">Desired Speed (Mbps) *</Label>
                <Input
                  id="desiredSpeed"
                  value={customRequest.desiredSpeed}
                  onChange={(e) => handleInputChange('desiredSpeed', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  placeholder="e.g., 500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataLimit" className="text-sm font-medium text-gray-700">Data Limit (GB) *</Label>
                <Input
                  id="dataLimit"
                  value={customRequest.dataLimit}
                  onChange={(e) => handleInputChange('dataLimit', e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  placeholder="e.g., Unlimited or 1000"
                />
              </div>
            </div>

            {/* Additional Features */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Additional Features</Label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map((feature) => (
                  <Badge
                    key={feature}
                    variant={customRequest.additionalFeatures.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer py-1 px-3 text-sm rounded-full"
                    onClick={() => handleFeatureToggle(feature)}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Additional Notes *</Label>
              <Textarea
                id="notes"
                value={customRequest.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 min-h-[120px]"
                placeholder="Describe any other requirements, preferences, or special requests..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="ghost" 
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-900"
              >
                Reset Form
              </Button>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-full"
                onClick={submitCustomRequest}
                disabled={!isFormValid() || isSubmitting || requestSubmitted}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : requestSubmitted ? (
                  'Request Submitted'
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Section */}
        {requestSubmitted && (
          <Card className="bg-white rounded-lg shadow-sm mt-8">
            <CardContent className="p-6">
              <div className="bg-blue-600 text-white p-6 relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                <div className="text-center relative z-10 space-y-2">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  <div className="text-2xl font-bold">Request Submitted Successfully!</div>
                  <div className="text-lg opacity-90">
                    Your custom package request has been sent for admin review.
                  </div>
                  <div className="text-sm opacity-80">
                    You will be notified once the admin processes your request.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterCustomizePage;