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
  Zap, 
  Globe, 
  Signal, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  CustomizeIcon // Assuming you have a custom icon or use lucide-react's Settings or similar
} from 'lucide-react';

interface CustomPackageRequest {
  serviceType: 'fiber' | 'adsl' | 'mobile' | 'other';
  desiredSpeed: string;
  dataLimit: string;
  additionalFeatures: string[];
  notes: string;
  // Assuming user is registered, we can fetch or pass userId/address from context or props
}

interface CustomizeTabProps {
  userId: string; // Passed from parent component or auth context
  addressDetails?: { // Optional, if pre-filled from qualification
    district: string;
    province: string;
    postalCode?: string;
  };
  onRequestComplete?: () => void;
}

export function RegisterCustomizePage({ userId, addressDetails, onRequestComplete }: CustomizeTabProps) {
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

  // Sample features for selection
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
      // Prepare data in TMF679 format, similar to QualificationTab
      const qualificationData = {
        description: `Custom Package Request for ${customRequest.serviceType.toUpperCase()} by User ${userId}`,
        instantSyncQualification: true,
        provideAlternative: true, // Allow alternatives for custom requests
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

      // Use the TMF679 endpoint for creating qualification requests, as in QualificationTab
      const response = await fetch('/api/productOfferingQualification/v5/checkProductOfferingQualification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
          // Add auth headers if needed for registered users, e.g., Authorization: Bearer token
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
        
        // Optionally call onRequestComplete to update parent state or navigate
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <AlertDescription className="text-sm">
          🎯 <strong>Customize Your Package:</strong> As a registered customer, request personalized service packages. Fill in your preferences and submit for admin approval.
        </AlertDescription>
      </Alert>
      
      {/* Custom Request Form Section */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Custom Package Request
          </CardTitle>
          <CardDescription className="text-gray-600">
            Tell us your requirements for a tailored internet package
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-gray-700">Service Type *</Label>
            <Select
              value={customRequest.serviceType}
              onValueChange={(value) => handleInputChange('serviceType', value)}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiber">Fiber Internet</SelectItem>
                <SelectItem value="adsl">ADSL Internet</SelectItem>
                <SelectItem value="mobile">LTE/4G Mobile</SelectItem>
                <SelectItem value="other">Other/Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desired Speed and Data Limit */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desiredSpeed" className="text-gray-700">Desired Speed (Mbps) *</Label>
              <Input
                id="desiredSpeed"
                value={customRequest.desiredSpeed}
                onChange={(e) => handleInputChange('desiredSpeed', e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataLimit" className="text-gray-700">Data Limit (GB) *</Label>
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
            <Label className="text-gray-700">Additional Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableFeatures.map((feature) => (
                <Badge
                  key={feature}
                  variant={customRequest.additionalFeatures.includes(feature) ? "default" : "outline"}
                  className="cursor-pointer py-2 px-3 text-sm"
                  onClick={() => handleFeatureToggle(feature)}
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700">Additional Notes *</Label>
            <Textarea
              id="notes"
              value={customRequest.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 min-h-[100px]"
              placeholder="Describe any other requirements or preferences..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
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
                'Submit Custom Request'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Section - Show after submission */}
      {requestSubmitted && (
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="space-y-6 pt-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-700 mb-2">
                  ✅ Request Submitted Successfully!
                </div>
                <p className="text-green-700 text-lg">
                  Your custom package request has been sent to the admin. You will be notified once it's reviewed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}