// components/CreateDialogs.tsx - FIXED VERSION
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  Plus, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Package,
  Smartphone,
  Building,
  Cloud,
  Wifi
} from "lucide-react";
import { CATEGORIES, CategoryIcons } from "./CategoryConfig";
import { MongoProductOffering, CustomAttribute } from "../hooks/useMongoOfferingsLogic";
import { HierarchicalCategorySelector } from "./HierarchicalCategorySelector";
import { CategoryHierarchy, SubCategory, SubSubCategory } from "../../shared/product-order-types";

interface SubCategorySelection {
  subCategory: string;
  subSubCategory: string;
}

interface CreateDialogsProps {
  isCreateDialogOpen: boolean;
  createDialogType: 'category' | 'spec' | 'offering' | 'price';
  isEditDialogOpen: boolean;
  isViewDialogOpen: boolean;
  selectedOffering: MongoProductOffering | null;
  formData: {
    name: string;
    lifecycleStatus: 'Active' | 'Draft' | 'Retired';
    category: string;
    subCategory: string;
    subSubCategory: string;
    hierarchicalCategory?: {
      mainCategory: CategoryHierarchy;
      subCategories: Array<{
        subCategory: SubCategory;
        subSubCategories: SubSubCategory[];
      }>;
    };
    broadbandSelections?: SubCategorySelection[];
    description: string;
    customAttributes: CustomAttribute[];
    isBundle: boolean;
    isSellable: boolean;
    pricing: {
      amount: number;
      currency: string;
      period: string;
      setupFee: number;
      deposit: number;
    };
  };
  currentStep: number;
  editingOffering: MongoProductOffering | null;
  setIsCreateDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  setFormData: (data: any) => void;
  resetForm: () => void;
  handleCreate: (formData: FormData) => void;
  createMongoOffering: () => Promise<void>; // Make this async
  updateMongoOffering: () => Promise<void>; // Make this async
  handleCategoryChange: (selection: {
    mainCategory: CategoryHierarchy;
    subCategories: Array<{
      subCategory: SubCategory;
      subSubCategories: SubSubCategory[];
    }>;
  }) => void;
  handleBroadbandSelectionsChange?: (selections: SubCategorySelection[]) => void;
  addCustomAttribute: () => void;
  updateCustomAttribute: (id: string, field: keyof CustomAttribute, value: any) => void;
  removeCustomAttribute: (id: string) => void;
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

export const CreateDialogs: React.FC<CreateDialogsProps> = ({
  isCreateDialogOpen,
  createDialogType,
  isEditDialogOpen,
  isViewDialogOpen,
  selectedOffering,
  formData,
  currentStep,
  editingOffering,
  setIsCreateDialogOpen,
  setIsEditDialogOpen,
  setIsViewDialogOpen,
  setCurrentStep,
  setFormData,
  resetForm,
  handleCreate,
  createMongoOffering,
  updateMongoOffering,
  handleCategoryChange,
  handleBroadbandSelectionsChange,
  addCustomAttribute,
  updateCustomAttribute,
  removeCustomAttribute
}) => {
  
  // Validation function
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.category;
      case 2:
        return formData.description.trim();
      case 3:
        return formData.pricing.amount > 0;
      default:
        return true;
    }
  };

  // Handle create offering with proper async handling
  const handleCreateOffering = async () => {
    try {
      await createMongoOffering();
      // Dialog will be closed by the createMongoOffering function
    } catch (error) {
      console.error('Error in handleCreateOffering:', error);
    }
  };

  // Handle update offering with proper async handling
  const handleUpdateOffering = async () => {
    try {
      await updateMongoOffering();
      // Dialog will be closed by the updateMongoOffering function
    } catch (error) {
      console.error('Error in handleUpdateOffering:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Offering Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Smart Family Bundle"
              required
            />
            {!formData.name.trim() && (
              <p className="text-sm text-red-600">Offering name is required</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select 
                value={formData.lifecycleStatus} 
                onValueChange={(value: 'Active' | 'Draft' | 'Retired') => setFormData(prev => ({ ...prev, lifecycleStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Hierarchical Category Selector */}
          <HierarchicalCategorySelector
            onCategorySelect={handleCategoryChange}
            selectedCategory={formData.hierarchicalCategory}
            showSubCategories={true}
            showSubSubCategories={true}
            className="mt-2"
          />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isBundle" 
                checked={formData.isBundle}
                onChange={(e) => setFormData(prev => ({ ...prev, isBundle: e.target.checked }))}
              />
              <Label htmlFor="isBundle">Is Bundle Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isSellable" 
                checked={formData.isSellable}
                onChange={(e) => setFormData(prev => ({ ...prev, isSellable: e.target.checked }))}
              />
              <Label htmlFor="isSellable">Is Sellable</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Description & Features</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your product offering in detail..."
              rows={4}
              required
            />
            {!formData.description.trim() && (
              <p className="text-sm text-red-600">Description is required</p>
            )}
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Custom Attributes</Label>
              <Button type="button" onClick={addCustomAttribute} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Attribute
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.customAttributes.map((attr) => (
                <div key={attr.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Input
                    placeholder="Attribute name (e.g., Speed, Data, Support)"
                    value={attr.name}
                    onChange={(e) => updateCustomAttribute(attr.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g., 100 Mbps, Unlimited, 24/7)"
                    value={attr.value}
                    onChange={(e) => updateCustomAttribute(attr.id, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeCustomAttribute(attr.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {formData.customAttributes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No custom attributes added yet. Click "Add Attribute" to create features for your product.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pricing Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Price Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.pricing.amount || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, amount: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Enter price amount"
                required
              />
              {formData.pricing.amount <= 0 && (
                <p className="text-sm text-red-600">Valid price amount is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={formData.pricing.currency} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, currency: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR (Sri Lankan Rupee)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Billing Period</Label>
            <Select 
              value={formData.pricing.period} 
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                pricing: { ...prev.pricing, period: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per month">Per Month</SelectItem>
                <SelectItem value="per year">Per Year</SelectItem>
                <SelectItem value="one-time">One Time</SelectItem>
                <SelectItem value="per week">Per Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setupFee">Setup Fee (Optional)</Label>
              <Input
                id="setupFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.pricing.setupFee || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, setupFee: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deposit">Security Deposit (Optional)</Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.pricing.deposit || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, deposit: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Pricing Preview</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Main Price:</strong> {formData.pricing.currency} {formData.pricing.amount.toLocaleString()} {formData.pricing.period}</p>
              {formData.pricing.setupFee > 0 && (
                <p><strong>Setup Fee:</strong> {formData.pricing.currency} {formData.pricing.setupFee.toLocaleString()}</p>
              )}
              {formData.pricing.deposit > 0 && (
                <p><strong>Security Deposit:</strong> {formData.pricing.currency} {formData.pricing.deposit.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Enhanced Create MongoDB Offering Dialog */}
      <Dialog open={isCreateDialogOpen && createDialogType === 'offering'} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New MongoDB Offering</DialogTitle>
            <DialogDescription>
              Step {currentStep} of 3 - {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Description & Features' : 'Pricing Information'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!validateCurrentStep()}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCreateOffering}
                  disabled={!validateCurrentStep()}
                >
                  Save to MongoDB
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit MongoDB Offering Dialog - Conditional Content */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit MongoDB Offering</DialogTitle>
            <DialogDescription>
              {currentStep === 3 ? 'Step 3 of 3 - Pricing Information' : `Step ${currentStep} of 3 - ${
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Description & Features' : 'Pricing Information'
              }`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!validateCurrentStep()}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleUpdateOffering}
                  disabled={!validateCurrentStep()}
                >
                  Update in MongoDB
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View MongoDB Offering Dialog */}
      <Dialog open={isViewDialogOpen && selectedOffering !== null} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>MongoDB Offering Details</DialogTitle>
            <DialogDescription>
              {selectedOffering?.name} - {selectedOffering?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffering && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedOffering.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedOffering.lifecycleStatus)}>
                    {selectedOffering.lifecycleStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const CategoryIcon = CategoryIcons[selectedOffering.category as keyof typeof CategoryIcons]?.icon || Package;
                      const categoryColor = CategoryIcons[selectedOffering.category as keyof typeof CategoryIcons]?.color || 'text-gray-600';
                      return <CategoryIcon className={`w-4 h-4 ${categoryColor}`} />;
                    })()}
                    <span className="text-sm text-muted-foreground">{selectedOffering.category}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="flex gap-1">
                    {selectedOffering.isBundle && <Badge variant="outline">Bundle</Badge>}
                    {selectedOffering.isSellable && <Badge variant="outline">Sellable</Badge>}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedOffering.description}</p>
              </div>
              
              {/* Custom Attributes */}
              {selectedOffering.customAttributes && selectedOffering.customAttributes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Features & Specifications</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOffering.customAttributes.map((attr) => (
                      <div key={attr.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-700">{attr.name}</span>
                        <span className="text-gray-600">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pricing */}
              <div>
                <Label className="text-sm font-medium">Pricing Details</Label>
                <div className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {selectedOffering.pricing.currency} {selectedOffering.pricing.amount.toLocaleString()}
                    </span>
                    <span className="text-blue-100 text-sm">
                      {selectedOffering.pricing.period}
                    </span>
                  </div>
                  
                  {(selectedOffering.pricing.setupFee > 0 || selectedOffering.pricing.deposit > 0) && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-blue-100">
                      {selectedOffering.pricing.setupFee > 0 && (
                        <div>
                          <span className="block font-medium">Setup Fee</span>
                          <span>{selectedOffering.pricing.currency} {selectedOffering.pricing.setupFee.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedOffering.pricing.deposit > 0 && (
                        <div>
                          <span className="block font-medium">Security Deposit</span>
                          <span>{selectedOffering.pricing.currency} {selectedOffering.pricing.deposit.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-muted-foreground">
                    {new Date(selectedOffering.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ID</Label>
                  <p className="text-muted-foreground font-mono">{selectedOffering.id}</p>
                </div>
                {selectedOffering.updatedAt && (
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-muted-foreground">
                      {new Date(selectedOffering.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedOffering._id && (
                  <div>
                    <Label className="text-sm font-medium">MongoDB ID</Label>
                    <p className="text-muted-foreground font-mono text-xs">{selectedOffering._id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog for basic catalog items */}
      <Dialog open={isCreateDialogOpen && createDialogType !== 'offering'} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Create New {createDialogType.charAt(0).toUpperCase() + createDialogType.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Add a new {createDialogType} to the catalog
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleCreate(formData);
          }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>

              {createDialogType === 'spec' && (
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" name="brand" placeholder="e.g., Samsung, Apple, Nokia" />
                </div>
              )}

              {createDialogType === 'price' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceType">Price Type *</Label>
                    <Select name="priceType" defaultValue="recurring">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recurring">Recurring</SelectItem>
                        <SelectItem value="oneTime">One Time</SelectItem>
                        <SelectItem value="usage">Usage Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="value">Price Value</Label>
                      <Input id="value" name="value" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Currency</Label>
                      <Select name="unit" defaultValue="LKR">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LKR">LKR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Note: Price creation may not work as the backend API endpoint is not implemented.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};