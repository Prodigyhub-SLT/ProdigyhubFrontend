# Category Management System with MongoDB Integration

This document describes the updated Category Management system that integrates with MongoDB to provide hierarchical category management for the SLT Prodigy Hub.

## Overview

The Category Management system now provides a comprehensive solution for managing hierarchical categories (main categories, sub-categories, and sub-sub-categories) with full MongoDB integration. All category operations are automatically saved to and retrieved from MongoDB, ensuring data persistence and consistency.

## Features

### 🗂️ Hierarchical Structure
- **Main Categories**: Top-level categories (e.g., Broadband, Mobile, Business)
- **Sub-Categories**: Second-level categories (e.g., Connection Type, Package Type)
- **Sub-Sub-Categories**: Third-level categories (e.g., Fiber, Cable, 4G)

### 💾 MongoDB Integration
- All categories are stored in the `hierarchical_categories` collection
- Automatic CRUD operations with MongoDB
- Real-time data synchronization
- Data persistence across application restarts

### 🔧 Management Operations
- **Create**: Add new categories at any level
- **Read**: View and browse hierarchical category structure
- **Update**: Modify existing category details
- **Delete**: Remove categories (with safety checks)
- **Expand/Collapse**: Interactive tree view for better navigation

## API Endpoints

The system uses the following MongoDB API endpoints:

### Main Categories
- `GET /productCatalogManagement/v5/hierarchicalCategory` - List all categories
- `POST /productCatalogManagement/v5/hierarchicalCategory` - Create new category
- `GET /productCatalogManagement/v5/hierarchicalCategory/:id` - Get category by ID
- `PATCH /productCatalogManagement/v5/hierarchicalCategory/:id` - Update category
- `DELETE /productCatalogManagement/v5/hierarchicalCategory/:id` - Delete category

### Sub-Categories
- `POST /productCatalogManagement/v5/hierarchicalCategory/:categoryId/subCategory` - Add sub-category
- `PATCH /productCatalogManagement/v5/hierarchicalCategory/:categoryId/subCategory/:subCategoryId` - Update sub-category
- `DELETE /productCatalogManagement/v5/hierarchicalCategory/:categoryId/subCategory/:subCategoryId` - Delete sub-category

### Sub-Sub-Categories
- `POST /productCatalogManagement/v5/hierarchicalCategory/:categoryId/subCategory/:subCategoryId/subSubCategory` - Add sub-sub-category
- `PATCH /productCatalogManagement/v5/hierarchicalCategory/:categoryId/subCategory/:subCategoryId/subSubCategory/:subSubCategoryId` - Update sub-sub-category
- `DELETE /productCatalogManagement/v5/hierarchicalCategory/:categoryId/subCategory/:subCategoryId/subSubCategory/:subSubCategoryId` - Delete sub-sub-category

## Data Structure

### CategoryHierarchy
```typescript
interface CategoryHierarchy {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  color: string;        // CSS color class (e.g., 'text-blue-600')
  bgColor: string;      // CSS background class (e.g., 'bg-blue-50')
  icon: string;         // Icon name (e.g., 'Wifi', 'Settings')
  subCategories: SubCategory[];
  '@type': 'HierarchicalCategory';
}
```

### SubCategory
```typescript
interface SubCategory {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  subSubCategories: SubSubCategory[];
}
```

### SubSubCategory
```typescript
interface SubSubCategory {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
}
```

## Usage

### 1. Accessing Category Management
Navigate to the **Product Catalog** section in the main navigation and click on the **Categories** tab.

### 2. Creating Categories

#### Main Category
1. Click the **"+ Add Main Category"** button
2. Fill in the required fields:
   - **Name**: Category name (e.g., "Broadband")
   - **Label**: Display name (e.g., "Broadband")
   - **Description**: Brief description
   - **Icon**: Choose from available icons
   - **Color**: Select text color
   - **Background Color**: Select background color
3. Click **Create**

#### Sub-Category
1. Expand a main category
2. Click **"+ Add Sub-category"**
3. Fill in the required fields:
   - **Name**: Sub-category name (e.g., "Connection Type")
   - **Label**: Display name
   - **Description**: Brief description
4. Click **Create**

#### Sub-Sub-Category
1. Expand a sub-category
2. Click **"+ Add Sub-sub-category"**
3. Fill in the required fields:
   - **Name**: Sub-sub-category name (e.g., "Fiber")
   - **Label**: Display name
   - **Description**: Brief description
