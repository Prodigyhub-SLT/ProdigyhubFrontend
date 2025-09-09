const { User, CheckProductOfferingQualification } = require('../../../models/AllTMFModels');

/**
 * Direct address sync controller - different approach
 * This will extract addresses from qualifications and update users directly
 */
const addressSyncController = {
  
  // POST /api/sync-addresses - Sync addresses from qualifications to users
  syncAddresses: async (req, res) => {
    try {
      console.log('🔄 Starting address sync process...');
      
      // Get all qualifications with SLT_LOCATION notes
      const qualifications = await CheckProductOfferingQualification.find({
        'note.text': { $regex: /SLT_LOCATION:/ }
      }).limit(50); // Limit to prevent timeout
      
      console.log(`Found ${qualifications.length} qualifications with location data`);
      
      let syncedCount = 0;
      let errorCount = 0;
      
      for (const qualification of qualifications) {
        try {
          // Extract address from SLT_LOCATION note
          const address = extractAddressFromSLTNote(qualification);
          if (!address) {
            console.log(`  ⚠️ No valid address found in qualification ${qualification.id}`);
            continue;
          }
          
          console.log(`  📍 Processing qualification ${qualification.id}:`, address);
          
          // Find a user to update (prefer users without addresses)
          const user = await findUserForAddressUpdate();
          if (!user) {
            console.log(`  ❌ No user found to update for qualification ${qualification.id}`);
            errorCount++;
            continue;
          }
          
          // Update user with address
          const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { 
              address: address,
              updatedAt: new Date()
            },
            { new: true }
          );
          
          if (updatedUser) {
            console.log(`  ✅ Updated user ${updatedUser.email} with address`);
            syncedCount++;
          } else {
            console.log(`  ❌ Failed to update user for qualification ${qualification.id}`);
            errorCount++;
          }
          
        } catch (qualError) {
          console.error(`  ❌ Error processing qualification ${qualification.id}:`, qualError.message);
          errorCount++;
        }
      }
      
      res.json({
        success: true,
        message: 'Address sync completed',
        stats: {
          totalQualifications: qualifications.length,
          syncedCount,
          errorCount,
          successRate: qualifications.length > 0 ? (syncedCount / qualifications.length * 100).toFixed(2) + '%' : '0%'
        }
      });
      
    } catch (error) {
      console.error('❌ Error in address sync:', error);
      res.status(500).json({
        success: false,
        error: 'Address sync failed',
        message: error.message
      });
    }
  },
  
  // GET /api/sync-addresses/status - Check sync status
  getSyncStatus: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const usersWithAddress = await User.countDocuments({
        'address.district': { $exists: true, $ne: null, $ne: '' }
      });
      const qualificationsWithLocation = await CheckProductOfferingQualification.countDocuments({
        'note.text': { $regex: /SLT_LOCATION:/ }
      });
      
      res.json({
        totalUsers,
        usersWithAddress,
        usersWithoutAddress: totalUsers - usersWithAddress,
        qualificationsWithLocation,
        syncPercentage: totalUsers > 0 ? ((usersWithAddress / totalUsers) * 100).toFixed(2) + '%' : '0%'
      });
      
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      res.status(500).json({
        error: 'Failed to get sync status',
        message: error.message
      });
    }
  },
  
  // POST /api/sync-addresses/user/:userId - Sync address to specific user
  syncAddressToUser: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Find a qualification with address data
      const qualification = await CheckProductOfferingQualification.findOne({
        'note.text': { $regex: /SLT_LOCATION:/ }
      });
      
      if (!qualification) {
        return res.status(404).json({
          success: false,
          error: 'No qualification with address data found'
        });
      }
      
      // Extract address
      const address = extractAddressFromSLTNote(qualification);
      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'No valid address found in qualification'
        });
      }
      
      // Update user
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { 
          address: address,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      res.json({
        success: true,
        message: 'Address synced successfully',
        user: {
          email: updatedUser.email,
          address: updatedUser.address
        }
      });
      
    } catch (error) {
      console.error('❌ Error syncing address to user:', error);
      res.status(500).json({
        success: false,
        error: 'Address sync failed',
        message: error.message
      });
    }
  }
};

/**
 * Extract address from SLT_LOCATION note
 */
function extractAddressFromSLTNote(qualification) {
  try {
    if (!qualification.note || !Array.isArray(qualification.note)) {
      return null;
    }

    // Find SLT_LOCATION note
    const locationNote = qualification.note.find(note => 
      note.text && note.text.startsWith('SLT_LOCATION:')
    );

    if (!locationNote) {
      return null;
    }

    // Parse the location data
    const locationText = locationNote.text.replace('SLT_LOCATION:', '');
    const locationData = JSON.parse(locationText);

    if (!locationData.address || !locationData.district || !locationData.province) {
      return null;
    }

    // Return structured address
    return {
      street: locationData.address || '',
      city: locationData.district || '', // Using district as city
      district: locationData.district || '',
      province: locationData.province || '',
      postalCode: locationData.postalCode || ''
    };
  } catch (error) {
    console.error('Error extracting address from SLT note:', error);
    return null;
  }
}

/**
 * Find user for address update (prefer users without addresses)
 */
async function findUserForAddressUpdate() {
  try {
    // First try to find users without addresses
    const userWithoutAddress = await User.findOne({
      $or: [
        { 'address.district': { $exists: false } },
        { 'address.district': null },
        { 'address.district': '' }
      ]
    }).sort({ createdAt: -1 });

    if (userWithoutAddress) {
      console.log(`Found user without address: ${userWithoutAddress.email}`);
      return userWithoutAddress;
    }

    // If no users without addresses, find any recent user
    const anyUser = await User.findOne().sort({ createdAt: -1 });
    if (anyUser) {
      console.log(`Using any recent user: ${anyUser.email}`);
      return anyUser;
    }

    return null;
  } catch (error) {
    console.error('Error finding user for address update:', error);
    return null;
  }
}

module.exports = addressSyncController;
