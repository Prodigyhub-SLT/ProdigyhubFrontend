// areaManagementController.js - Controller for Area Management API
const { Area } = require('../../../models/AllTMFModels');

const areaManagementController = {
  // POST /api/areaManagement/v5/area - Create new area
  createArea: async (req, res) => {
    try {
      const areaData = req.body;
      
      // Validate required fields
      if (!areaData.name || !areaData.district || !areaData.province) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Name, district, and province are required fields'
        });
      }

      // Check if area already exists
      const existingArea = await Area.findOne({
        district: areaData.district,
        province: areaData.province
      });

      if (existingArea) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Area with this district and province already exists'
        });
      }

      // Create new area
      const newArea = new Area({
        ...areaData,
        createdBy: req.headers['x-user-id'] || 'system',
        lastUpdated: new Date()
      });

      const savedArea = await newArea.save();
      
      // Remove MongoDB _id for response
      const response = savedArea.toObject();
      delete response._id;

      res.status(201).json(response);
    } catch (error) {
      console.error('Error in createArea:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/areaManagement/v5/area - List all areas
  listAreas: async (req, res) => {
    try {
      const { 
        province, 
        district, 
        areaType, 
        status,
        limit = 100, 
        offset = 0 
      } = req.query;

      // Build query
      const query = {};
      if (province) query.province = province;
      if (district) query.district = district;
      if (areaType) query.areaType = areaType;
      if (status) query.status = status;

      // Execute query with pagination
      const areas = await Area.find(query)
        .sort({ createdAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .lean();

      // Remove MongoDB _id from all results
      const result = areas.map(area => {
        const cleaned = { ...area };
        delete cleaned._id;
        return cleaned;
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in listAreas:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/areaManagement/v5/area/{id} - Get area by ID
  getAreaById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const area = await Area.findOne({ id }).lean();
      
      if (!area) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Area not found'
        });
      }

      // Remove MongoDB _id
      const result = { ...area };
      delete result._id;

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAreaById:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // PUT /api/areaManagement/v5/area/{id} - Update area
  updateArea: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      
      // Add lastUpdated timestamp
      updateData.lastUpdated = new Date();

      const updatedArea = await Area.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!updatedArea) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Area not found'
        });
      }

      // Remove MongoDB _id
      const result = { ...updatedArea };
      delete result._id;

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateArea:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // DELETE /api/areaManagement/v5/area/{id} - Delete area
  deleteArea: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedArea = await Area.findOneAndDelete({ id }).lean();
      
      if (!deletedArea) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Area not found'
        });
      }

      res.status(200).json({
        message: 'Area deleted successfully',
        deletedArea: {
          id: deletedArea.id,
          name: deletedArea.name,
          district: deletedArea.district,
          province: deletedArea.province
        }
      });
    } catch (error) {
      console.error('Error in deleteArea:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },

  // GET /api/areaManagement/v5/area/stats - Get area statistics
  getAreaStats: async (req, res) => {
    try {
      const totalAreas = await Area.countDocuments();
      const activeAreas = await Area.countDocuments({ status: 'active' });
      const plannedAreas = await Area.countDocuments({ status: 'planned' });
      
      // Count by province
      const areasByProvince = await Area.aggregate([
        {
          $group: {
            _id: '$province',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Count by area type
      const areasByType = await Area.aggregate([
        {
          $group: {
            _id: '$areaType',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Infrastructure coverage
      const fiberAreas = await Area.countDocuments({ 'infrastructure.fiber.available': true });
      const adslAreas = await Area.countDocuments({ 'infrastructure.adsl.available': true });
      const mobileAreas = await Area.countDocuments({ 'infrastructure.mobile.available': true });

      res.status(200).json({
        totalAreas,
        activeAreas,
        plannedAreas,
        areasByProvince: areasByProvince.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        areasByType: areasByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        infrastructure: {
          fiberAreas,
          adslAreas,
          mobileAreas
        }
      });
    } catch (error) {
      console.error('Error in getAreaStats:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
};

module.exports = areaManagementController;
