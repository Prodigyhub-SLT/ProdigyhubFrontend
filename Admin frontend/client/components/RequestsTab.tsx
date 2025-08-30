import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Trash2, 
  Search, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Wifi,
  Globe,
  Signal,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ServiceRequest {
  id: string;
  location: {
    address: string;
    district: string;
    province: string;
    postalCode?: string;
  };
  requestedServices: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  customerType: 'residential' | 'business' | 'enterprise';
  creationDate: string;
  estimatedInstallationTime?: string;
  notes?: string[];
  infrastructure?: any;
  qualificationResult?: string;
}

const mongoAPI = {
  async getServiceRequests() {
    try {
      const response = await fetch('/api/productOfferingQualification/v5/checkProductOfferingQualification?limit=100', {
        headers: { 
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const requests = Array.isArray(data) ? data : [data];
      
      // Filter for service requests (not infrastructure checks)
      return requests
        .map(item => this.transformTMFToServiceRequest(item))
        .filter(Boolean)
        .filter(request => 
          request.requestedServices.some(service => 
            service.toLowerCase().includes('request') || 
            service.toLowerCase().includes('broadband') ||
            service.toLowerCase().includes('fiber') ||
            service.toLowerCase().includes('adsl')
          )
        );
    } catch (error) {
      console.error('Error fetching service requests:', error);
      return [];
    }
  },

  async deleteServiceRequest(requestId: string) {
    try {
      const response = await fetch(`/api/productOfferingQualification/v5/checkProductOfferingQualification/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      if (!response.ok) {
        throw new Error(`MongoDB Delete Error: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  transformTMFToServiceRequest(tmfData: any): ServiceRequest | null {
    try {
      const notes = tmfData.note || [];
      let location = null;
      let requestedServices = null;
      let infrastructure = null;
      let qualificationResult = 'pending';

      notes.forEach((note: any) => {
        if (note.text?.startsWith('SLT_LOCATION:')) {
          try {
            location = JSON.parse(note.text.replace('SLT_LOCATION:', ''));
          } catch (e) {}
        } else if (note.text?.startsWith('SLT_SERVICES:')) {
          try {
            requestedServices = JSON.parse(note.text.replace('SLT_SERVICES:', ''));
          } catch (e) {}
        } else if (note.text?.startsWith('SLT_INFRASTRUCTURE:')) {
          try {
            infrastructure = JSON.parse(note.text.replace('SLT_INFRASTRUCTURE:', ''));
          } catch (e) {}
        } else if (note.text?.startsWith('SLT_AREA_MATCH:')) {
          try {
            const areaMatchData = JSON.parse(note.text.replace('SLT_AREA_MATCH:', ''));
            qualificationResult = areaMatchData.qualificationResult;
          } catch (e) {}
        }
      });

      if (!location && tmfData.description) {
        const addressMatch = tmfData.description.match(/for (.+)$/);
        if (addressMatch) {
          location = {
            address: addressMatch[1],
            district: 'Unknown',
            province: 'Unknown',
            postalCode: ''
          };
        }
      }

      if (!location) {
        location = {
          address: tmfData.description || 'SLT Service Request',
          district: 'Unknown',
          province: 'Unknown', 
          postalCode: ''
        };
      }

      if (!requestedServices) {
        requestedServices = ['SLT Broadband Service'];
      }

      // Determine status based on qualification result and state
      let status: ServiceRequest['status'] = 'pending';
      if (qualificationResult === 'qualified') {
        status = 'approved';
      } else if (qualificationResult === 'unqualified') {
        status = 'rejected';
      } else if (tmfData.state === 'done') {
        status = 'completed';
      } else if (tmfData.state === 'inprogress') {
        status = 'in_progress';
      }

      return {
        id: tmfData.id,
        location,
        requestedServices,
        status,
        customerType: 'residential',
        creationDate: tmfData.creationDate || new Date().toISOString(),
        estimatedInstallationTime: '3-5 business days',
        notes: notes.map((note: any) => note.text),
        infrastructure,
        qualificationResult
      };
    } catch (error) {
      return null;
    }
  }
};

export function RequestsTab() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const requestsData = await mongoAPI.getServiceRequests();
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await mongoAPI.deleteServiceRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      toast({
        title: "✅ Deleted",
        description: "Service request deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "❌ Delete Failed",
        description: "Failed to delete service request",
        variant: "destructive",
      });
    }
  };

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (service: string) => {
    if (service.toLowerCase().includes('fiber')) return <Wifi className="w-4 h-4" />;
    if (service.toLowerCase().includes('adsl')) return <Globe className="w-4 h-4" />;
    if (service.toLowerCase().includes('mobile')) return <Signal className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location?.district?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesService = serviceFilter === 'all' || 
                          request.requestedServices?.some(s => s.toLowerCase().includes(serviceFilter.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || request.location?.province === locationFilter;
    return matchesSearch && matchesStatus && matchesService && matchesLocation;
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Service Requests from SLT UI
              </CardTitle>
              <CardDescription>
                All service requests submitted by users through the SLT qualification interface
              </CardDescription>
            </div>
            <Button onClick={fetchRequests} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="fiber">Fiber Broadband</SelectItem>
                  <SelectItem value="adsl">ADSL Broadband</SelectItem>
                  <SelectItem value="mobile">Mobile Broadband</SelectItem>
                  <SelectItem value="broadband">Broadband</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  <SelectItem value="Western">Western</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                  <SelectItem value="Southern">Southern</SelectItem>
                  <SelectItem value="North Western">North Western</SelectItem>
                  <SelectItem value="Eastern">Eastern</SelectItem>
                  <SelectItem value="Northern">Northern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Request/Check Type</TableHead>
                  <TableHead className="hidden md:table-cell">Technology/Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.location?.address || 'Unknown Address'}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.location?.district}, {request.location?.province}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {request.requestedServices?.map((service: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                            {getServiceIcon(service)}
                            {service}
                          </Badge>
                        )) || <Badge variant="secondary" className="text-xs">Unknown Service</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1">
                        {request.infrastructure?.fiber?.available && (
                          <Badge className="bg-green-100 text-green-800">Fiber</Badge>
                        )}
                        {request.infrastructure?.adsl?.available && (
                          <Badge className="bg-blue-100 text-blue-800">ADSL</Badge>
                        )}
                        {!request.infrastructure?.fiber?.available && !request.infrastructure?.adsl?.available && (
                          <Badge className="bg-gray-100 text-gray-800">None</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status.replace('_', ' ')}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {request.creationDate ? new Date(request.creationDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && !loading && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Requests Found</h3>
              <p className="text-gray-600 mb-4">
                {requests.length === 0 
                  ? "No service requests have been submitted yet from the SLT UI"
                  : "No requests match your current filters"}
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading service requests...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Service Request Details
            </DialogTitle>
            <DialogDescription>
              Complete information for request ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Request ID</Label>
                      <p className="text-sm">{selectedRequest.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Customer Type</Label>
                      <p className="text-sm capitalize">{selectedRequest.customerType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Creation Date</Label>
                      <p className="text-sm">
                        {selectedRequest.creationDate ? new Date(selectedRequest.creationDate).toLocaleString() : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-sm">{selectedRequest.location?.address || 'Not specified'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">District</Label>
                      <p className="text-sm">{selectedRequest.location?.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Province</Label>
                      <p className="text-sm">{selectedRequest.location?.province || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    Requested Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.requestedServices && selectedRequest.requestedServices.length > 0 ? (
                      selectedRequest.requestedServices.map((service: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                          {getServiceIcon(service)}
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No services specified</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedRequest.infrastructure && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wifi className="w-5 h-5" />
                      Infrastructure Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className={selectedRequest.infrastructure.fiber?.available ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Wifi className={`w-4 h-4 ${selectedRequest.infrastructure.fiber?.available ? 'text-green-600' : 'text-gray-400'}`} />
                            Fiber Broadband
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge className={selectedRequest.infrastructure.fiber?.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedRequest.infrastructure.fiber?.available ? 'Available' : 'Not Available'}
                          </Badge>
                          {selectedRequest.infrastructure.fiber?.available && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs"><strong>Technology:</strong> {selectedRequest.infrastructure.fiber.technology}</p>
                              <p className="text-xs"><strong>Max Speed:</strong> {selectedRequest.infrastructure.fiber.maxSpeed}</p>
                              <p className="text-xs"><strong>Monthly Fee:</strong> LKR {selectedRequest.infrastructure.fiber.monthlyFee}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className={selectedRequest.infrastructure.adsl?.available ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Globe className={`w-4 h-4 ${selectedRequest.infrastructure.adsl?.available ? 'text-blue-600' : 'text-gray-400'}`} />
                            ADSL Broadband
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge className={selectedRequest.infrastructure.adsl?.available ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedRequest.infrastructure.adsl?.available ? 'Available' : 'Not Available'}
                          </Badge>
                          {selectedRequest.infrastructure.adsl?.available && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs"><strong>Technology:</strong> {selectedRequest.infrastructure.adsl.technology}</p>
                              <p className="text-xs"><strong>Max Speed:</strong> {selectedRequest.infrastructure.adsl.maxSpeed}</p>
                              <p className="text-xs"><strong>Monthly Fee:</strong> LKR {selectedRequest.infrastructure.adsl.monthlyFee}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className={selectedRequest.infrastructure.mobile?.available ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Signal className={`w-4 h-4 ${selectedRequest.infrastructure.mobile?.available ? 'text-purple-600' : 'text-gray-400'}`} />
                            Mobile Broadband
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge className={selectedRequest.infrastructure.mobile?.available ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedRequest.infrastructure.mobile?.available ? 'Available' : 'Not Available'}
                          </Badge>
                          {selectedRequest.infrastructure.mobile?.available && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs"><strong>Technologies:</strong> {selectedRequest.infrastructure.mobile.technologies?.join(', ')}</p>
                              <p className="text-xs"><strong>Coverage:</strong> {selectedRequest.infrastructure.mobile.coverage}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedRequest.notes && selectedRequest.notes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedRequest.notes.map((note: string, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {note}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
