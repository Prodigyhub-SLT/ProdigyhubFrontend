// components/EnhancedSpecsTab.tsx - SIMPLIFIED VERSION
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen,
  Edit,
  AlertCircle,
  Plus,
  Search,
  Eye,
  Trash2,
  FileText
} from "lucide-react";
import { CategoryIcons, CATEGORIES } from "./CategoryConfig";
import { MongoProductSpec } from "../hooks/useMongoSpecsLogic";

interface EnhancedSpecsTabProps {
  mongoSpecs: MongoProductSpec[];
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  loading: boolean;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  setSelectedSpec: (spec: MongoProductSpec) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  loadSpecForEdit: (spec: MongoProductSpec) => void;
  deleteMongoSpec: (id: string) => void;
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

export const EnhancedSpecsTab: React.FC<EnhancedSpecsTabProps> = ({
  mongoSpecs,
  searchTerm,
  statusFilter,
  categoryFilter,
  loading,
  setSearchTerm,
  setStatusFilter,
  setCategoryFilter,
  setSelectedSpec,
  setIsViewDialogOpen,
  loadSpecForEdit,
  deleteMongoSpec,
  setIsCreateDialogOpen,
  setCreateDialogType
}) => {
  // Ensure mongoSpecs is always an array
  const safeMongoSpecs = Array.isArray(mongoSpecs) ? mongoSpecs : [];

  const filteredMongoSpecs = safeMongoSpecs.filter(spec => {
    // Ensure spec has required properties
    if (!spec || typeof spec !== 'object') return false;
    
    const specName = spec.name || '';
    const specDescription = spec.description || '';
    const specStatus = spec.lifecycleStatus || '';
    const specCategory = spec.category || '';

    const matchesSearch = specName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || specStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || specCategory === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Product Specifications (MongoDB)</h2>
          <p className="text-muted-foreground text-sm">Auto-generated specifications from product offerings</p>
        </div>
        <Button onClick={() => {
          setCreateDialogType('spec');
          setIsCreateDialogOpen(true);
        }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Specification
        </Button>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Specs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{safeMongoSpecs.length}</div>
            <p className="text-xs text-muted-foreground">MongoDB stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {safeMongoSpecs.filter(s => s?.lifecycleStatus === 'Active').length}
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
              {safeMongoSpecs.filter(s => s?.lifecycleStatus === 'Draft').length}
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
              {safeMongoSpecs.filter(s => s?.lifecycleStatus === 'Retired').length}
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
                placeholder="Search specifications..."
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

      {/* SIMPLIFIED Specs List - Same as Offerings Layout */}
      <div className="space-y-4">
        {filteredMongoSpecs.map((spec) => {
          // Ensure spec is valid before rendering
          if (!spec || !spec.id) {
            return null;
          }

          const CategoryIcon = CategoryIcons[spec.category as keyof typeof CategoryIcons]?.icon || BookOpen;
          const categoryColor = CategoryIcons[spec.category as keyof typeof CategoryIcons]?.color || 'text-gray-600';
          
          return (
            <Card key={spec.id} className="relative overflow-hidden bg-white/70 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CategoryIcon className={`w-6 h-6 ${categoryColor}`} />
                    <div>
                      <h3 className="text-lg font-semibold line-clamp-1">{spec.name || 'Unnamed Specification'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(spec.lifecycleStatus)} variant="outline">
                          {spec.lifecycleStatus?.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{spec.category || 'No Category'}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMongoSpec(spec.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* SIMPLIFIED: Only show description */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {spec.description || 'No description available'}
                </p>
                
                {/* Creation/Update Info and Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Created: {spec.createdAt ? new Date(spec.createdAt).toLocaleDateString() : 'Unknown'}
                    {spec.updatedAt && (
                      <>
                        {' • '}
                        Updated: {new Date(spec.updatedAt).toLocaleDateString()}
                      </>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedSpec(spec);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => loadSpecForEdit(spec)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMongoSpecs.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Specifications Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No specifications match your current filters.'
                : 'Specifications are automatically created when you create offerings.'}
            </p>
            <Button onClick={() => {
              setCreateDialogType('spec');
              setIsCreateDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Specification
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};