# New User Onboarding Flow Documentation

This document describes the implementation of the new user onboarding flow for Google sign-in users in the SLT Prodigy Hub application.

## Overview

When a new user signs in with Google, they are presented with a 3-screen onboarding popup that collects their personal information, address details, and performs an infrastructure qualification check. This ensures we have complete user profiles and can provide personalized service recommendations.

## Features

### 🎯 Multi-Step Onboarding Process
- **Screen 1**: Personal Information Collection
- **Screen 2**: Address Details Collection  
- **Screen 3**: Infrastructure Qualification Check

### 🔐 Smart User Detection
- Automatically detects new Google users
- Checks MongoDB for existing user profiles
- Only shows onboarding for users without complete profiles

### 💾 Data Persistence
- Saves user data to MongoDB during the process
- Updates user context after completion
- Marks users as onboarding completed

## Implementation Details

### Frontend Components

#### 1. NewUserOnboardingPopup Component
**Location**: `client/components/NewUserOnboardingPopup.tsx`

**Props**:
```typescript
interface NewUserOnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email?: string;
    name?: string;
    uid?: string;
  };
  onComplete: (userData: UserDetails & AddressDetails) => void;
}
```

**Key Features**:
- Three-screen progressive flow
- Form validation on each screen
- Skip option for personal details
- Infrastructure availability checking
- Real-time data saving

#### 2. Screen Breakdown

##### Screen 1: Personal Information
**Fields**:
- First Name (pre-filled from Google)
- Last Name (pre-filled from Google)
- Email Address (pre-filled, disabled)
- Phone Number
- ID Number (NIC)

**Actions**:
- Skip: Move to address screen without saving
- Continue: Validate and move to address screen

##### Screen 2: Address Details
**Fields**:
- Street Address
- City
- District (dropdown)
- Province (dropdown)
- Postal Code

**Actions**:
- Back: Return to personal info screen
- Continue: Save data and move to qualification check

##### Screen 3: Infrastructure Qualification Check
**Features**:
- Automatic infrastructure availability check
- Service coverage analysis
- Qualification score display
- Available services list
- Speed estimates
- Installation timeframes

### Backend Integration

#### API Endpoints

##### 1. Get User Profile
```
GET /api/users/profile/:userId
```
**Purpose**: Check if user exists and has completed onboarding
**Response**: User profile data including `onboardingCompleted` flag

##### 2. Create/Update User Profile
```
POST /api/users/profile
```
**Purpose**: Save user onboarding data
**Body**:
```json
{
  "uid": "firebase_uid",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+94771234567",
  "nic": "123456789V",
  "address": {
    "streetAddress": "123 Main St",
    "city": "Colombo",
    "district": "Colombo",
    "province": "Western",
    "postalCode": "10100"
  },
  "authMethod": "google",
  "onboardingCompleted": true
}
```

#### Database Schema Updates

##### User Model Enhancements
**Location**: `ProdigyHub-Unified/src/models/AllTMFModels.js`

**New Fields**:
```javascript
{
  onboardingCompleted: { type: Boolean, default: false },
  authMethod: { type: String, enum: ['email', 'google'], default: 'email' },
  address: {
    street: String,
    streetAddress: String, // Added for compatibility
    city: String,
    district: String,
    province: String,
    postalCode: String
  }
}
```

### Integration Points

#### 1. UserDashboard Integration
**Location**: `client/pages/UserDashboard.tsx`

**Key Functions**:
- `checkUserOnboardingStatus()`: Checks if Google user needs onboarding
- `handleOnboardingComplete()`: Handles completion of onboarding process
- `handleOnboardingClose()`: Prevents closing popup if onboarding incomplete

#### 2. AuthContext Integration
**Location**: `client/contexts/AuthContext.tsx`

**Features**:
- `authMethod` field in User interface
- Google user detection and profile creation
- Integration with existing authentication flow

## User Flow

### 1. Google Sign-In
1. User clicks "Sign in with Google"
2. Google authentication completes
3. `createUserFromFirebase()` creates user profile
4. User is redirected to `/user` dashboard

### 2. Onboarding Check
1. `UserDashboard` component mounts
2. `checkUserOnboardingStatus()` runs for Google users
3. API call to check existing profile: `GET /api/users/profile/:userId`
4. If incomplete profile detected, show onboarding popup

