// ProductCatalogDashboard.tsx - UPDATED WITH AUTO-REFRESH
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Package, 
  DollarSign, 
  FolderTree, 
  Plus, 
  RefreshCw, 
  AlertCircle,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productCatalogApi } from "@/lib/api";

// Import sub-components
import { EnhancedOfferingsTab } from "../components/EnhancedOfferingsTab";
import { EnhancedSpecsTab } from "../components/EnhancedSpecsTab";
import { OverviewTab } from "../components/OverviewTab";
import { CreateDialogs } from "../components/CreateDialogs";
import { SpecDialogs } from "../components/SpecDialogs";
import { CategoryIcons, CATEGORIES } from "../components/CategoryConfig";
import { useProductCatalogState } from "../hooks/useProductCatalogState";
import { useMongoOfferingsLogic, MongoProductOffering, CustomAttribute } from "../hooks/useMongoOfferingsLogic";
import { useMongoSpecsLogic, MongoProductSpec, SpecCharacteristic } from "../hooks/useMongoSpecsLogic";
import { EnhancedPricesTab } from "../components/EnhancedPricesTab";
import { CategoryManagementTab } from "../components/CategoryManagementTab";

import type { 
  Category, 
  ProductSpecification, 
  ProductOffering, 
  ProductOfferingPrice,
  CreateCategoryForm,
  CreateSpecificationForm,
  CreateOfferingForm,
  CreatePriceForm,
  QueryParams
} from "@shared/product-order-types";

