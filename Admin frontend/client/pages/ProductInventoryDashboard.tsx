import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Warehouse, 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Layers, 
  Eye, 
  RefreshCw, 
  Plus,
  RotateCcw,
  ArrowRight,
  Target,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productInventoryApi, productOrderingApi } from "@/lib/api";
import type { 
  Product, 
  CreateProductForm,
  ProductOrder 
} from "@shared/product-order-types";
import InventoryProductList from "./InventoryProductList";
import { 
  EnhancedProduct, 
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

// Overview Tab Component
const OverviewTabContent = ({ stats }: { stats: InventoryStats }) => {
  // Status progress bar component
  const StatusProgressBar = ({ label, count, total, status }: { 
    label: string; 
    count: number; 
    total: number; 
    status: string 
  }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    const getStatusGradient = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'active': return 'from-emerald-400 to-emerald-600';
        case 'created': return 'from-blue-400 to-blue-600';
        case 'suspended': return 'from-amber-400 to-amber-600';
        case 'terminated': return 'from-red-400 to-red-600';
        default: return 'from-slate-400 to-slate-600';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'active': return 'bg-emerald-500 text-white';
        case 'created': return 'bg-blue-500 text-white';
        case 'suspended': return 'bg-amber-500 text-white';
        case 'terminated': return 'bg-red-500 text-white';
        default: return 'bg-slate-500 text-white';
      }
    };
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusGradient(status)}`}></div>
            <span className="font-semibold text-gray-700">{label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{count}</span>
            <Badge className={getStatusColor(status)}>
              {percentage.toFixed(0)}%
            </Badge>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${getStatusGradient(status)} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white border-0 shadow-2xl">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Product Inventory</CardTitle>
              <CardDescription className="text-blue-100">Total: {stats.totalProducts} products</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Package className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.totalProducts}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-blue-100">Active</div>
                <div className="text-xl font-bold">{stats.activeProducts}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-blue-100">Auto-Synced</div>
                <div className="text-xl font-bold">{stats.autoSyncedProducts}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white border-0 shadow-2xl">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Product Types & Sources</CardTitle>
              <CardDescription className="text-green-100">Breakdown by type and origin</CardDescription>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Layers className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold mb-6">{stats.customerVisibleProducts}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-green-100">Visible</div>
                <div className="text-xl font-bold">{stats.customerVisibleProducts}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-green-100">Bundles</div>
                <div className="text-xl font-bold">{stats.bundleProducts}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Product Status Distribution</div>
                <div className="text-sm text-gray-600">Current status of all inventory products</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <StatusProgressBar 
              label="Active" 
              count={stats.activeProducts} 
              total={stats.totalProducts} 
              status="active" 
            />
            <StatusProgressBar 
              label="Created" 
              count={stats.createdProducts} 
              total={stats.totalProducts} 
              status="created" 
            />
            <StatusProgressBar 
              label="Suspended" 
              count={stats.suspendedProducts} 
              total={stats.totalProducts} 
              status="suspended" 
            />
            <StatusProgressBar 
              label="Terminated" 
              count={stats.terminatedProducts} 
              total={stats.totalProducts} 
              status="terminated" 
            />
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Product Types & Sources</div>
                <div className="text-sm text-gray-600">Breakdown by product type and origin</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Auto-Synced
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">{stats.autoSyncedProducts}</span>
                  <Badge className="bg-purple-500 text-white">
                    {stats.totalProducts > 0 ? Math.round((stats.autoSyncedProducts / stats.totalProducts) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.autoSyncedProducts / stats.totalProducts) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Manual
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">{stats.totalProducts - stats.autoSyncedProducts}</span>
                  <Badge className="bg-gray-500 text-white">
                    {stats.totalProducts > 0 ? Math.round(((stats.totalProducts - stats.autoSyncedProducts) / stats.totalProducts) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalProducts > 0 ? ((stats.totalProducts - stats.autoSyncedProducts) / stats.totalProducts) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Customer Visible
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">{stats.customerVisibleProducts}</span>
                  <Badge className="bg-cyan-500 text-white">
                    {stats.totalProducts > 0 ? Math.round((stats.customerVisibleProducts / stats.totalProducts) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalProducts > 0 ? (stats.customerVisibleProducts / stats.totalProducts) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function ProductInventoryDashboard() {
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    activeProducts: 0,
    suspendedProducts: 0,
    terminatedProducts: 0,
    createdProducts: 0,
    bundleProducts: 0,
    customerVisibleProducts: 0,
    autoSyncedProducts: 0
  });
  
  const [products, setProducts] = useState<EnhancedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingFromOrders, setSyncingFromOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Fetch existing inventory products
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const productsData = await productInventoryApi.getProducts().catch((error) => {
        console.warn('Product Inventory API not available:', error.message);
        return [];
      });

      const productsArray = Array.isArray(productsData) ? productsData : [];
      // Enhance products with stored metadata
      const enhancedProducts = enhanceProducts(productsArray);
      setProducts(enhancedProducts);
      calculateStats(enhancedProducts);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync completed orders to inventory
  const syncCompletedOrdersToInventory = async () => {
    setSyncingFromOrders(true);
    try {
      console.log('🔄 Starting sync of completed orders to inventory...');
      
      // Get all completed orders
      const orders = await productOrderingApi.getOrders().catch(() => []);
      const completedOrders = orders.filter((order: ProductOrder) => 
        order.state === 'completed'
      );

      console.log(`📦 Found ${completedOrders.length} completed orders to process`);

      // Get existing products to avoid duplicates
      const existingProducts = await productInventoryApi.getProducts().catch(() => []);
      
      // Check which orders are already synced using our utility
      const newOrdersToSync = completedOrders.filter(order => 
        !checkOrderAlreadySynced(order.id || '')
      );

      console.log(`📦 Found ${newOrdersToSync.length} new completed orders to sync`);

      let syncedCount = 0;
      const newProducts: EnhancedProduct[] = [];

      // Process each new completed order
      for (const order of newOrdersToSync) {

        // Process each product item in the order
        if (order.productOrderItem && order.productOrderItem.length > 0) {
          for (let itemIndex = 0; itemIndex < order.productOrderItem.length; itemIndex++) {
            const item = order.productOrderItem[itemIndex];
            
            if (!item.productOffering?.id || !item.productOffering?.name) {
              console.warn(`⚠️ Skipping item ${itemIndex} in order ${order.id} - missing product offering data`);
              continue;
            }

            // Create inventory product for each order item
            try {
              const inventoryProductData: CreateProductForm = {
                name: item.productOffering.name,
                description: `Auto-synced from completed order ${order.id}. Original description: ${order.description || 'N/A'}`,
                productSerialNumber: `AUTO-${order.id?.slice(0, 7)}-${itemIndex + 1}`,
                status: 'active' as const,
                isBundle: false,
                isCustomerVisible: true,
                productOfferingId: item.productOffering.id
              };

              // Create the product using the API
              const createdProduct = await productInventoryApi.createProduct(inventoryProductData);
              
              // Save enhanced metadata using our utility
              saveEnhancedProductData(createdProduct.id, {
                sourceOrderId: order.id,
                syncedFromOrder: true,
                originalQuantity: item.quantity || 1,
                orderDate: order.orderDate
              });
              
              // Add enhanced properties for immediate use
              const enhancedProduct: EnhancedProduct = {
                ...createdProduct,
                sourceOrderId: order.id,
                syncedFromOrder: true,
                originalQuantity: item.quantity || 1,
                orderDate: order.orderDate
              };
              
              newProducts.push(enhancedProduct);
              syncedCount++;
              
              console.log(`✅ Created inventory product for ${item.productOffering.name} from order ${order.id}`);
              
            } catch (error) {
              console.error(`❌ Failed to create inventory product for order ${order.id}, item ${itemIndex}:`, error);
            }
          }
        }
      }

      // Update local state with enhanced products
      const allProducts = enhanceProducts([...existingProducts, ...newProducts.map(p => ({ ...p, sourceOrderId: undefined, syncedFromOrder: undefined, originalQuantity: undefined, orderDate: undefined }))]);
      setProducts(allProducts);
      calculateStats(allProducts);
      setLastSyncTime(new Date().toISOString());

      if (syncedCount > 0) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced ${syncedCount} products from ${completedOrders.length} completed orders.`,
        });
      } else {
        toast({
          title: "Sync Complete",
          description: "No new completed orders to sync. All orders are up to date.",
        });
      }

      console.log(`✅ Sync complete. Created ${syncedCount} new inventory products.`);

    } catch (error) {
      console.error('❌ Error syncing completed orders:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync completed orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncingFromOrders(false);
    }
  };

  // Calculate inventory statistics
  const calculateStats = (productsArray: EnhancedProduct[]) => {
    const active = productsArray.filter(p => p.status === 'active').length;
    const suspended = productsArray.filter(p => p.status === 'suspended').length;
    const terminated = productsArray.filter(p => p.status === 'terminated').length;
    const created = productsArray.filter(p => p.status === 'created').length;
    const bundles = productsArray.filter(p => p.isBundle === true).length;
    const customerVisible = productsArray.filter(p => p.isCustomerVisible === true).length;
    const autoSynced = productsArray.filter(p => (p as any).syncedFromOrder === true).length;

    setStats({
      totalProducts: productsArray.length,
      activeProducts: active,
      suspendedProducts: suspended,
      terminatedProducts: terminated,
      createdProducts: created,
      bundleProducts: bundles,
      customerVisibleProducts: customerVisible,
      autoSyncedProducts: autoSynced
    });
  };

  // Combined fetch and sync function
  const fetchDataAndSync = async () => {
    await fetchInventoryData();
    await syncCompletedOrdersToInventory();
  };

  // Initial load with auto-sync
  useEffect(() => {
    fetchDataAndSync();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Product Inventory Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and manage product inventory with automatic order sync
          </p>
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground mt-1">
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={fetchDataAndSync} 
            disabled={loading || syncingFromOrders} 
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || syncingFromOrders) ? 'animate-spin' : ''}`} />
            Refresh & Sync
          </Button>
          <Button 
            variant="outline" 
            onClick={syncCompletedOrdersToInventory} 
            disabled={syncingFromOrders} 
            className="w-full sm:w-auto"
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${syncingFromOrders ? 'animate-spin' : ''}`} />
            {syncingFromOrders ? 'Syncing...' : 'Sync Orders'}
          </Button>
        </div>
      </div>





      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTabContent stats={stats} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <InventoryProductList 
            products={products}
            loading={loading}
            onRefreshData={fetchDataAndSync}
            stats={stats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}