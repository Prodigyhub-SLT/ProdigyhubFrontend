// components/EnhancedOfferingsTab.tsx - FIXED VERSION
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Edit,
  BookOpen,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Trash2
} from "lucide-react";
import { CategoryIcons, CATEGORIES } from "./CategoryConfig";
import { MongoProductOffering } from "../hooks/useMongoOfferingsLogic";

interface EnhancedOfferingsTabProps {
  mongoOfferings: MongoProductOffering[];
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  loading: boolean;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  setSelectedOffering: (offering: MongoProductOffering) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  loadOfferingForEdit: (offering: MongoProductOffering) => void;
  deleteMongoOffering: (id: string) => void;
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

export const EnhancedOfferingsTab: React.FC<EnhancedOfferingsTabProps> = ({
  mongoOfferings,
  searchTerm,
  statusFilter,
  categoryFilter,
  loading,
  setSearchTerm,
  setStatusFilter,
  setCategoryFilter,
  setSelectedOffering,
  setIsViewDialogOpen,
  loadOfferingForEdit,
  deleteMongoOffering,
  setIsCreateDialogOpen,
  setCreateDialogType
}) => {
  // Ensure mongoOfferings is always an array
  const safeMongoOfferings = Array.isArray(mongoOfferings) ? mongoOfferings : [];

  const filteredMongoOfferings = safeMongoOfferings.filter(offering => {
    // Ensure offering has required properties
    if (!offering || typeof offering !== 'object') return false;
    
    const offeringName = offering.name || '';
    const offeringDescription = offering.description || '';
    const offeringStatus = offering.lifecycleStatus || '';
    const offeringCategory = offering.category || '';

    const matchesSearch = offeringName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offeringDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offeringStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || offeringCategory === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Product Offerings (MongoDB)</h2>
          <p className="text-muted-foreground text-sm">MongoDB-powered product offerings with advanced features</p>
        </div>
        <Button onClick={() => {
          setCreateDialogType('offering');
          setIsCreateDialogOpen(true);
        }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Offering
        </Button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Offerings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{safeMongoOfferings.length}</div>
            <p className="text-xs text-muted-foreground">MongoDB stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safeMongoOfferings.filter(o => o?.lifecycleStatus === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safeMongoOfferings.filter(o => o?.lifecycleStatus === 'Draft').length}
            </div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Retired</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safeMongoOfferings.filter(o => o?.lifecycleStatus === 'Retired').length}
            </div>
            <p className="text-xs text-muted-foreground">No longer available</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search offerings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Offerings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMongoOfferings.map((offering) => {
          // Ensure offering is valid before rendering
          if (!offering || !offering.id) {
            return null;
          }

          const CategoryIcon = CategoryIcons[offering.category as keyof typeof CategoryIcons]?.icon || Package;
          const categoryColor = CategoryIcons[offering.category as keyof typeof CategoryIcons]?.color || 'text-gray-600';
          
          return (
            <Card key={offering.id} className="relative overflow-hidden bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge className={getStatusColor(offering.lifecycleStatus)} variant="outline">
                    {offering.lifecycleStatus?.toUpperCase()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMongoOffering(offering.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold line-clamp-1">{offering.name || 'Unnamed Offering'}</h3>
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`w-4 h-4 ${categoryColor}`} />
                    <span className="text-sm text-muted-foreground">{offering.category || 'No Category'}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {offering.description || 'No description available'}
                </p>
                
                {/* Custom Attributes */}
                {offering.customAttributes && Array.isArray(offering.customAttributes) && offering.customAttributes.length > 0 && (
                  <div className="space-y-2">
                    {offering.customAttributes.slice(0, 4).map((attr) => (
                      <div key={attr.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">{attr.name || 'Unknown'}</span>
                        <span className="text-gray-600">{attr.value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pricing */}
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
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedOffering(offering);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => loadOfferingForEdit(offering)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMongoOfferings.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offerings Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No offerings match your current filters.'
                : 'Get started by creating your first MongoDB offering.'}
            </p>
            <Button onClick={() => {
              setCreateDialogType('offering');
              setIsCreateDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Offering
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};