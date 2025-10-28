// src/controllers/UnifiedControllers.js - MongoDB Controllers for All TMF APIs
const {
  Category, ProductSpecification, ProductOffering, ProductOfferingPrice, ProductCatalog,
  Product, CheckProductOfferingQualification, QueryProductOfferingQualification,
  ProductOrder, CancelProductOrder, Event, Hub, Topic, HierarchicalCategory
} = require('../models/AllTMFModels');
const { v4: uuidv4 } = require('uuid');

// ===================================
// SHARED UTILITY FUNCTIONS
// ===================================

const applyFieldSelection = (obj, fields) => {
  if (!fields || typeof fields !== 'string') {
    return obj;
  }
  
  const fieldsArray = fields.split(',').map(field => field.trim());
  const result = {};
  
  // Always include mandatory fields
  const mandatoryFields = ['@type', 'id', 'href'];
  const allFields = [...new Set([...fieldsArray, ...mandatoryFields])];
  
  allFields.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      result[field] = obj[field];
    }
  });
  
  return result;
};

const buildQuery = (Model, filters, fields) => {
  let query = Model.find(filters);
  
  if (fields) {
    const fieldList = fields.split(',').map(f => f.trim()).join(' ');
    query = query.select(`${fieldList} @type id href`);
  }
  
  return query;
};

const handleError = (res, error, operation = 'operation') => {
  console.error(`❌ Error during ${operation}:`, error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid data provided',
      details: Object.values(error.errors).map(e => e.message)
    });
  }
  
  if (error.code === 11000) {
    // Provide more context about which index/field caused the conflict
    const duplicateInfo = {
      index: (error && error.keyPattern) ? Object.keys(error.keyPattern).join(',') : undefined,
      keyValue: error && error.keyValue ? error.keyValue : undefined,
      message: error && error.message ? error.message : undefined
    };
    console.error('⚠️ Duplicate key error details:', duplicateInfo);
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
      details: duplicateInfo
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message
  });
};

// ===================================
// TMF620 - PRODUCT CATALOG CONTROLLERS
// ===================================

class TMF620Controller {
  // Category operations
  async getCategories(req, res) {
    try {
      const { fields, limit = 20, offset = 0, ...filters } = req.query;
      
      const query = buildQuery(Category, filters, fields);
      const categories = await query
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });
      