export default function ProductCatalogDashboard() {
  // Use custom hooks for state management
  const {
    stats,
    categories,
    specs,
    offerings,
    prices,
    loading,
    searchTerm,
    statusFilter,
    categoryFilter,
    isCreateDialogOpen,
    createDialogType,
    activeTab,
    setStats,
    setCategories,
    setSpecs,
    setOfferings,
    setPrices,
    setLoading,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setIsCreateDialogOpen,
    setCreateDialogType,
    setActiveTab
  } = useProductCatalogState();

  // MongoDB Offerings Logic
  const {
    mongoOfferings,
    formData: offeringsFormData,
    currentStep: offeringsCurrentStep,
    editingOffering,
    selectedOffering,
    isEditDialogOpen: isOfferingsEditDialogOpen,
    isViewDialogOpen: isOfferingsViewDialogOpen,
    setMongoOfferings,
    setFormData: setOfferingsFormData,
    setCurrentStep: setOfferingsCurrentStep,
    setEditingOffering,
    setSelectedOffering,
    setIsEditDialogOpen: setIsOfferingsEditDialogOpen,
    setIsViewDialogOpen: setIsOfferingsViewDialogOpen,
    createMongoOffering,
    updateMongoOffering,
    deleteMongoOffering,
    resetForm: resetOfferingsForm,
    loadOfferingForEdit,
    addCustomAttribute,
    updateCustomAttribute,
    removeCustomAttribute,
    handleCategoryChange: handleOfferingsCategoryChange,
    handleBroadbandSelectionsChange,
    loadOfferingsFromTMF620,
    deleteAllOfferings,
    backfillCategoryFields
  } = useMongoOfferingsLogic();

  // MongoDB Specs Logic
  const {
    mongoSpecs,
    formData: specsFormData,
    currentStep: specsCurrentStep,
    editingSpec,
    selectedSpec,
    isEditDialogOpen: isSpecsEditDialogOpen,
    isViewDialogOpen: isSpecsViewDialogOpen,
    setMongoSpecs,
    setFormData: setSpecsFormData,
    setCurrentStep: setSpecsCurrentStep,
    setEditingSpec,
    setSelectedSpec,
    setIsEditDialogOpen: setIsSpecsEditDialogOpen,
    setIsViewDialogOpen: setIsSpecsViewDialogOpen,
    createMongoSpec,
    updateMongoSpec,
    deleteMongoSpec,
    resetForm: resetSpecsForm,
    loadSpecForEdit,
    addCharacteristic,
    updateCharacteristic,
    removeCharacteristic,
    handleCategoryChange: handleSpecsCategoryChange,
    loadSpecsFromTMF620
  } = useMongoSpecsLogic();

  const { toast } = useToast();

  // ENHANCED: Refresh both offerings and specs data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, specsData, offeringsData, pricesData] = await Promise.all([
        productCatalogApi.getCategories({ limit: 100 }).catch((error) => {
          console.warn('Categories API not available:', error.message);
          return [];
        }),
        productCatalogApi.getSpecifications({ limit: 100 }).catch((error) => {
          console.warn('Specifications API not available:', error.message);
          return [];
        }),
        productCatalogApi.getOfferings({ limit: 100 }).catch((error) => {
          console.warn('Offerings API not available:', error.message);
          return [];
        }),
        productCatalogApi.getPrices().catch((error) => {
          console.warn('Prices API not available (404 expected):', error.message);
          return [];
        })
      ]);

      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      const specsArray = Array.isArray(specsData) ? specsData : [];
      const offeringsArray = Array.isArray(offeringsData) ? offeringsData : [];
      const pricesArray = Array.isArray(pricesData) ? pricesData : [];

      setCategories(categoriesArray);
      setSpecs(specsArray);
      setOfferings(offeringsArray);
      setPrices(pricesArray);

      // Also refresh MongoDB data
      await Promise.all([
        loadOfferingsFromTMF620(),
        loadSpecsFromTMF620()
      ]);

    } catch (error) {
      console.error('Error fetching catalog data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch some catalog data. Some features may be limited.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update stats when MongoDB data changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalSpecs: mongoSpecs.length,
      totalOfferings: mongoOfferings.length,
      activeSpecs: mongoSpecs.filter((s: any) => s.lifecycleStatus === 'Active').length,
      activeOfferings: mongoOfferings.filter((o: any) => o.lifecycleStatus === 'Active').length,
    }));
  }, [mongoSpecs, mongoOfferings, setStats]);

  // ENHANCED: Create offering with auto-spec creation and refresh
  const handleCreateOffering = async () => {
    try {
      await createMongoOffering();
      
      // After successful creation, refresh the specs data to show the auto-created spec
      setTimeout(async () => {
        await loadSpecsFromTMF620();
        console.log('✅ Refreshed specs after offering creation');
      }, 1000); // Small delay to ensure the spec is created and saved
      
    } catch (error) {
      console.error('Error in handleCreateOffering:', error);
    }
  };

  // Basic CRUD operations for other entities
  const handleCreate = async (formData: FormData) => {
    try {
      const data = Object.fromEntries(formData.entries());
      
      switch (createDialogType) {
        case 'category':
          await productCatalogApi.createCategory({
            name: data.name as string,
            description: data.description as string,
            lifecycleStatus: 'Active'
          } as CreateCategoryForm);
          break;
          
        case 'spec':
          // This is handled by the SpecDialogs component
          return;
          
        case 'offering':
          // This is handled by the CreateDialogs component
          return;
          
        case 'price':
          try {
            await productCatalogApi.createPrice({
              name: data.name as string,
              description: data.description as string,
              priceType: data.priceType as 'recurring' | 'oneTime' | 'usage',
              value: data.value ? parseFloat(data.value as string) : undefined,
              unit: data.unit as string || 'LKR'
            } as CreatePriceForm);
          } catch (priceError) {
            console.warn('Price creation not supported by backend:', priceError);
            toast({
              title: "Feature Not Available",
              description: "Price creation is not currently supported by the backend API.",
              variant: "destructive",
            });
            setIsCreateDialogOpen(false);
            return;
          }
          break;
      }

      toast({
        title: "Success",
        description: `${createDialogType.charAt(0).toUpperCase() + createDialogType.slice(1)} created successfully`,
      });
      
      fetchData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error(`Error creating ${createDialogType}:`, error);
      toast({
        title: "Error",
        description: `Failed to create ${createDialogType}`,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string, type: string) => {
    try {
      switch (type.toLowerCase()) {
        case 'category':
          await productCatalogApi.deleteCategory(id);
          break;
        case 'specification':
          await productCatalogApi.deleteSpecification(id);
          break;
        case 'offering':
          await productCatalogApi.deleteOffering(id);
          break;
        case 'price':
          await productCatalogApi.deletePrice(id);
          break;
      }

      toast({
        title: "Success",
        description: `${type} deleted successfully`,
      });
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${type.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = (type: 'category' | 'spec' | 'offering' | 'price') => {
    setCreateDialogType(type);
    setIsCreateDialogOpen(true);
  };

  const handleBackfillCategoryFields = async () => {
    try {
      const result = await backfillCategoryFields();
      toast({
        title: "Backfill Complete",
        description: `Backfilled ${result.updatedCount} offerings with category fields.`,
      });
    } catch (error) {
      console.error('Error backfilling category fields:', error);
      toast({
        title: "Backfill Failed",
        description: `Failed to backfill category fields: ${error.message}`,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Product Catalog Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage catalogs, categories, specifications, and offerings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh All Data
          </Button>
          <Button
            variant="default"
            onClick={async () => {
              setLoading(true);
              try {
                const result = await backfillCategoryFields();
                toast({
                  title: 'Backfill complete',
                  description: `${result.updated || 0} offering(s) updated`,
                });
              } catch (e) {
                toast({
                  title: 'Backfill failed',
                  description: 'Could not update offerings. See console for details.',
                  variant: 'destructive',
                });
              } finally {
                await fetchData();
                setLoading(false);
              }
            }}
            className="w-full sm:w-auto"
          >
            Backfill Categories
          </Button>
        </div>
      </div>

      {/* Stats Overview - REMOVED - No longer showing duplicate cards */}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="offerings" className="text-xs sm:text-sm">
            Offerings
            {mongoOfferings.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {mongoOfferings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs sm:text-sm">
            Specs
            {mongoSpecs.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {mongoSpecs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="prices" className="text-xs sm:text-sm">
            Offers' Price
            {prices.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {prices.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">
            Categories
            <Badge variant="secondary" className="ml-2 text-xs">
              {categories.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab 
            stats={stats}
            categories={categories}
            specs={mongoSpecs} // Use MongoDB specs
            mongoOfferings={mongoOfferings}
            prices={prices}
            openCreateDialog={openCreateDialog}
          />
        </TabsContent>

        <TabsContent value="offerings" className="space-y-4">
          {/* Show info banner about auto-spec creation */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Auto-Specification Creation</h4>
                  <p className="text-sm text-green-700 mt-1">
                    When you create an offering, a corresponding specification will be automatically created 
                    with the same name, category, status, and description. Check the Specs tab to see them.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <EnhancedOfferingsTab 
            mongoOfferings={mongoOfferings}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            loading={loading}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            setCategoryFilter={setCategoryFilter}
            setSelectedOffering={setSelectedOffering}
            setIsViewDialogOpen={setIsOfferingsViewDialogOpen}
            loadOfferingForEdit={loadOfferingForEdit}
            deleteMongoOffering={deleteMongoOffering}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            setCreateDialogType={setCreateDialogType}
            deleteAllOfferings={deleteAllOfferings}
            backfillCategoryFields={handleBackfillCategoryFields}
          />
        </TabsContent>

        <TabsContent value="specs" className="space-y-4">
          {/* Show info banner about auto-creation */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Auto-Generated Specifications</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Specifications are automatically created when you create an offering. 
                    Each spec will have the same name, category, status, and description as its corresponding offering.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <EnhancedSpecsTab 
            mongoSpecs={mongoSpecs}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            loading={loading}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            setCategoryFilter={setCategoryFilter}
            setSelectedSpec={setSelectedSpec}
            setIsViewDialogOpen={setIsSpecsViewDialogOpen}
            loadSpecForEdit={loadSpecForEdit}
            deleteMongoSpec={deleteMongoSpec}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            setCreateDialogType={setCreateDialogType}
          />
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          {/* Show info banner about offer pricing */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Offers' Price</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    View pricing details from all product offerings. This tab displays the pricing information 
                    that users include when creating new offers, including main prices, setup fees, and security deposits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <EnhancedPricesTab 
            prices={prices}
            mongoOfferings={mongoOfferings}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            loading={loading}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            setCategoryFilter={setCategoryFilter}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            setCreateDialogType={setCreateDialogType}
            setSelectedOffering={setSelectedOffering}
            setIsViewDialogOpen={setIsOfferingsViewDialogOpen}
            loadOfferingForEdit={loadOfferingForEdit}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* Show info banner about category management */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FolderTree className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Category Management</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Manage your product catalog categories hierarchically. Create, edit, and delete main categories, 
                    sub-categories, and sub-sub-categories to organize your offerings effectively.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <CategoryManagementTab 
            onCategoriesChange={(updatedCategories) => {
              // Update the categories state if needed
              console.log('Categories updated:', updatedCategories);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Create Dialogs for Offerings */}
      <CreateDialogs 
        isCreateDialogOpen={isCreateDialogOpen && createDialogType === 'offering'}
        createDialogType={createDialogType}
        isEditDialogOpen={isOfferingsEditDialogOpen}
        isViewDialogOpen={isOfferingsViewDialogOpen}
        selectedOffering={selectedOffering}
        formData={offeringsFormData}
        currentStep={offeringsCurrentStep}
        editingOffering={editingOffering}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        setIsEditDialogOpen={setIsOfferingsEditDialogOpen}
        setIsViewDialogOpen={setIsOfferingsViewDialogOpen}
        setCurrentStep={setOfferingsCurrentStep}
        setFormData={setOfferingsFormData}
        resetForm={resetOfferingsForm}
        handleCreate={handleCreate}
        createMongoOffering={handleCreateOffering} // Use enhanced version
        updateMongoOffering={updateMongoOffering}
        handleCategoryChange={handleOfferingsCategoryChange}
        handleBroadbandSelectionsChange={handleBroadbandSelectionsChange}
        addCustomAttribute={addCustomAttribute}
        updateCustomAttribute={updateCustomAttribute}
        removeCustomAttribute={removeCustomAttribute}
      />

      {/* Spec Dialogs */}
      <SpecDialogs 
        isCreateDialogOpen={isCreateDialogOpen && createDialogType === 'spec'}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        isEditDialogOpen={isSpecsEditDialogOpen}
        setIsEditDialogOpen={setIsSpecsEditDialogOpen}
        editingSpec={editingSpec}
        isViewDialogOpen={isSpecsViewDialogOpen}
        setIsViewDialogOpen={setIsSpecsViewDialogOpen}
        selectedSpec={selectedSpec}
        formData={specsFormData}
        setFormData={setSpecsFormData}
        resetForm={resetSpecsForm}
        createMongoSpec={createMongoSpec}
        updateMongoSpec={updateMongoSpec}
        handleCategoryChange={handleSpecsCategoryChange}
        addCharacteristic={addCharacteristic}
        updateCharacteristic={updateCharacteristic}
        removeCharacteristic={removeCharacteristic}
      />

      {/* Generic Create Dialogs for other types */}
      {(isCreateDialogOpen && createDialogType !== 'offering' && createDialogType !== 'spec') && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create {createDialogType.charAt(0).toUpperCase() + createDialogType.slice(1)}</DialogTitle>
              <DialogDescription>
                Add a new {createDialogType} to your catalog
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreate(formData);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={`${createDialogType.charAt(0).toUpperCase() + createDialogType.slice(1)} name`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={`${createDialogType.charAt(0).toUpperCase() + createDialogType.slice(1)} description`}
                  rows={3}
                />
              </div>
              {createDialogType === 'price' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceType">Price Type</Label>
                      <Select name="priceType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recurring">Recurring</SelectItem>
                          <SelectItem value="oneTime">One Time</SelectItem>
                          <SelectItem value="usage">Usage Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">Value</Label>
                      <Input
                        id="value"
                        name="value"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Currency</Label>
                    <Input
                      id="unit"
                      name="unit"
                      placeholder="LKR"
                      defaultValue="LKR"
                    />
                  </div>
                </>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}