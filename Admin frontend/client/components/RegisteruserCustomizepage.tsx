import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Label,
  Alert,
  AlertDescription,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/alert';
import { 
  Package, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  MapPin,
  Phone,
  Calendar,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

// Types for the customize request
interface CustomizeRequest {
  id?: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    province: string;
  };
  packageRequirements: {
    serviceType: string;
    bandwidth: string;
    duration: string;
    additionalServices: string[];
    specialRequirements: string;
  };
  businessInfo?: {
    companyName?: string;
    businessType?: string;
    expectedUsers?: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  requestDate: string;
  adminNotes?: string;
  estimatedPrice?: number;
  estimatedDelivery?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  district?: string;
  province?: string;
}

const RegisterCustomizePage: React.FC = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<CustomizeRequest[]>([]);
  const [activeTab, setActiveTab] = useState('new-request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    serviceType: '',
    bandwidth: '',
    duration: '',
    additionalServices: [] as string[],
    specialRequirements: '',
    companyName: '',
    businessType: '',
    expectedUsers: ''
  });

  // Available options
  const serviceTypes = [
    'ADSL',
    'Fiber Optic',
    'LTE',
    '5G',
    'Satellite',
    'Enterprise Solutions',
    'Custom Package'
  ];

  const bandwidthOptions = [
    '1 Mbps',
    '5 Mbps',
    '10 Mbps',
    '25 Mbps',
    '50 Mbps',
    '100 Mbps',
    '200 Mbps',
    '500 Mbps',
    '1 Gbps',
    'Custom Bandwidth'
  ];

  const durationOptions = [
    '1 Month',
    '3 Months',
    '6 Months',
    '12 Months',
    '24 Months',
    '36 Months',
    'Custom Duration'
  ];

  const additionalServicesOptions = [
    'Static IP',
    'Email Hosting',
    'Web Hosting',
    'Domain Registration',
    'Cloud Storage',
    'VPN Service',
    'Technical Support 24/7',
    'Installation Service',
    'Equipment Rental'
  ];

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Load user data and requests on component mount
  useEffect(() => {
    loadUserData();
    loadCustomizeRequests();
  }, []);

  // Load current user data
  const loadUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) throw new Error('Failed to load user data');
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError('Failed to load user information');
    }
  };

  // Load customize requests
  const loadCustomizeRequests = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      // Using TMF622 Product Ordering Management API
      const response = await fetch(`${API_BASE_URL}/productOrderingManagement/v4/productOrder?customerId=${userId}`);
      if (!response.ok) throw new Error('Failed to load requests');
      
      const data = await response.json();
      setRequests(data.filter((order: any) => order.orderType === 'customize_request'));
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle additional services selection
  const toggleAdditionalService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  // Submit customize request
  const submitCustomizeRequest = async () => {
    if (!user) {
      setError('User information not available');
      return;
    }

    if (!formData.serviceType || !formData.bandwidth || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First, check location qualification
      const qualificationResponse = await fetch(`${API_BASE_URL}/api/slt/checkLocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: user.address,
          district: user.district,
          province: user.province
        })
      });

      const qualificationData = await qualificationResponse.json();

      // Create product order using TMF622
      const orderData = {
        externalId: `CUSTOMIZE_${Date.now()}`,
        priority: '1',
        description: `Customize Package Request - ${formData.serviceType}`,
        category: 'customize_request',
        state: 'acknowledged',
        orderDate: new Date().toISOString(),
        requestedStartDate: new Date().toISOString(),
        requestedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        relatedParty: [{
          id: user.id,
          name: user.name,
          role: 'customer',
          '@type': 'Individual'
        }],
        orderItem: [{
          id: '1',
          quantity: 1,
          action: 'add',
          state: 'acknowledged',
          productOffering: {
            id: 'CUSTOMIZE_PACKAGE',
            name: `${formData.serviceType} - ${formData.bandwidth}`,
            description: 'Customer Customize Package Request'
          },
          product: {
            name: `Customize Package for ${user.name}`,
            description: formData.specialRequirements,
            productSpecification: {
              id: 'CUSTOMIZE_SPEC',
              name: 'Customize Package Specification',
              version: '1.0'
            },
            productCharacteristic: [
              { name: 'serviceType', value: formData.serviceType },
              { name: 'bandwidth', value: formData.bandwidth },
              { name: 'duration', value: formData.duration },
              { name: 'additionalServices', value: formData.additionalServices.join(',') },
              { name: 'specialRequirements', value: formData.specialRequirements },
              { name: 'companyName', value: formData.companyName },
              { name: 'businessType', value: formData.businessType },
              { name: 'expectedUsers', value: formData.expectedUsers },
              { name: 'customerAddress', value: user.address || '' },
              { name: 'customerDistrict', value: user.district || '' },
              { name: 'customerProvince', value: user.province || '' },
              { name: 'customerPhone', value: user.phone || '' },
              { name: 'qualificationStatus', value: qualificationData.available ? 'available' : 'limited' }
            ]
          }
        }],
        note: [{
          date: new Date().toISOString(),
          author: user.name,
          text: `Customer customize request: ${formData.specialRequirements}`
        }]
      };

      const response = await fetch(`${API_BASE_URL}/productOrderingManagement/v4/productOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit customize request');
      }

      const result = await response.json();

      // Also create an event notification using TMF688
      await fetch(`${API_BASE_URL}/tmf-api/event/v4/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'CustomizePackageRequestCreated',
          eventTime: new Date().toISOString(),
          title: 'New Customize Package Request',
          description: `Customer ${user.name} has submitted a new customize package request`,
          priority: 'Medium',
          source: 'CustomerPortal',
          reportingSystem: 'ProdigyHub',
          relatedParty: [{
            id: user.id,
            name: user.name,
            role: 'customer'
          }],
          correlationId: result.id,
          eventPayload: {
            orderId: result.id,
            customerId: user.id,
            serviceType: formData.serviceType,
            bandwidth: formData.bandwidth,
            requestDate: new Date().toISOString()
          }
        })
      });

      setSuccess('Your customize package request has been submitted successfully! Our admin team will review it and get back to you soon.');
      
      // Reset form
      setFormData({
        serviceType: '',
        bandwidth: '',
        duration: '',
        additionalServices: [],
        specialRequirements: '',
        companyName: '',
        businessType: '',
        expectedUsers: ''
      });

      // Reload requests
      loadCustomizeRequests();
      
      // Switch to requests tab
      setActiveTab('my-requests');

    } catch (err: any) {
      setError(err.message || 'Failed to submit customize request');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Filter requests based on status
  const filteredRequests = requests.filter(request => 
    filterStatus === 'all' || request.status === filterStatus
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">Loading user information...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customize Packages</h1>
          <p className="text-gray-600">Request personalized service packages tailored to your specific needs</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center"><Mail className="w-4 h-4 mr-1" />{user.email}</span>
                  {user.phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-1" />{user.phone}</span>}
                  {user.district && <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{user.district}, {user.province}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-request" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>New Request</span>
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>My Requests</span>
            </TabsTrigger>
          </TabsList>

          {/* New Request Tab */}
          <TabsContent value="new-request">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Create New Customize Request</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Service Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Service Requirements</h3>
                    
                    <div>
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bandwidth">Bandwidth *</Label>
                      <Select value={formData.bandwidth} onValueChange={(value) => handleInputChange('bandwidth', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bandwidth" />
                        </SelectTrigger>
                        <SelectContent>
                          {bandwidthOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Contract Duration *</Label>
                      <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Information (Optional)</h3>
                    
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        placeholder="e.g., IT Company, Restaurant, Retail"
                      />
                    </div>

                    <div>
                      <Label htmlFor="expectedUsers">Expected Number of Users</Label>
                      <Input
                        id="expectedUsers"
                        type="number"
                        value={formData.expectedUsers}
                        onChange={(e) => handleInputChange('expectedUsers', e.target.value)}
                        placeholder="Number of users"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {additionalServicesOptions.map(service => (
                      <label key={service} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.additionalServices.includes(service)}
                          onChange={() => toggleAdditionalService(service)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <Label htmlFor="specialRequirements">Special Requirements & Notes</Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    placeholder="Please describe any specific requirements, technical specifications, or special needs..."
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={submitCustomizeRequest}
                    disabled={loading || !formData.serviceType || !formData.bandwidth || !formData.duration}
                    className="flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>My Customize Requests</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={loadCustomizeRequests}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No customize requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request, index) => (
                      <div key={request.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.packageRequirements?.serviceType} - {request.packageRequirements?.bandwidth}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Requested: {new Date(request.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Duration:</strong> {request.packageRequirements?.duration}</p>
                            <p><strong>Additional Services:</strong> {request.packageRequirements?.additionalServices?.join(', ') || 'None'}</p>
                          </div>
                          <div>
                            {request.estimatedPrice && <p><strong>Estimated Price:</strong> ${request.estimatedPrice}</p>}
                            {request.estimatedDelivery && <p><strong>Estimated Delivery:</strong> {request.estimatedDelivery}</p>}
                          </div>
                        </div>
                        
                        {request.packageRequirements?.specialRequirements && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm"><strong>Requirements:</strong> {request.packageRequirements.specialRequirements}</p>
                          </div>
                        )}
                        
                        {request.adminNotes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm"><strong>Admin Notes:</strong> {request.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RegisterCustomizePage;