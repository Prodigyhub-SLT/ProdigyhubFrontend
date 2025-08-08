// components/SpecDialogs.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  Settings,
  X,
  Check
} from "lucide-react";
import { CATEGORIES, CategoryIcons } from "./CategoryConfig";
import { MongoProductSpec, SpecCharacteristic } from "../hooks/useMongoSpecsLogic";

interface SpecDialogsProps {
  // Create Dialog Props
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  
  // Edit Dialog Props
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  editingSpec: MongoProductSpec | null;
  
  // View Dialog Props
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: (open: boolean) => void;
  selectedSpec: MongoProductSpec | null;
  
  // Form Data
  formData: {
    name: string;
    description: string;
    category: string;
    lifecycleStatus: 'Active' | 'Draft' | 'Retired';
    brand: string;
    version: string;
    characteristics: SpecCharacteristic[];
  };
  setFormData: (data: any) => void;
  
  // Form Actions
  resetForm: () => void;
  createMongoSpec: () => void;
  updateMongoSpec: () => void;
  handleCategoryChange: (category: string) => void;
  addCharacteristic: () => void;
  updateCharacteristic: (id: string, field: keyof SpecCharacteristic, value: any) => void;
  removeCharacteristic: (id: string) => void;
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

export const SpecDialogs: React.FC<SpecDialogsProps> = ({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingSpec,
  isViewDialogOpen,
  setIsViewDialogOpen,
  selectedSpec,
  formData,
  setFormData,
  resetForm,
  createMongoSpec,
  updateMongoSpec,
  handleCategoryChange,
  addCharacteristic,
  updateCharacteristic,
  removeCharacteristic
}) => {
  const handleClose = (type: 'create' | 'edit' | 'view') => {
    switch (type) {
      case 'create':
        setIsCreateDialogOpen(false);
        resetForm();
        break;
      case 'edit':
        setIsEditDialogOpen(false);
        resetForm();
        break;
      case 'view':
        setIsViewDialogOpen(false);
        break;
    }
  };

  const handleSubmit = async (type: 'create' | 'edit') => {
    if (type === 'create') {
      await createMongoSpec();
    } else {
      await updateMongoSpec();
    }
  };

  return (
    <>
      {/* Create Specification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => !open && handleClose('create')}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Create New MongoDB Specification
            </DialogTitle>
            <DialogDescription>
              Create a detailed product specification with characteristics and features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
          {/* Basic Information - Simplified */}
<Card>
  <CardHeader>
    <CardTitle className="text-lg">Basic Information</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="spec-name">Specification Name *</Label>
        <Input
          id="spec-name"
          placeholder="e.g., Premium Fiber Internet Spec"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="spec-category">Category *</Label>
        <Select value={formData.category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    {cat.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="spec-status">Status</Label>
      <Select 
        value={formData.lifecycleStatus} 
        onValueChange={(value) => setFormData(prev => ({ 
          ...prev, 
          lifecycleStatus: value as 'Active' | 'Draft' | 'Retired' 
        }))}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Draft">Draft</SelectItem>
          <SelectItem value="Retired">Retired</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="spec-description">Description *</Label>
      <Textarea
        id="spec-description"
        placeholder="Detailed description of the product specification..."
        rows={4}
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
    </div>
  </CardContent>
</Card>

            {/* Characteristics */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Characteristics
                    </CardTitle>
                    <CardDescription>
                      Define the technical specifications and features
                    </CardDescription>
                  </div>
                  <Button onClick={addCharacteristic} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Characteristic
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.characteristics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No characteristics defined yet</p>
                    <p className="text-sm">Click "Add Characteristic" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.characteristics.map((char, index) => (
                      <Card key={char.id} className="relative">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-medium">Characteristic #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCharacteristic(char.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Name *</Label>
                              <Input
                                placeholder="e.g., Internet Speed"
                                value={char.name}
                                onChange={(e) => updateCharacteristic(char.id, 'name', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Value Type</Label>
                              <Select 
                                value={char.valueType} 
                                onValueChange={(value) => updateCharacteristic(char.id, 'valueType', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                  <SelectItem value="object">Object</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Describe this characteristic..."
                              rows={2}
                              value={char.description}
                              onChange={(e) => updateCharacteristic(char.id, 'description', e.target.value)}
                            />
                          </div>
                          
                          <div className="mt-4 flex items-center space-x-2">
                            <Checkbox
                              id={`configurable-${char.id}`}
                              checked={char.configurable}
                              onCheckedChange={(checked) => updateCharacteristic(char.id, 'configurable', checked)}
                            />
                            <Label htmlFor={`configurable-${char.id}`} className="text-sm">
                              Configurable by customer
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose('create')}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit('create')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Specification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Specification Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && handleClose('edit')}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Edit MongoDB Specification
            </DialogTitle>
            <DialogDescription>
              Update specification details and characteristics
            </DialogDescription>
          </DialogHeader>

          {/* Same form content as create dialog */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-spec-name">Specification Name *</Label>
                    <Input
                      id="edit-spec-name"
                      placeholder="e.g., Premium Fiber Internet Spec"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-spec-category">Category *</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${cat.color}`} />
                                {cat.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-spec-status">Status</Label>
                    <Select 
                      value={formData.lifecycleStatus} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        lifecycleStatus: value as 'Active' | 'Draft' | 'Retired' 
                      }))}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-spec-brand">Brand</Label>
                    <Input
                      id="edit-spec-brand"
                      placeholder="e.g., ProdigyHub"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-spec-version">Version</Label>
                    <Input
                      id="edit-spec-version"
                      placeholder="e.g., 1.0"
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-spec-description">Description *</Label>
                  <Textarea
                    id="edit-spec-description"
                    placeholder="Detailed description of the product specification..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Characteristics - Same as create dialog */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Characteristics
                    </CardTitle>
                    <CardDescription>
                      Define the technical specifications and features
                    </CardDescription>
                  </div>
                  <Button onClick={addCharacteristic} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Characteristic
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.characteristics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No characteristics defined yet</p>
                    <p className="text-sm">Click "Add Characteristic" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.characteristics.map((char, index) => (
                      <Card key={char.id} className="relative">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-medium">Characteristic #{index + 1}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCharacteristic(char.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Name *</Label>
                              <Input
                                placeholder="e.g., Internet Speed"
                                value={char.name}
                                onChange={(e) => updateCharacteristic(char.id, 'name', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Value Type</Label>
                              <Select 
                                value={char.valueType} 
                                onValueChange={(value) => updateCharacteristic(char.id, 'valueType', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                  <SelectItem value="object">Object</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Describe this characteristic..."
                              rows={2}
                              value={char.description}
                              onChange={(e) => updateCharacteristic(char.id, 'description', e.target.value)}
                            />
                          </div>
                          
                          <div className="mt-4 flex items-center space-x-2">
                            <Checkbox
                              id={`edit-configurable-${char.id}`}
                              checked={char.configurable}
                              onCheckedChange={(checked) => updateCharacteristic(char.id, 'configurable', checked)}
                            />
                            <Label htmlFor={`edit-configurable-${char.id}`} className="text-sm">
                              Configurable by customer
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose('edit')}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit('edit')} className="bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              Update Specification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Specification Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => !open && handleClose('view')}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {selectedSpec?.name || 'Specification Details'}
            </DialogTitle>
            <DialogDescription>
              View complete specification information and characteristics
            </DialogDescription>
          </DialogHeader>

          {selectedSpec && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <Badge className={getStatusColor(selectedSpec.lifecycleStatus)}>
                      {selectedSpec.lifecycleStatus?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Category</h4>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const CategoryIcon = CategoryIcons[selectedSpec.category as keyof typeof CategoryIcons]?.icon || BookOpen;
                          const categoryColor = CategoryIcons[selectedSpec.category as keyof typeof CategoryIcons]?.color || 'text-gray-600';
                          return (
                            <>
                              <CategoryIcon className={`w-5 h-5 ${categoryColor}`} />
                              <span>{selectedSpec.category}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Brand & Version</h4>
                      <p>{selectedSpec.brand || 'No brand'} v{selectedSpec.version}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedSpec.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Created</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedSpec.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {selectedSpec.updatedAt && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Last Updated</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedSpec.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
              )}
        </DialogContent>
      </Dialog>
    </>
  );
};