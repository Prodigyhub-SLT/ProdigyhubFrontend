const { CheckProductOfferingQualification, User } = require('../../../models/AllTMFModels');
const { applyFieldSelection, validateRequiredFields, cleanForJsonResponse } = require('../utils/helpers');
const { syncAddressToUser } = require('../utils/addressSyncUtils');

const checkProductOfferingQualificationMongoController = {
  
  // GET /checkProductOfferingQualification
  listCheckPOQ: async (req, res) => {
    try {
      const { fields, ...filters } = req.query;
      
      // Get all CheckPOQ with filters
      let query = {};
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (key !== 'fields' && filters[key]) {
          // Handle date filtering
          if (key === 'effectiveQualificationDate' || key === 'creationDate') {
            query[key] = { $gte: new Date(filters[key].split('T')[0]) };
          } else {
            query[key] = filters[key];
          }
        }
      });
      
      const poqList = await CheckProductOfferingQualification.find(query).select('-__v');
      
      // Apply field selection if specified
      let result = poqList;
      if (fields) {
        result = poqList.map(poq => applyFieldSelection(poq.toObject(), fields));
      } else {
        result = poqList.map(poq => cleanForJsonResponse(poq.toObject()));
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in listCheckPOQ:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /checkProductOfferingQualification/{id}
  getCheckPOQById: async (req, res) => {
    try {
      const { id } = req.params;
      const { fields } = req.query;
      
      const poq = await CheckProductOfferingQualification.findOne({ id }).select('-__v');
      
      if (!poq) {
        return res.status(404).json({
          error: 'Not Found',
          message: `CheckProductOfferingQualification with id ${id} not found`
        });
      }
      
      // Apply field selection if specified
      let result = poq.toObject();
      if (fields) {
        result = applyFieldSelection(result, fields);
      } else {
        result = cleanForJsonResponse(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getCheckPOQById:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // POST /checkProductOfferingQualification
  createCheckPOQ: async (req, res) => {
    try {
      const data = req.body;
      
      // Basic validation
      const validationError = validateRequiredFields(data, ['@type']);
      if (validationError) {
        return res.status(400).json({
          error: 'Bad Request',
          message: validationError
        });
      }
      
      // Ensure @baseType is string when provided
      if (data['@baseType'] !== undefined && typeof data['@baseType'] !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: '@baseType must be string'
        });
      }
      
      // Ensure @schemaLocation is string when provided  
      if (data['@schemaLocation'] !== undefined && typeof data['@schemaLocation'] !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: '@schemaLocation must be string'
        });
      }
      
      // Create new CheckPOQ
      const newPOQ = new CheckProductOfferingQualification(data);
      const savedPOQ = await newPOQ.save();
      
      // Extract address from notes and sync to user collection
      await syncAddressToUser(savedPOQ);
      
      res.status(201).json(cleanForJsonResponse(savedPOQ.toObject()));
    } catch (error) {
      console.error('Error in createCheckPOQ:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // PATCH /checkProductOfferingQualification/{id}
  updateCheckPOQ: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Remove immutable fields
      delete updates.id;
      delete updates.createdAt;
      updates.updatedAt = new Date();
      
      const updatedPOQ = await CheckProductOfferingQualification.findOneAndUpdate(
        { id },
        updates,
        { new: true, runValidators: true }
      ).select('-__v');
      
      if (!updatedPOQ) {
        return res.status(404).json({
          error: 'Not Found',
          message: `CheckProductOfferingQualification with id ${id} not found`
        });
      }
      
      // Extract address from notes and sync to user collection
      await syncAddressToUser(updatedPOQ);
      
      res.status(200).json(cleanForJsonResponse(updatedPOQ.toObject()));
    } catch (error) {
      console.error('Error in updateCheckPOQ:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // DELETE /checkProductOfferingQualification/{id}
  deleteCheckPOQ: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedPOQ = await CheckProductOfferingQualification.findOneAndDelete({ id });
      
      if (!deletedPOQ) {
        return res.status(404).json({
          error: 'Not Found',
          message: `CheckProductOfferingQualification with id ${id} not found`
        });
      }
      
      res.status(200).json({
        message: 'CheckProductOfferingQualification deleted successfully',
        deletedId: deletedPOQ.id
      });
    } catch (error) {
      console.error('Error in deleteCheckPOQ:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
};


module.exports = checkProductOfferingQualificationMongoController;
