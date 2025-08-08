import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  ArrowRight,
  ExternalLink,
  Calendar,
  Hash,
  ShoppingCart,
  Warehouse,
  RefreshCw,
  RotateCcw,
  Target,
  BarChart3,
  Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productInventoryApi, productOrderingApi } from "@/lib/api";
import type { 
  Product, 
  CreateProductForm,
  ProductOrder 
} from "@shared/product-order-types";
import { 
  EnhancedProduct, 
  removeEnhancedProductData, 
  getDeletionHistory,
  saveEnhancedProductData, 
  enhanceProducts, 
  checkOrderAlreadySynced,
  getEnhancedProductStats 
} from "../lib/inventoryUtils";

interface InventoryStats {
  totalProducts: number;
  activeProducts: number;
  suspendedProducts: number;
  terminatedProducts: number;
  createdProducts: number;
  bundleProducts: number;
  customerVisibleProducts: number;
  autoSyncedProducts: number;
}

interface InventoryProductListProps {
  products: EnhancedProduct[];
  loading: boolean;
  onRefreshData: () => void;
  stats: InventoryStats;
}

type ProductStatus = 'created' | 'active' | 'suspended' | 'terminated';

export default function InventoryProductList({ 
  products, 
  loading, 
  onRefreshData, 
  stats 
}: InventoryProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EnhancedProduct | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Create manual product
  const createProduct = async (formData: FormData) => {
    try {
      const data = Object.fromEntries(formData.entries());
      
      const productData: CreateProductForm = {
        name: data.name as string,
        description: data.description as string,
        productSerialNumber: data.productSerialNumber as string,
        status: data.status as ProductStatus,
        isBundle: data.isBundle === 'on',
        isCustomerVisible: data.isCustomerVisible === 'on',
        productOfferingId: data.productOfferingId as string || undefined
      };

      await productInventoryApi.createProduct(productData);

      toast({
        title: "Success",
        description: "Product created successfully",
      });
      onRefreshData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    // Add confirmation dialog
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Attempting to delete product:', id);
      
      // Call the API to delete the product
      const response = await productInventoryApi.deleteProduct(id);
      console.log('🗑️ Delete API response:', response);
      
      // Remove enhanced data when product is deleted
      removeEnhancedProductData(id);
      console.log('🗑️ Removed enhanced data for product:', id);

      // Force refresh the data immediately
      await onRefreshData();
      console.log('🗑️ Refreshed data after deletion');

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      
      // Check if it's a network error or API error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Could not connect to server. Please check your connection.",
          variant: "destructive",
        });
      } else if (error.response) {
        // API returned an error response
        toast({
          title: "Delete Failed",
          description: `Server error: ${error.response.status} - ${error.response.statusText}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Toggle product status between active and suspended
  const toggleProductStatus = async (id: string, currentStatus: ProductStatus) => {
    try {
      let newStatus: ProductStatus;
      
      if (currentStatus === 'active') {
        newStatus = 'suspended';
      } else if (currentStatus === 'suspended') {
        newStatus = 'active';
      } else {
        // If it's 'created' or 'terminated', make it active
        newStatus = 'active';
      }

      const updateData: Partial<Product> = {
        status: newStatus
      };

      await productInventoryApi.updateProduct(id, updateData);
      
      toast({
        title: "Success",
        description: `Product status updated to ${newStatus}`,
      });
      onRefreshData();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  // Status icon and color helpers
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'created': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'terminated': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-sm';
      case 'created': return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 shadow-sm';
      case 'suspended': return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200 shadow-sm';
      case 'terminated': return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 shadow-sm';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 shadow-sm';
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = (
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((product as any).sourceOrderId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    const matchesSource = sourceFilter === 'all' || 
      (sourceFilter === 'synced' && (product as any).syncedFromOrder) ||
      (sourceFilter === 'manual' && !(product as any).syncedFromOrder);
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <>
      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b-0 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Product Inventory
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Manage product instances and their lifecycle
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between mb-8 gap-6">
            <div className="relative flex items-center space-x-2 flex-1">
              <div className="absolute left-4 z-10">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                placeholder="Search by product name, ID, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border-slate-200/50 bg-white/70 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-blue-200/50 transition-all duration-300 shadow-sm"
              />
            </div>
            <div className="flex space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 rounded-xl border-slate-200/50 bg-white/70 backdrop-blur-sm focus:border-blue-300 shadow-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200/50 bg-white/95 backdrop-blur-xl shadow-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-40 rounded-xl border-slate-200/50 bg-white/70 backdrop-blur-sm focus:border-blue-300 shadow-sm">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200/50 bg-white/95 backdrop-blur-xl shadow-xl">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="synced">Auto-Synced</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
          
          {/* Products Table */}
          <div className="rounded-2xl border border-slate-200/50 bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-100/80 via-white to-slate-100/80 border-b border-slate-200/50 hover:bg-slate-100/80">
                  <TableHead className="font-bold text-slate-700 py-4 px-6">Product Details</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">Status</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-700 py-4 px-6">Source</TableHead>
                  <TableHead className="hidden lg:table-cell font-bold text-slate-700 py-4 px-6">Order Info</TableHead>
                  <TableHead className="hidden xl:table-cell font-bold text-slate-700 py-4 px-6">Serial Number</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isAutoSynced = (product as any).syncedFromOrder;
                  const sourceOrderId = (product as any).sourceOrderId;
                  const orderDate = (product as any).orderDate;
                  const originalQuantity = (product as any).originalQuantity;
                  
                  return (
                    <TableRow 
                      key={product.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300 border-b border-slate-100/50 group"
                      style={{ height: '80px' }}
                    >
                      <TableCell className="font-medium py-4 px-6">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                            {product.name ? product.name.replace(/\s*\(from Order[^)]*\)/i, '') : 'Unnamed Product'}
                          </div>
                          <div className="text-sm text-slate-500 font-mono bg-slate-50 inline-block px-2 py-1 rounded-md">
                            ID: {product.id.slice(0, 7)}...
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-6">
                        <Badge 
                          className={`${getStatusColor(product.status || '')} border px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() => toggleProductStatus(product.id, product.status as ProductStatus)}
                        >
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(product.status || '')}
                            <span className="capitalize font-semibold">{product.status || 'unknown'}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell py-4 px-6">
                        <div className="space-y-1">
                          {isAutoSynced ? (
                            <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
                              From Order
                            </Badge>
                          ) : (
                            <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300">
                              <Plus className="w-3 h-3 mr-1" />
                              Manual
                            </Badge>
                          )}
                          {product.isBundle && (
                            <Badge variant="outline" className="text-xs">Bundle</Badge>
                          )}
                          {product.isCustomerVisible && (
                            <Badge variant="outline" className="text-xs">Visible</Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell py-4 px-6">
                        {isAutoSynced && sourceOrderId ? (
                          <div className="space-y-1">
                            <div 
                              className="flex items-center space-x-1 cursor-pointer hover:text-blue-700 transition-colors"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsOrderDialogOpen(true);
                              }}
                            >
                              <ShoppingCart className="w-3 h-3 text-blue-600" />
                              <span className="text-sm font-mono text-blue-700 underline">
                                {sourceOrderId.slice(0, 7)}...
                              </span>
                            </div>
                            {orderDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-600">
                                  {new Date(orderDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {originalQuantity && originalQuantity > 1 && (
                              <div className="flex items-center space-x-1">
                                <Hash className="w-3 h-3 text-amber-600" />
                                <span className="text-xs text-amber-700">
                                  Qty: {originalQuantity}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">Manual Entry</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden xl:table-cell py-4 px-6 text-slate-600 font-medium">
                        {product.productSerialNumber || 'N/A'}
                      </TableCell>
                      
                      <TableCell className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsViewDialogOpen(true);
                            }}
                            title="View Product Details"
                            className="rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                            title="Delete Product"
                            className="rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Products Found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'No products match your current filters. Try adjusting your search criteria.' 
                  : 'Get started by adding your first product or complete some orders to auto-sync products.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product Manually
                </Button>
                <Button 
                  onClick={onRefreshData}
                  variant="outline"
                  className="px-6 py-3 rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Sync from Orders
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-xl bg-blue-100">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <span>Add New Product</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Create a new product in the inventory manually
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createProduct(formData);
          }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Product Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g., Premium Mobile Plan" 
                  required 
                  className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl focus:border-blue-300 focus:ring-blue-200/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Product description..." 
                  className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl focus:border-blue-300 focus:ring-blue-200/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productSerialNumber" className="text-sm font-semibold">Serial Number</Label>
                  <Input 
                    id="productSerialNumber" 
                    name="productSerialNumber" 
                    placeholder="e.g., SN123456789" 
                    className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl focus:border-blue-300 focus:ring-blue-200/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold">Status *</Label>
                  <Select name="status" defaultValue="created">
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl focus:border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl rounded-xl">
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productOfferingId" className="text-sm font-semibold">Product Offering ID</Label>
                <Input 
                  id="productOfferingId" 
                  name="productOfferingId" 
                  placeholder="e.g., mobile-plan-001" 
                  className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-xl focus:border-blue-300 focus:ring-blue-200/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input type="checkbox" id="isBundle" name="isBundle" className="rounded" />
                  <Label htmlFor="isBundle" className="text-sm font-medium">Is Bundle Product</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <input type="checkbox" id="isCustomerVisible" name="isCustomerVisible" defaultChecked className="rounded" />
                  <Label htmlFor="isCustomerVisible" className="text-sm font-medium">Customer Visible</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b border-slate-100 pb-6">
            <DialogTitle className="flex items-center space-x-3 text-2xl">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Product Details
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Complete information about this inventory product
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-8 py-6">
              {/* Basic Information */}
              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                      <Label className="text-blue-700 font-bold text-sm">Product ID</Label>
                      <p className="text-sm font-mono bg-white p-3 rounded-lg border border-blue-200/50 mt-2 shadow-sm">
                        {selectedProduct.id}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50">
                      <Label className="text-green-700 font-bold text-sm">Product Name</Label>
                      <p className="text-sm font-semibold text-green-800 mt-2">
                        {selectedProduct.name || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                      <Label className="text-purple-700 font-bold text-sm">Status</Label>
                      <div className="mt-3">
                        <Badge className={`${getStatusColor(selectedProduct.status || '')} border px-4 py-2`}>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(selectedProduct.status || '')}
                            <span className="capitalize font-semibold">{selectedProduct.status || 'unknown'}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selectedProduct.description && (
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/50">
                      <Label className="text-slate-700 font-bold text-sm">Description</Label>
                      <p className="text-sm mt-2 p-4 bg-white rounded-lg border border-slate-200/50 shadow-sm">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Technical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-600 font-semibold">Serial Number</Label>
                      <p className="text-sm font-mono bg-slate-50 p-3 rounded-lg border border-slate-200/50 mt-2 shadow-sm">
                        {selectedProduct.productSerialNumber || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-600 font-semibold">Product Type</Label>
                      <div className="flex space-x-2 mt-2">
                        {selectedProduct.isBundle && <Badge variant="outline">Bundle Product</Badge>}
                        {selectedProduct.isCustomerVisible && <Badge variant="outline">Customer Visible</Badge>}
                        {!selectedProduct.isBundle && <Badge variant="outline">Single Product</Badge>}
                        {!(selectedProduct as any).syncedFromOrder && <Badge variant="outline" className="bg-gray-100">Manual Entry</Badge>}
                      </div>
                    </div>
                    {selectedProduct.startDate && (
                      <div>
                        <Label className="text-slate-600 font-semibold">Start Date</Label>
                        <p className="text-sm text-slate-700 mt-2">
                          {new Date(selectedProduct.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedProduct.productOffering && (
                      <div>
                        <Label className="text-slate-600 font-semibold">Product Offering</Label>
                        <p className="text-sm text-slate-700 mt-2">
                          {selectedProduct.productOffering.name || selectedProduct.productOffering.id || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Characteristics - if available */}
              {selectedProduct.productCharacteristic && selectedProduct.productCharacteristic.length > 0 && (
                <Card className="border-slate-200/50 shadow-lg rounded-xl bg-gradient-to-br from-white to-slate-50/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-900">Product Characteristics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProduct.productCharacteristic.map((char, index) => (
                        <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-200/50">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">{char.name}:</span>
                            <span className="text-slate-600">{char.value || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedProduct(null);
              }}
              className="rounded-xl border-slate-200 hover:bg-slate-50 px-8 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b border-slate-100 pb-6">
            <DialogTitle className="flex items-center space-x-3 text-2xl">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Order Details
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Details of the order that created this product
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (selectedProduct as any).syncedFromOrder && (
            <div className="space-y-6 py-6">
              <Card className="border-purple-200/50 shadow-lg rounded-xl bg-gradient-to-br from-purple-50/30 to-white">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-900 flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(selectedProduct as any).sourceOrderId && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                        <Label className="text-blue-700 font-bold text-sm flex items-center space-x-1">
                          <Hash className="w-4 h-4" />
                          <span>Order ID</span>
                        </Label>
                        <p className="text-sm font-mono bg-white p-3 rounded-lg border border-blue-200/50 mt-2 shadow-sm">
                          {(selectedProduct as any).sourceOrderId}
                        </p>
                      </div>
                    )}
                    
                    {(selectedProduct as any).orderDate && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50">
                        <Label className="text-green-700 font-bold text-sm flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Order Date</span>
                        </Label>
                        <p className="text-sm font-semibold text-green-800 mt-2">
                          {new Date((selectedProduct as any).orderDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {(selectedProduct as any).originalQuantity && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
                        <Label className="text-amber-700 font-bold text-sm flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span>Original Quantity</span>
                        </Label>
                        <p className="text-sm font-semibold text-amber-800 mt-2">
                          {(selectedProduct as any).originalQuantity}
                        </p>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50">
                      <Label className="text-slate-700 font-bold text-sm flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Product Name</span>
                      </Label>
                      <p className="text-sm font-semibold text-slate-800 mt-2">
                        {selectedProduct.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200/50">
                <div className="flex items-center space-x-3 mb-4">
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">Auto-Sync Information</h3>
                </div>
                <p className="text-purple-800 text-sm leading-relaxed">
                  This product was automatically created when the order was marked as "completed" in the Product Ordering system. 
                  The product inherits the details from the original order and is set to "Active" status by default.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsOrderDialogOpen(false);
                setSelectedProduct(null);
              }}
              className="rounded-xl border-slate-200 hover:bg-slate-50 px-8 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}