      res.json(categories);
    } catch (error) {
      handleError(res, error, 'get categories');
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      const query = buildQuery(Category, { id }, fields);
      const category = await query;
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      handleError(res, error, 'get category by ID');
    }
  }

  async createCategory(req, res) {
    try {
      const categoryData = {
        ...req.body,
        '@type': 'Category'
      };
      
      const category = new Category(categoryData);
      await category.save();
      
      res.status(201).json(category);
    } catch (error) {
      handleError(res, error, 'create category');
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body, lastUpdate: new Date() };
      
      const category = await Category.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      handleError(res, error, 'update category');
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      const category = await Category.findOneAndDelete({ id });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error, 'delete category');
    }
  }

  // Hierarchical Category operations for frontend category management
  async getHierarchicalCategories(req, res) {
    try {
      console.log('Getting hierarchical categories with query:', req.query);
      
      const { fields, limit = 100, offset = 0, ...filters } = req.query;
      
      const query = buildQuery(HierarchicalCategory, filters, fields);
      const categories = await query
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });
      
      console.log(`Found ${categories.length} hierarchical categories`);
      
      res.json(categories);
    } catch (error) {
      console.error('Error getting hierarchical categories:', error);
      handleError(res, error, 'get hierarchical categories');
    }
  }

  async getHierarchicalCategoryById(req, res) {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      const query = buildQuery(HierarchicalCategory, { categoryId: id }, fields);
      const category = await query;
      
      if (!category) {
        return res.status(404).json({ error: 'Hierarchical category not found' });
      }
      
      res.json(category);
    } catch (error) {
      handleError(res, error, 'get hierarchical category by ID');
    }
  }

  async createHierarchicalCategory(req, res) {
    try {
      const categoryData = {
        ...req.body,
        '@type': 'HierarchicalCategory'
      };
      
      // Ensure required fields are present
      if (!categoryData.name) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Name field is required'
        });
      }
      
      // Set defaults for optional fields
      if (!categoryData.value) {
        categoryData.value = categoryData.name.toLowerCase().replace(/\s+/g, '_');
      }
      if (!categoryData.label) {
        categoryData.label = categoryData.name;
      }
      if (!categoryData.color) {
        categoryData.color = 'text-blue-600';
      }
      if (!categoryData.bgColor) {
        categoryData.bgColor = 'bg-blue-50';
      }
      if (!categoryData.icon) {
        categoryData.icon = 'Folder';
      }
      if (!categoryData.description) {
        categoryData.description = '';
      }
      
      // Always generate fresh IDs to avoid accidental collisions from client payloads
      categoryData.categoryId = uuidv4();
      if (Array.isArray(categoryData.subCategories)) {
        categoryData.subCategories = categoryData.subCategories.map((sc) => ({
          ...sc,
          subCategoryId: uuidv4(),
          subSubCategories: Array.isArray(sc.subSubCategories)
            ? sc.subSubCategories.map((ssc) => ({
                ...ssc,
                subSubCategoryId: uuidv4()
              }))
            : []
        }));
      } else {
        categoryData.subCategories = [];
      }

      // Debug: print request and computed values
      console.log('Incoming hierarchical category payload:', req.body);
      console.log('Creating hierarchical category with data (sanitized):', {
        name: categoryData.name,
        value: categoryData.value,
        label: categoryData.label,
        categoryId: categoryData.categoryId,
        subCategoriesCount: categoryData.subCategories.length
      });

      // Debug: log current indexes and any potential name/value duplicates
      try {
        const indexes = await HierarchicalCategory.collection.indexes();
        console.log('HierarchicalCategory indexes:', indexes);
        const existingByName = await HierarchicalCategory.findOne({ name: categoryData.name });
        const existingByValue = await HierarchicalCategory.findOne({ value: categoryData.value });
        console.log('Duplicate check:', {
          hasExistingByName: !!existingByName,
          hasExistingByValue: !!existingByValue,
          existingByNameId: existingByName?.categoryId,
          existingByValueId: existingByValue?.categoryId
        });
      } catch (dupCheckErr) {
        console.warn('Duplicate pre-check failed:', dupCheckErr?.message || dupCheckErr);
      }
      
      let category = new HierarchicalCategory(categoryData);
      try {
        await category.save();
      } catch (error) {
        // If duplicate key occurs due to an extremely rare UUID collision, retry once with new IDs
        if (error && error.code === 11000) {
          console.warn('Duplicate key on first save, regenerating IDs and retrying once...');
          categoryData.categoryId = uuidv4();
          categoryData.subCategories = (categoryData.subCategories || []).map((sc) => ({
            ...sc,
            subCategoryId: uuidv4(),
            subSubCategories: (sc.subSubCategories || []).map((ssc) => ({
              ...ssc,
              subSubCategoryId: uuidv4()
            }))
          }));
          category = new HierarchicalCategory(categoryData);
          await category.save();
        } else {
          throw error;
        }
      }
      
      console.log('Hierarchical category created successfully:', category.id);
      
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating hierarchical category:', error);
      handleError(res, error, 'create hierarchical category');
    }
  }

  async updateHierarchicalCategory(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body, lastUpdate: new Date() };
      
      const category = await HierarchicalCategory.findOneAndUpdate(
        { categoryId: id },
        { $set: updates },
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return res.status(404).json({ error: 'Hierarchical category not found' });
      }
      
      res.json(category);
    } catch (error) {
      handleError(res, error, 'update hierarchical category');
    }
  }

  async deleteHierarchicalCategory(req, res) {
    try {
      const { id } = req.params;
      
      const category = await HierarchicalCategory.findOneAndDelete({ categoryId: id });
      
      if (!category) {
        return res.status(404).json({ error: 'Hierarchical category not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error, 'delete hierarchical category');
    }
  }

  // Product Specification operations
  async getProductSpecifications(req, res) {
    try {
      const { fields, limit = 20, offset = 0, ...filters } = req.query;
      
      const query = buildQuery(ProductSpecification, filters, fields);
      const specs = await query
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });
      
      res.json(specs);
    } catch (error) {
      handleError(res, error, 'get product specifications');
    }
  }

  async getProductSpecificationById(req, res) {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      const query = buildQuery(ProductSpecification, { id }, fields);
      const spec = await query;
      
      if (!spec) {
        return res.status(404).json({ error: 'ProductSpecification not found' });
      }
      
      res.json(spec);
    } catch (error) {
      handleError(res, error, 'get product specification by ID');
    }
  }

  async createProductSpecification(req, res) {
    try {
      const specData = {
        ...req.body,
        '@type': 'ProductSpecification'
      };
      
      const spec = new ProductSpecification(specData);
      await spec.save();
      
      res.status(201).json(spec);
    } catch (error) {
      handleError(res, error, 'create product specification');
    }
  }

  // Product Offering operations
  async getProductOfferings(req, res) {
    try {
      const { fields, limit = 20, offset = 0, ...filters } = req.query;
      
      const query = buildQuery(ProductOffering, filters, fields);
      const offerings = await query
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });
      
      res.json(offerings);
    } catch (error) {
      handleError(res, error, 'get product offerings');
    }
  }

  async getProductOfferingById(req, res) {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      const query = buildQuery(ProductOffering, { id }, fields);
      const offering = await query;
      
      if (!offering) {
        return res.status(404).json({ error: 'ProductOffering not found' });
      }
      
      res.json(offering);
    } catch (error) {
      handleError(res, error, 'get product offering by ID');
    }
  }

  async createProductOffering(req, res) {
    try {
      const offeringData = {
        ...req.body,
        '@type': 'ProductOffering'
      };
      
      const offering = new ProductOffering(offeringData);
      await offering.save();
      
      res.status(201).json(offering);
    } catch (error) {
      handleError(res, error, 'create product offering');
    }
  } }