### 3. Onboarding Process
1. **Screen 1**: Collect personal information
   - Pre-fill name and email from Google
   - Allow skip or continue with validation
   
2. **Screen 2**: Collect address details
   - All fields required to continue
   - Save data via API: `POST /api/users/profile`
   
3. **Screen 3**: Infrastructure check
   - Automatic service availability analysis
   - Display qualification results
   - Complete onboarding

### 4. Post-Onboarding
1. User marked as `onboardingCompleted: true`
2. Popup closes automatically
3. User can access all dashboard features
4. No future onboarding prompts

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000  # Backend API URL
```

### Districts and Provinces
**Sri Lankan Administrative Divisions**:
- **Districts**: 25 districts supported
- **Provinces**: 9 provinces supported
- Data stored in component constants

## Error Handling

### Frontend Error Handling
- Form validation with user-friendly messages
- API error handling with toast notifications
- Loading states during API calls
- Graceful fallbacks for network issues

### Backend Error Handling
- Input validation for all endpoints
- Proper HTTP status codes
- Detailed error messages
- Database operation error handling

## Testing

### Manual Testing Checklist
- [ ] New Google user sees onboarding popup
- [ ] Existing Google user with complete profile doesn't see popup
- [ ] Form validation works on all screens
- [ ] Skip functionality works correctly
- [ ] Data saves correctly to MongoDB
- [ ] Infrastructure check displays properly
- [ ] Onboarding completion works
- [ ] Popup doesn't show again after completion

### API Testing
Use tools like Postman or curl to test:

```bash
# Check user profile
curl -X GET http://localhost:3000/api/users/profile/firebase_uid

# Create user profile
curl -X POST http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{"uid":"test_uid","email":"test@gmail.com",...}'
```

## Future Enhancements

### Potential Improvements
1. **Email Verification**: Add email verification for Google users
2. **Profile Photos**: Support profile photo upload
3. **Social Media**: Connect additional social accounts
4. **Preferences**: Collect user preferences during onboarding
5. **Welcome Email**: Send welcome email after completion
6. **Analytics**: Track onboarding completion rates
7. **A/B Testing**: Test different onboarding flows

### Performance Optimizations
1. **Lazy Loading**: Load infrastructure data only when needed
2. **Caching**: Cache district/province data
3. **Debouncing**: Debounce API calls during form input
4. **Preloading**: Preload next screen data

## Security Considerations

### Data Protection
- User data encrypted in transit (HTTPS)
- Sensitive data not logged
- Firebase UID used for user identification
- Input validation on all form fields

### Privacy
- Only collect necessary information
- Clear data usage explanation
- Option to skip personal details
- Secure data storage in MongoDB

## Troubleshooting

### Common Issues

#### 1. Popup Not Showing
**Symptoms**: Google user doesn't see onboarding popup
**Solutions**:
- Check `authMethod` field in user object
- Verify API endpoint is accessible
- Check browser console for errors
- Confirm user doesn't have `onboardingCompleted: true`

#### 2. Data Not Saving
**Symptoms**: Form submission fails
**Solutions**:
- Check network connectivity
- Verify API endpoint URL
- Check backend server status
- Review MongoDB connection

#### 3. Infrastructure Check Fails
**Symptoms**: Third screen shows error
**Solutions**:
- Check mock data generation
- Verify address data format
- Review API timeout settings

### Debug Mode
Enable debug logging by checking browser console for:
- `🆕 New Google user needs onboarding`
- `✅ User onboarding completed`
- `❌ Error checking user onboarding status`

## Maintenance

### Regular Tasks
1. **Monitor Error Logs**: Check for API failures
2. **Update Districts/Provinces**: Keep administrative data current
3. **Review Completion Rates**: Monitor onboarding success
4. **Update Dependencies**: Keep packages current
5. **Performance Monitoring**: Track API response times

### Version History
- **v1.0**: Initial implementation with 3-screen flow
- **v1.1**: Added infrastructure qualification check
- **v1.2**: Enhanced error handling and validation

---

## Support

For technical support or questions about this implementation:
1. Check this documentation first
2. Review the code comments in the components
3. Test API endpoints manually
4. Check browser console for error messages

**Last Updated**: September 2025  
**Version**: 1.0  
**Author**: Development Team




