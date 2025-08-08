import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Wifi, 
  Router, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  sltQualificationApi, 
  type SLTQualificationRequest, 
  type SLTQualificationResponse,
  getSriLankanDistricts,
  getSriLankanProvinces,
  validateSriLankanAddress,
  validatePostalCode
} from './sltQualificationApi';

interface LocationCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQualificationComplete: (qualification: SLTQualificationResponse) => void;
}

export default function LocationCheckDialog({ 
  open, 
  onOpenChange, 
  onQualificationComplete 
}: LocationCheckDialogProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'checking' | 'results'>('form');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [qualificationResult, setQualificationResult] = useState<SLTQualificationResponse | null>(null);
  
  const { toast } = useToast();

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {};
    
    const address = formData.get('address') as string;
    const postalCode = formData.get('postalCode') as string;
    const district = formData.get('district') as string;
    const province = formData.get('province') as string;
    const serviceType = formData.get('serviceType') as string;

    if (!address || !validateSriLankanAddress(address)) {
      errors.address = 'Please enter a valid Sri Lankan address';
    }

    if (!district) {
      errors.district = 'Please select a district';
    }

    if (!province) {
      errors.province = 'Please select a province';
    }

    if (!serviceType) {
      errors.serviceType = 'Please select a service type';
    }

    if (postalCode && !validatePostalCode(postalCode)) {
      errors.postalCode = 'Postal code must be 5 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLocationCheck = async (formData: FormData) => {
    if (!validateForm(formData)) {
      return;
    }

    setIsChecking(true);
    setCurrentStep('checking');

    try {
      const data = Object.fromEntries(formData.entries());
      
      const request: SLTQualificationRequest = {
        location: {
          address: data.address as string,
          district: data.district as string,
          province: data.province as string,
          postalCode: data.postalCode as string,
        },
        requestedServices: [data.serviceType as string],
        checkFiber: data.checkFiber === 'on',
        checkADSL: data.checkADSL === 'on',
        checkMobile: data.checkMobile === 'on',
        includeAlternatives: data.includeAlternatives === 'on',
        customerType: data.customerType as 'residential' | 'business' | 'enterprise' || 'residential',
        '@type': 'SLTLocationQualification'
      };

      // Simulate API call - replace with actual API call
      const result = await simulateLocationCheck(request);
      
      setQualificationResult(result);
      setCurrentStep('results');
      onQualificationComplete(result);

      toast({
        title: "Location Check Complete",
        description: `Qualification result: ${result.qualificationResult}`,
      });

    } catch (error) {
      console.error('Error checking location:', error);
      toast({
        title: "Error",
        description: "Failed to check location availability. Please try again.",
        variant: "destructive",
      });
      setCurrentStep('form');
    } finally {
      setIsChecking(false);
    }
  };

  // Simulate location check - replace with actual API integration
  const simulateLocationCheck = async (request: SLTQualificationRequest): Promise<SLTQualificationResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const isUrbanArea = ['Colombo', 'Gampaha', 'Kandy'].includes(request.location.district);
    const fiberAvailable = isUrbanArea ? Math.random() > 0.2 : Math.random() > 0.6;
    const adslAvailable = Math.random() > 0.1;

    return {
      id: `SLT-QUAL-${Date.now()}`,
      href: `/api/qualifications/SLT-QUAL-${Date.now()}`,
      state: 'done',
      creationDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      location: request.location,
      infrastructure: {
        fiber: {
          available: fiberAvailable,
          technology: fiberAvailable ? 'FTTH' : 'N/A',
          maxSpeed: fiberAvailable ? '100 Mbps' : 'N/A',
          coverage: fiberAvailable ? 'full' : 'none',
          installationTime: fiberAvailable ? '3-5 business days' : undefined,
          monthlyFee: fiberAvailable ? 2500 : undefined
        },
        adsl: {
          available: adslAvailable,
          technology: adslAvailable ? 'ADSL2+' : 'N/A',
          maxSpeed: adslAvailable ? '16 Mbps' : 'N/A',
          lineQuality: adslAvailable ? (['excellent', 'good', 'fair'] as const)[Math.floor(Math.random() * 3)] : 'poor',
          distanceFromExchange: adslAvailable ? Math.floor(Math.random() * 3000) + 500 : undefined,
          monthlyFee: adslAvailable ? 1500 : undefined
        },
        mobile: {
          available: true,
          technologies: isUrbanArea ? ['4G', '5G'] : ['4G'],
          coverage: isUrbanArea ? 'Excellent' : 'Good',
          signalStrength: isUrbanArea ? 'excellent' : 'good'
        }
      },
      requestedServices: request.requestedServices,
      qualificationResult: (fiberAvailable || adslAvailable) ? 'qualified' : 'conditional',
      alternativeOptions: !fiberAvailable && adslAvailable ? [{
        service: 'ADSL Broadband',
        technology: 'ADSL2+',
        speed: '16 Mbps',
        monthlyFee: 1500,
        availability: 'Available'
      }] : [],
      estimatedInstallationTime: fiberAvailable ? '3-5 business days' : '1-2 business days',
      '@type': 'SLTLocationQualification'
    };
  };

  const resetDialog = () => {
    setCurrentStep('form');
    setQualificationResult(null);
    setValidationErrors({});
    setIsChecking(false);
  };

  const renderCheckingStep = () => (
    <div className="py-8 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold mb-2">Checking Location Availability</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Analyzing infrastructure and service availability...
      </p>
      <div className="space-y-2 text-left max-w-md mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          Checking fiber infrastructure...
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          Checking ADSL availability...
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          Analyzing coverage quality...
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    if (!qualificationResult) return null;

    const { infrastructure, qualificationResult: result, estimatedInstallationTime } = qualificationResult;

    return (
      <div className="space-y-6">
        {/* Overall Result */}
        <Card className={`border-2 ${
          result === 'qualified' ? 'border-green-200 bg-green-50' :
          result === 'conditional' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              {estimatedInstallationTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  <span>Estimated installation time: {estimatedInstallationTime}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Availability */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fiber */}
          <Card className={infrastructure.fiber.available ? 'border-green-200' : 'border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${infrastructure.fiber.available ? 'text-green-600' : 'text-gray-400'}`} />
                Fiber Broadband
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={infrastructure.fiber.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {infrastructure.fiber.available ? 'Available' : 'Not Available'}
                </Badge>
                {infrastructure.fiber.available && (
                  <>
                    <p className="text-sm"><strong>Technology:</strong> {infrastructure.fiber.technology}</p>
                    <p className="text-sm"><strong>Max Speed:</strong> {infrastructure.fiber.maxSpeed}</p>
                    {infrastructure.fiber.monthlyFee && (
                      <p className="text-sm"><strong>From:</strong> LKR {infrastructure.fiber.monthlyFee}/month</p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ADSL */}
          <Card className={infrastructure.adsl.available ? 'border-blue-200' : 'border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Router className={`w-4 h-4 ${infrastructure.adsl.available ? 'text-blue-600' : 'text-gray-400'}`} />
                ADSL Broadband
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={infrastructure.adsl.available ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                  {infrastructure.adsl.available ? 'Available' : 'Not Available'}
                </Badge>
                {infrastructure.adsl.available && (
                  <>
                    <p className="text-sm"><strong>Technology:</strong> {infrastructure.adsl.technology}</p>
                    <p className="text-sm"><strong>Max Speed:</strong> {infrastructure.adsl.maxSpeed}</p>
                    <p className="text-sm"><strong>Line Quality:</strong> {infrastructure.adsl.lineQuality}</p>
                    {infrastructure.adsl.monthlyFee && (
                      <p className="text-sm"><strong>From:</strong> LKR {infrastructure.adsl.monthlyFee}/month</p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mobile */}
          <Card className={infrastructure.mobile.available ? 'border-purple-200' : 'border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${infrastructure.mobile.available ? 'text-purple-600' : 'text-gray-400'}`} />
                Mobile Broadband
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={infrastructure.mobile.available ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                  {infrastructure.mobile.available ? 'Available' : 'Not Available'}
                </Badge>
                {infrastructure.mobile.available && (
                  <>
                    <p className="text-sm"><strong>Technologies:</strong> {infrastructure.mobile.technologies.join(', ')}</p>
                    <p className="text-sm"><strong>Coverage:</strong> {infrastructure.mobile.coverage}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alternative Options */}
        {qualificationResult.alternativeOptions && qualificationResult.alternativeOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alternative Service Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qualificationResult.alternativeOptions.map((option, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{option.service}</p>
                      <p className="text-sm text-muted-foreground">{option.technology} - {option.speed}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">LKR {option.monthlyFee}/month</p>
                      <Badge variant="secondary">{option.availability}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {currentStep === 'form' && 'Check Location Availability'}
            {currentStep === 'checking' && 'Checking Location...'}
            {currentStep === 'results' && 'Qualification Results'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'form' && 'Check fiber and ADSL availability for a specific location in Sri Lanka'}
            {currentStep === 'checking' && 'Please wait while we check service availability'}
            {currentStep === 'results' && 'Here are the results of your location qualification check'}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'checking' && renderCheckingStep()}
        
        {currentStep === 'results' && renderResultsStep()}

        {currentStep === 'form' && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleLocationCheck(formData);
          }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input 
                  id="address" 
                  name="address" 
                  placeholder="e.g., No. 45, Galle Road, Colombo 03" 
                  required 
                />
                {validationErrors.address && (
                  <p className="text-sm text-red-600">{validationErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select name="district" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSriLankanDistricts().map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.district && (
                    <p className="text-sm text-red-600">{validationErrors.district}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Select name="province" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSriLankanProvinces().map(province => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.province && (
                    <p className="text-sm text-red-600">{validationErrors.province}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input 
                  id="postalCode" 
                  name="postalCode" 
                  placeholder="e.g., 00300" 
                  maxLength={5}
                />
                {validationErrors.postalCode && (
                  <p className="text-sm text-red-600">{validationErrors.postalCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Requested Service *</Label>
                <Select name="serviceType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fiber Broadband">Fiber Broadband</SelectItem>
                    <SelectItem value="ADSL Broadband">ADSL Broadband</SelectItem>
                    <SelectItem value="PEO TV">PEO TV</SelectItem>
                    <SelectItem value="SLT Broadband">SLT Broadband</SelectItem>
                    <SelectItem value="Enterprise Solution">Enterprise Solution</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.serviceType && (
                  <p className="text-sm text-red-600">{validationErrors.serviceType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerType">Customer Type</Label>
                <Select name="customerType" defaultValue="residential">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="checkFiber" name="checkFiber" defaultChecked />
                  <Label htmlFor="checkFiber">Check Fiber Availability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="checkADSL" name="checkADSL" defaultChecked />
                  <Label htmlFor="checkADSL">Check ADSL Availability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="checkMobile" name="checkMobile" />
                  <Label htmlFor="checkMobile">Check Mobile Coverage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="includeAlternatives" name="includeAlternatives" defaultChecked />
                  <Label htmlFor="includeAlternatives">Include Alternative Options</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isChecking}>
                <MapPin className="w-4 h-4 mr-2" />
                Check Location
              </Button>
            </DialogFooter>
          </form>
        )}

        {currentStep === 'results' && (
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Check Another Location
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );}
