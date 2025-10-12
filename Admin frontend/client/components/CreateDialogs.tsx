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
  Wifi,
  Upload,
  Image as ImageIcon,
  Trash2,
  DollarSign
} from "lucide-react";
import { CATEGORIES, CategoryIcons } from "./CategoryConfig";
import { MongoProductOffering, CustomAttribute, OfferingImage } from "../hooks/useMongoOfferingsLogic";
import { HierarchicalCategorySelector } from "./HierarchicalCategorySelector";
import { CategoryHierarchy, SubCategory, SubSubCategory } from "../../shared/product-order-types";
import { getCategoryLabel } from "../lib/utils";

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
    images: OfferingImage[];
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
  addImage: (file: File, name: string, description: string, categoryName: string) => Promise<void>;
  updateImage: (id: string, field: keyof OfferingImage, value: any) => void;
  removeImage: (id: string) => void;
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
  removeCustomAttribute,
  addImage,
  updateImage,
  removeImage
}) => {
  
  // Validation function
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.category;
      case 2:
        return formData.description.trim();
      case 3:
        return true; // Images are optional
      case 4:
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

  const renderStep3 = () => {
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image. Please select only image files.`);
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Please select images smaller than 5MB.`);
          continue;
        }

        try {
          const name = file.name.split('.')[0] || 'Image';
          const description = `Uploaded image: ${file.name}`;
          const categoryName = 'General';
          
          await addImage(file, name, description, categoryName);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert(`Failed to upload ${file.name}. Please try again.`);
        }
      }
      
      // Clear the input
      event.target.value = '';
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Images & Media</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add images to showcase your offering. Each image can have custom attributes and optional pricing.
          </p>
          
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Click to upload images or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
            </label>
          </div>

          {/* Images List */}
          {formData.images.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Uploaded Images ({formData.images.length})</h4>
              <div className="space-y-4">
                {formData.images.map((image) => (
                  <div key={image.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="flex-shrink-0">
                        <img
                          src={image.base64Data}
                          alt={image.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                      
                      {/* Image Details */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-600">Name</Label>
                            <Input
                              value={image.name}
                              onChange={(e) => updateImage(image.id, 'name', e.target.value)}
                              placeholder="Image name"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Category</Label>
                            <Input
                              value={image.categoryName}
                              onChange={(e) => updateImage(image.id, 'categoryName', e.target.value)}
                              placeholder="e.g., Branding, Marketing"
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-600">Description</Label>
                          <Input
                            value={image.description}
                            onChange={(e) => updateImage(image.id, 'description', e.target.value)}
                            placeholder="Describe this image..."
                            className="text-sm"
                          />
                        </div>

                        {/* Add Function Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`function-${image.id}`}
                              checked={image.hasFunction}
                              onChange={(e) => updateImage(image.id, 'hasFunction', e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`function-${image.id}`} className="text-sm">
                              Add Function (Bundle Feature)
                            </Label>
                          </div>
                          
                          <Button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Function Price */}
                        {image.hasFunction && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <Label className="text-sm">Function Price:</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={image.functionPrice || ''}
                              onChange={(e) => updateImage(image.id, 'functionPrice', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-24 text-sm"
                            />
                            <span className="text-xs text-gray-500">LKR</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.images.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No images uploaded yet</p>
              <p className="text-sm">Upload images to showcase your offering</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
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
              Step {currentStep} of 4 - {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Description & Features' :
                currentStep === 3 ? 'Images & Media' : 'Pricing Information'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
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
              
              {currentStep < 4 ? (
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
                  Save
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
            {currentStep === 4 && renderStep4()}
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
              
              {currentStep < 4 ? (
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
                  Update
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
                      const normalizedCategory = getCategoryLabel(selectedOffering.category);
                      const CategoryIcon = CategoryIcons[normalizedCategory as keyof typeof CategoryIcons]?.icon || Package;
                      const categoryColor = CategoryIcons[normalizedCategory as keyof typeof CategoryIcons]?.color || 'text-gray-600';
                      return <CategoryIcon className={`w-4 h-4 ${categoryColor}`} />;
                    })()}
                    <span className="text-sm text-muted-foreground">{getCategoryLabel(selectedOffering.category)}</span>
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
              
              {/* Channels Gallery */}
              {selectedOffering.images && selectedOffering.images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Channels ({selectedOffering.images.length})</Label>
                  <div className="mt-3 space-y-6">
                    {(() => {
                      // Group images by category
                      const groupedImages = selectedOffering.images.reduce((groups: { [key: string]: typeof selectedOffering.images }, image) => {
                        const category = image.categoryName || 'Other';
                        if (!groups[category]) {
                          groups[category] = [];
                        }
                        groups[category].push(image);
                        return groups;
                      }, {});

                      return Object.entries(groupedImages).map(([category, images]) => (
                        <div key={category}>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {images.map((image) => (
                              <div key={image.id} className="relative group">
                                <div className={`aspect-[3/2] overflow-hidden rounded-lg border-2 bg-white shadow-sm ${
                                  image.hasFunction ? 'border-blue-500' : 'border-gray-200'
                                }`}>
                                  <img
                                    src={image.base64Data}
                                    alt={image.name}
                                    className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                                    onClick={() => {
                                      // Open image in full size (you can enhance this with a modal)
                                      window.open(image.base64Data, '_blank');
                                    }}
                                  />
                                </div>
                                
                                {/* Channel Number (Always Visible - Bottom Center) */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-80 text-white px-2 py-1 rounded text-xs font-medium">
                                  <span className="group-hover:hidden">{image.name}</span>
                                  <span className="hidden group-hover:inline">{image.description}</span>
                                </div>
                                
                                {/* Add Function Plus Line (Top Right Corner) */}
                                {image.hasFunction && (
                                  <div className="absolute top-1 right-1">
                                    {/* Plus line from top-right corner */}
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                      <span className="text-xs text-white font-bold">+</span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Add Function Hover Overlay (Description + Price) */}
                                {image.hasFunction && (
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-200 rounded-lg">
                                    <div className="absolute bottom-1 right-1 bg-blue-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      {image.description && (
                                        <p className="font-medium truncate max-w-24">{image.description}</p>
                                      )}
                                      {image.functionPrice && (
                                        <p className="font-bold text-green-300">
                                          Rs. {image.functionPrice.toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                    
                    {/* Images Summary */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Summary:</span>
                        <div className="flex gap-4">
                          <span>Total: {selectedOffering.images.length} images</span>
                          <span className="text-green-600 font-medium">
                            {selectedOffering.images.filter(img => img.hasFunction).length} with pricing
                          </span>
                        </div>
                      </div>
                    </div>
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