4. Click **Create**

### 3. Editing Categories
- Click the **Edit** (pencil) icon next to any category
- Modify the desired fields
- Click **Update** to save changes

### 4. Deleting Categories
- Click the **Delete** (trash) icon next to any category
- Categories used by offerings cannot be deleted
- Confirm deletion when prompted

### 5. Loading Sample Data
- Click **"Load Sample Data to MongoDB"** to populate the system with example categories
- This is useful for testing and demonstration purposes

## MongoDB Schema

The system uses the following MongoDB schema for hierarchical categories:

```javascript
const HierarchicalCategorySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true, default: uuidv4 },
  name: { type: String, required: true },
  value: { type: String, required: false, unique: true, sparse: true },
  label: { type: String, required: false, default: function() { return this.name || 'Unnamed Category'; } },
  description: { type: String, default: '' },
  color: { type: String, required: false, default: 'text-blue-600' },
  bgColor: { type: String, required: false, default: 'bg-blue-50' },
  icon: { type: String, required: false, default: 'Folder' },
  subCategories: [{
    id: { type: String, unique: true, required: true, default: uuidv4 },
    name: { type: String, required: true },
    value: { type: String, required: false, unique: true, sparse: true },
    label: { type: String, required: false, default: function() { return this.name || 'Unnamed Sub-Category'; } },
    description: { type: String, default: '' },
    subSubCategories: [{
      id: { type: String, unique: true, required: true, default: uuidv4 },
      name: { type: String, required: true },
      value: { type: String, required: false, unique: true, sparse: true },
      label: { type: String, required: false, default: function() { return this.name || 'Unnamed Sub-Sub-Category'; } },
      description: { type: String, default: '' }
    }]
  }],
  '@type': { type: String, default: 'HierarchicalCategory' }
}, {
  timestamps: true,
  collection: 'hierarchical_categories'
});
```

## Testing

### Running the Test Suite
To test the MongoDB integration, run the test script:

```bash
cd Admin\ frontend
node test-hierarchical-categories.js
```

The test suite will:
1. Verify MongoDB connection
2. Test CRUD operations for all category levels
3. Clean up test data
4. Provide detailed results

### Test Configuration
Set the `TEST_BASE_URL` environment variable to test against different servers:

```bash
export TEST_BASE_URL=http://localhost:3000
node test-hierarchical-categories.js
```

## Integration with Offerings

Categories created in this system can be used in product offerings:

1. **Category Selection**: When creating product offerings, users can select from the available hierarchical categories
2. **Automatic Updates**: Changes to categories automatically reflect in offerings that use them
3. **Data Consistency**: Ensures all offerings use valid, managed categories

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: Required field validation with user-friendly messages
- **MongoDB Errors**: Proper error messages for database operations
- **Network Errors**: Connection timeout and retry mechanisms
- **User Feedback**: Toast notifications for all operations

## Best Practices

### Category Naming
- Use descriptive, consistent names
- Avoid special characters in values
- Use clear, user-friendly labels

### Hierarchy Design
- Keep the hierarchy logical and intuitive
- Limit depth to 3 levels for usability
- Use consistent naming patterns

### Data Management
- Regularly backup category data
- Monitor category usage in offerings
- Clean up unused categories

## Troubleshooting

### Common Issues

#### Categories Not Loading
- Check MongoDB connection
- Verify API endpoints are accessible
- Check browser console for errors

#### Category Creation Fails
- Ensure all required fields are filled
- Check for duplicate values
- Verify MongoDB permissions

#### Categories Not Saving
- Check network connectivity
- Verify API authentication
- Check MongoDB storage space

### Debug Information
The system provides detailed logging:
- Console logs for all operations
- Error details in toast notifications
- Network request/response logging

## Future Enhancements

Planned improvements include:
- **Bulk Operations**: Import/export categories
- **Category Templates**: Predefined category structures
- **Advanced Search**: Search and filter categories
- **Category Analytics**: Usage statistics and insights
- **API Rate Limiting**: Better performance management

## Support

For technical support or questions about the Category Management system:
- Check the console logs for detailed error information
- Review the MongoDB connection status
- Test API endpoints directly
- Contact the development team

---

**Note**: This system requires a running MongoDB instance and the backend API to be accessible. Ensure proper network configuration and database permissions are set up before use.
