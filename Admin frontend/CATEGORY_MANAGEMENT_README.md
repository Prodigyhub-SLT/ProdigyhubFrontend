# Category Management System

## Overview

The Category Management System is a new tab in the Product Catalog Dashboard that allows administrators to manage the hierarchical structure of product categories. This system supports three levels of categorization:

1. **Main Categories** - Top-level product categories (e.g., Broadband, Business, Mobile)
2. **Sub-Categories** - Second-level categories within main categories (e.g., Connection Type, Service Type)
3. **Sub-Sub-Categories** - Third-level categories within sub-categories (e.g., Fiber, 4G, ADSL)

## Features

### ✅ Create Categories
- Add new main categories with custom icons, colors, and descriptions
- Create sub-categories within existing main categories
- Add sub-sub-categories within existing sub-categories

### ✅ Edit Categories
- Modify category names, descriptions, icons, and colors
- Update sub-category and sub-sub-category details
- Maintain hierarchical relationships during edits

### ✅ Delete Categories
- Remove categories with safety checks
- Cannot delete categories that have child categories
- Prevents orphaned sub-categories

### ✅ Visual Hierarchy
- Expandable/collapsible category tree view
- Color-coded icons for easy identification
- Badge counters showing the number of child categories

## How to Use

### Accessing Category Management

1. Navigate to the **Product Catalog Dashboard**
2. Click on the **Categories** tab (5th tab)
3. You'll see the category management interface with an orange info banner

### Adding a Main Category

1. Click the **"Add Main Category"** button at the top
2. Fill in the required fields:
   - **Value**: Internal identifier (e.g., "broadband")
   - **Label**: Display name (e.g., "Broadband")
   - **Icon**: Choose from available icons (Wifi, Settings, Smartphone, etc.)
   - **Color**: Select a color theme (Blue, Green, Purple, Red, etc.)
   - **Description**: Brief description of the category
3. Click **Create**

### Adding a Sub-Category

1. Expand a main category by clicking the chevron button
2. Click **"Add Sub-category"** at the bottom of the category
3. Fill in:
   - **Value**: Internal identifier (e.g., "connection_type")
   - **Label**: Display name (e.g., "Connection Type")
   - **Description**: Brief description
4. Click **Create**

### Adding a Sub-Sub-Category

1. Expand both the main category and sub-category
2. Click **"Add Sub-sub-category"** within the sub-category
3. Fill in:
   - **Value**: Internal identifier (e.g., "fiber")
   - **Label**: Display name (e.g., "Fiber")
   - **Description**: Brief description
4. Click **Create**

### Editing Categories

1. Click the **Edit** button (pencil icon) next to any category
2. Modify the fields as needed
3. Click **Update** to save changes

### Deleting Categories

1. Click the **Delete** button (trash icon) next to any category
2. **Note**: You cannot delete categories that have child categories
3. Delete child categories first, then delete the parent

## Current Category Structure

The system comes pre-configured with the following categories:

### 🌐 Broadband (Orange)
- **Connection Type**
  - Data/PEOTV & Voice Packages
  - Data Packages
  - Data & Voice
- **Package Usage Type**
  - Any Time
  - Time Based
  - Unlimited
- **Package Type**
  - 4G
  - ADSL
  - Fiber

### 🏢 Business (Green)
- **Service Type**
  - Dedicated Internet
  - Cloud Services
  - Managed Services
- **Business Size**
  - SME
  - Enterprise
  - Corporate

### 📱 Mobile (Purple)
- **Plan Type**
  - Prepaid
  - Postpaid
  - Hybrid
- **Data Plan**
  - Unlimited
  - Limited
  - Rollover

### ☁️ Cloud Service (Red)
- **Service Category**
  - Infrastructure as a Service
  - Platform as a Service
  - Software as a Service
- **Resource Type**
  - Storage
  - Computing
  - Networking

### 📦 Product (Indigo)
- **Product Category**
  - Hardware
  - Software
  - Accessories
- **Brand**
  - SLT Branded
  - Third Party
  - Generic

### 📺 PEOTV (Red)
- **Channel Packages**
  - Basic Package
  - Premium Package
  - Sports Package
- **Streaming Services**
  - PEOTVGO
  - International

### 📞 Telephone (Indigo)
- **Service Type**
  - Landline
  - VoIP
  - Mobile Voice

### 🎮 Gaming & Cloud (Pink)
- **Gaming Services**
  - Cloud Gaming
  - Gaming Accessories
- **Cloud Gaming**
  - Game Streaming
  - Gaming Servers

### 🌍 IDD (Cyan)
- **International Calling**
  - Asia Pacific
  - Europe
  - Americas
- **Data Roaming**
  - Regional Roaming
  - Global Roaming

### 🎁 Promotions (Yellow)
- **Promotion Type**
  - Seasonal Offers
  - Bundle Deals
  - New Customer

## Technical Details

### Data Structure

```typescript
interface CategoryHierarchy {
  value: string;           // Internal identifier
  label: string;           // Display name
  icon: string;            // Icon name
  color: string;           // CSS color class
  description: string;     // Category description
  subCategories?: SubCategory[];
}

interface SubCategory {
  value: string;           // Internal identifier
  label: string;           // Display name
  description: string;     // Sub-category description
  subSubCategories?: SubSubCategory[];
}

interface SubSubCategory {
  value: string;           // Internal identifier
  label: string;           // Display name
  description: string;     // Sub-sub-category description
}
```

### State Management

- Categories are managed locally in the component state
- Changes are logged to the console for debugging
- The `onCategoriesChange` callback can be used to sync with external systems

### Validation Rules

- **Value**: Must be unique within its parent level
- **Label**: Required field for display purposes
- **Description**: Optional but recommended for clarity
- **Icon**: Must be one of the predefined icon names
- **Color**: Must be a valid CSS color class

## Integration with Product Creation

When creating new product offerings, users can now select from the managed categories:

1. **Main Category**: Choose from the managed main categories
2. **Sub-Category**: Select from available sub-categories within the main category
3. **Sub-Sub-Category**: Pick from available sub-sub-categories within the sub-category

This ensures consistency across the product catalog and provides a structured way to organize offerings.

## Future Enhancements

- **Category Import/Export**: Bulk category management via CSV/JSON
- **Category Templates**: Pre-defined category structures for common business types
- **Category Analytics**: Usage statistics and category performance metrics
- **Category Permissions**: Role-based access control for category management
- **Category Versioning**: Track changes and rollback category modifications

## Troubleshooting

### Common Issues

1. **Cannot delete category**: Ensure all child categories are deleted first
2. **Duplicate value error**: Use unique values for each category level
3. **Icon not displaying**: Verify the icon name matches one of the available icons

### Best Practices

1. **Use descriptive names**: Make categories easy to understand for end users
2. **Maintain consistency**: Follow naming conventions across similar categories
3. **Plan hierarchy**: Think about the logical grouping before creating categories
4. **Regular review**: Periodically review and clean up unused categories

## Support

For technical support or questions about the Category Management System, please refer to the main project documentation or contact the development team.
