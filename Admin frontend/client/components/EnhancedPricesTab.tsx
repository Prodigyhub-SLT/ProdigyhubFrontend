// components/EnhancedPricesTab.tsx - UPDATED TO SHOW OFFER PRICES
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  Edit,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Trash2,
  Calendar,
  Tag,
  Package
} from "lucide-react";
import { ProductOfferingPrice } from "../../shared/product-order-types";
import { MongoProductOffering } from "../hooks/useMongoOfferingsLogic";

interface EnhancedPricesTabProps {
  prices: ProductOfferingPrice[];
  mongoOfferings: MongoProductOffering[]; // Add MongoDB offerings
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  loading: boolean;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  setIsCreateDialogOpen: (open: boolean) => void;
  setCreateDialogType: (type: 'category' | 'spec' | 'offering' | 'price') => void;
  // Add new props for view and edit functionality
  setSelectedOffering: (offering: MongoProductOffering) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  loadOfferingForEdit: (offering: MongoProductOffering) => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    case 'retired': return 'bg-gray-100 text-gray-800';
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

const getPriceTypeColor = (priceType: string) => {
  switch (priceType?.toLowerCase()) {
    case 'recurring': return 'bg-blue-100 text-blue-800';
    case 'onetime': return 'bg-purple-100 text-purple-800';
    case 'usage': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'broadband': return 'bg-purple-100 text-purple-800';
    case 'mobile': return 'bg-pink-100 text-pink-800';
    case 'business': return 'bg-blue-100 text-blue-800';
    case 'cloud service': return 'bg-cyan-100 text-cyan-800';
    case 'product': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatPrice = (price: any) => {
  if (!price) return 'N/A';
  
  if (price.taxIncludedAmount) {
    return `${price.taxIncludedAmount.unit || 'LKR'} ${price.taxIncludedAmount.value || 0}`;
  } else if (price.dutyFreeAmount) {
    return `${price.dutyFreeAmount.unit || 'LKR'} ${price.dutyFreeAmount.value || 0}`;
  } else if (price.value) {
    return `${price.unit || 'LKR'} ${price.value}`;
  }
  
  return 'N/A';
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

export const EnhancedPricesTab: React.FC<EnhancedPricesTabProps> = ({
  prices,
  mongoOfferings, // Add MongoDB offerings
  searchTerm,
  statusFilter,
  categoryFilter,
  loading,
  setSearchTerm,
  setStatusFilter,
  setCategoryFilter,
  setIsCreateDialogOpen,
  setCreateDialogType,
  // Add new props for view and edit functionality
  setSelectedOffering,
  setIsViewDialogOpen,
  loadOfferingForEdit
}) => {
  // Filter MongoDB offerings based on search term and filters
  const filteredOfferings = mongoOfferings.filter(offering => {
    if (!offering || !offering.pricing) return false;
    
    const matchesSearch = !searchTerm || 
      offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      offering.lifecycleStatus.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesCategory = categoryFilter === 'all' || 
      offering.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const safeOfferings = filteredOfferings || [];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Offers' Price</h2>
          <p className="text-muted-foreground text-sm">Pricing details from all product offerings</p>
        </div>
        <Button onClick={() => {
          setCreateDialogType('offering');
          setIsCreateDialogOpen(true);
        }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create New Offer
        </Button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Offers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{safeOfferings.length}</div>
            <p className="text-xs text-muted-foreground">With pricing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safeOfferings.filter(o => o?.lifecycleStatus === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Recurring</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safeOfferings.filter(o => o?.pricing?.period !== 'one-time').length}
            </div>
            <p className="text-xs text-muted-foreground">Monthly/yearly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">One Time</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safeOfferings.filter(o => o?.pricing?.period === 'one-time').length}
            </div>
            <p className="text-xs text-muted-foreground">Setup fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search offers by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="broadband">Broadband</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="cloud service">Cloud Service</SelectItem>
            <SelectItem value="product">Product</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Offers with Pricing List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : safeOfferings.length === 0 ? (
        <Card className="border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers with pricing found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first product offering with pricing.'}
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={() => {
                setCreateDialogType('offering');
                setIsCreateDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Offer
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {safeOfferings.map((offering) => (
            <Card key={offering.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{offering.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {offering.description || 'No description available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(offering.lifecycleStatus)}>
                          {offering.lifecycleStatus}
                        </Badge>
                        <Badge className={getCategoryColor(offering.category)}>
                          {offering.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Main Pricing Display */}
                    {offering.pricing && (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {offering.pricing.currency || 'LKR'} {(offering.pricing.amount || 0).toLocaleString()}
                          </span>
                          <span className="text-blue-100 text-sm">
                            {offering.pricing.period || 'per month'}
                          </span>
                        </div>
                        
                        {((offering.pricing.setupFee || 0) > 0 || (offering.pricing.deposit || 0) > 0) && (
                          <div className="mt-2 text-right">
                            {(offering.pricing.setupFee || 0) > 0 && (
                              <div className="text-sm text-blue-100">
                                Setup: {offering.pricing.currency || 'LKR'} {(offering.pricing.setupFee || 0).toLocaleString()}
                              </div>
                            )}
                            {(offering.pricing.deposit || 0) > 0 && (
                              <div className="text-sm text-blue-100">
                                Security Deposit: {offering.pricing.currency || 'LKR'} {(offering.pricing.deposit || 0).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Main Price:</span>
                        <div className="text-lg font-bold text-green-600">
                          {offering.pricing?.currency || 'LKR'} {(offering.pricing?.amount || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Period:</span>
                        <div className="text-gray-900 capitalize">
                          {offering.pricing?.period || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Setup Fee:</span>
                        <div className="text-gray-900">
                          {offering.pricing?.currency || 'LKR'} {(offering.pricing?.setupFee || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Security Deposit:</span>
                        <div className="text-gray-900">
                          {offering.pricing?.currency || 'LKR'} {(offering.pricing?.deposit || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <div className="text-gray-900">
                          {formatDate(offering.createdAt)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Last Updated:</span>
                        <div className="text-gray-900">
                          {formatDate(offering.updatedAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Attributes if any */}
                    {offering.customAttributes && offering.customAttributes.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Custom Attributes</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {offering.customAttributes.map((attr, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium text-gray-600">{attr.name}:</span>
                              <span className="text-gray-800 ml-1">{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedOffering(offering);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        loadOfferingForEdit(offering);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Offer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
