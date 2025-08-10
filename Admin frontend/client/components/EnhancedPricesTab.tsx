// components/EnhancedPricesTab.tsx
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
  Tag
} from "lucide-react";
import { ProductOfferingPrice } from "../../shared/product-order-types";

interface EnhancedPricesTabProps {
  prices: ProductOfferingPrice[];
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  loading: boolean;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  setIsCreateDialogOpen: (open: boolean) => void;
  setCreateDialogType: (type: 'category' | 'spec' | 'offering' | 'price') => void;
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
  searchTerm,
  statusFilter,
  categoryFilter,
  loading,
  setSearchTerm,
  setStatusFilter,
  setCategoryFilter,
  setIsCreateDialogOpen,
  setCreateDialogType
}) => {
  // Filter prices based on search term and filters
  const filteredPrices = prices.filter(price => {
    const matchesSearch = !searchTerm || 
      price.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      price.lifecycleStatus?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesCategory = categoryFilter === 'all';
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const safePrices = filteredPrices || [];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Product Offering Prices</h2>
          <p className="text-muted-foreground text-sm">Manage pricing for all product offerings</p>
        </div>
        <Button onClick={() => {
          setCreateDialogType('price');
          setIsCreateDialogOpen(true);
        }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Price
        </Button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Prices</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{safePrices.length}</div>
            <p className="text-xs text-muted-foreground">All price types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safePrices.filter(p => p?.lifecycleStatus === 'Active').length}
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
              {safePrices.filter(p => p?.priceType === 'recurring').length}
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
              {safePrices.filter(p => p?.priceType === 'oneTime').length}
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
            placeholder="Search prices by name, description, or ID..."
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
            <SelectItem value="inactive">Inactive</SelectItem>
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
            <SelectItem value="product">Product</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prices List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : safePrices.length === 0 ? (
        <Card className="border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prices found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first product offering price.'}
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={() => {
                setCreateDialogType('price');
                setIsCreateDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Price
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {safePrices.map((price) => (
            <Card key={price.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{price.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {price.description || 'No description available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(price.lifecycleStatus)}>
                          {price.lifecycleStatus || 'Draft'}
                        </Badge>
                        <Badge className={getPriceTypeColor(price.priceType)}>
                          {price.priceType || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Price:</span>
                        <div className="text-lg font-bold text-green-600">
                          {formatPrice(price.price)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Price Type:</span>
                        <div className="text-gray-900 capitalize">
                          {price.priceType || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Valid From:</span>
                        <div className="text-gray-900">
                          {formatDate(price.validFor?.startDateTime)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Valid Until:</span>
                        <div className="text-gray-900">
                          {formatDate(price.validFor?.endDateTime)}
                        </div>
                      </div>
                    </div>
                    
                    {price.price?.taxRate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            Tax Rate: {price.price.taxRate}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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
