const { User } = require('../../../models/AllTMFModels');

/**
 * Extract address information from qualification notes
 * @param {Object} qualification - The qualification object
 * @returns {Object|null} - Address object or null if not found
 */
function extractAddressFromQualification(qualification) {
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

    // Extract address components
    return {
      street: locationData.address || '',
      city: locationData.district || '', // Using district as city
      district: locationData.district || '',
      province: locationData.province || '',
      postalCode: locationData.postalCode || ''
    };
  } catch (error) {
    console.error('Error extracting address from qualification:', error);
    return null;
  }
}

/**
 * Extract user email from qualification data
 * @param {Object} qualification - The qualification object
 * @returns {string|null} - User email or null if not found
 */
function extractUserEmailFromQualification(qualification) {
  try {
    // Try to find email in relatedParty (primary method)
    if (qualification.relatedParty && qualification.relatedParty.length > 0) {
      const relatedParty = qualification.relatedParty[0];
      if (relatedParty.email) {
        console.log('✅ Found user email in relatedParty:', relatedParty.email);
        return relatedParty.email;
      }
    }

    // Try to find email in description
    if (qualification.description) {
      const emailMatch = qualification.description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        console.log('✅ Found user email in description:', emailMatch[1]);
        return emailMatch[1];
      }
    }

    // Try to find email in notes
    if (qualification.note && Array.isArray(qualification.note)) {
      for (const note of qualification.note) {
        if (note.text) {
          const emailMatch = note.text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (emailMatch) {
            console.log('✅ Found user email in notes:', emailMatch[1]);
            return emailMatch[1];
          }
        }
      }
    }

    console.log('❌ No user email found in qualification');
    return null;
  } catch (error) {
    console.error('Error extracting user email from qualification:', error);
    return null;
  }
}

/**
 * Find user by email or fallback to recent users
 * @param {string} email - User email
 * @returns {Object|null} - User object or null
 */
async function findUserForAddressUpdate(email) {
  try {
    // First try to find by email (most reliable method)
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`✅ Found user by email: ${user.email}`);
        return user;
      }
      console.log(`❌ User not found with email: ${email}`);
    }

    // If no email provided, try to find by userId from relatedParty
    // This is a more reliable fallback than time-based search
    console.log('⚠️ No email provided, skipping user lookup');
    return null;
  } catch (error) {
    console.error('Error finding user for address update:', error);
    return null;
  }
}

/**
 * Update user with address information
 * @param {Object} user - User object
 * @param {Object} address - Address object
 * @returns {Object|null} - Updated user or null
 */
async function updateUserAddress(user, address) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { 
        address: address,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`✅ Successfully updated user ${updatedUser.email} with address:`, address);
      return updatedUser;
    } else {
      console.log('Failed to update user with address information');
      return null;
    }
  } catch (error) {
    console.error('Error updating user address:', error);
    return null;
  }
}

/**
 * Sync address from qualification to user collection
 * @param {Object} qualification - The qualification object
 * @returns {boolean} - Success status
 */
async function syncAddressToUser(qualification) {
  try {
    console.log('🔄 Starting address sync for qualification:', qualification.id);
    
    // Extract address from qualification
    const address = extractAddressFromQualification(qualification);
    if (!address) {
      console.log('❌ No address information found in qualification');
      return false;
    }
    
    console.log('✅ Extracted address:', address);

    // Extract user email
    const userEmail = extractUserEmailFromQualification(qualification);
    if (!userEmail) {
      console.log('❌ No user email found in qualification - cannot sync address');
      return false;
    }
    
    console.log('📧 Extracted user email:', userEmail);
    
    // Find user by email
    const user = await findUserForAddressUpdate(userEmail);
    if (!user) {
      console.log('❌ No user found with email:', userEmail);
      return false;
    }
    
    console.log('✅ Found user for update:', user.email);

    // Update user with address
    const updatedUser = await updateUserAddress(user, address);
    if (updatedUser) {
      console.log('✅ Successfully synced address to user collection');
      return true;
    } else {
      console.log('❌ Failed to update user with address');
      return false;
    }

  } catch (error) {
    console.error('❌ Error syncing address to user:', error);
    return false;
  }
}

module.exports = {
  extractAddressFromQualification,
  extractUserEmailFromQualification,
  findUserForAddressUpdate,
  updateUserAddress,
  syncAddressToUser
};
