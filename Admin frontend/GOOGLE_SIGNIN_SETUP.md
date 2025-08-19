# Google Sign-In Setup Guide

This guide explains how to set up Google Sign-In for your SLT Prodigy Hub application using Firebase.

## Prerequisites

- Firebase project already configured
- Firebase SDK installed (`npm install firebase`)

## Firebase Console Setup

### 1. Enable Google Sign-In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `prodigyhub-dashboard`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable**
6. Add your **Project support email** (e.g., your email)
7. Click **Save**

### 2. Configure OAuth Consent Screen (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure the consent screen with your app information
5. Add your domain to authorized domains if needed

### 3. Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings**
2. Under **Authorized domains**, add:
   - `localhost` (for development)
   - Your production domain
   - Any other domains where you'll deploy the app

## Code Implementation

The Google Sign-In functionality is already implemented in your codebase:

### Files Modified:

1. **`client/lib/firebase.ts`** - Added Google Auth Provider and authentication operations
2. **`client/contexts/AuthContext.tsx`** - Integrated Firebase authentication with your existing auth system
3. **`client/pages/Login.tsx`** - Added Google Sign-In button with proper error handling

### Key Features:

- ✅ Google Sign-In with popup
- ✅ Automatic user profile creation
- ✅ Integration with existing permission system
- ✅ Fallback to mock users for existing accounts
- ✅ Proper error handling and loading states
- ✅ User data stored in Firebase Realtime Database

## Testing Google Sign-In

### 1. Development Testing

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the **Google** button
4. Complete the Google Sign-In flow
5. Check browser console for debug logs
6. Verify user is redirected to dashboard

### 2. Debug Logs

The implementation includes console logs to help debug:
- `🔐 Starting Google Sign-In...` - When sign-in starts
- `✅ Google Sign-In successful!` - When sign-in succeeds
- `❌ Google Sign-In failed: [error]` - When sign-in fails

### 3. Common Issues

#### "popup_closed_by_user" Error
- User closed the popup before completing sign-in
- This is normal behavior, not an error

#### "popup_blocked" Error
- Browser blocked the popup
- Check if popup blocker is enabled
- Try allowing popups for your domain

#### "account_exists_with_different_credential" Error
- User already exists with different sign-in method
- Handle gracefully by suggesting alternative sign-in

## User Management

### New Google Users

When a user signs in with Google for the first time:
1. A new user profile is created automatically
2. User gets `user` role with basic permissions
3. Profile is stored in Firebase Database under `users/{uid}`
4. User data is cached locally for performance

### Existing Mock Users

If a Google user's email matches an existing mock user:
1. User gets the existing permissions and role
2. Firebase UID is added to the user profile
3. Google profile picture becomes the avatar
4. Last login time is updated

### User Permissions

Google users get these default permissions:
- `tmf620:read` - Read product catalog
- `tmf622:read` - Read product ordering
- `tmf637:read` - Read product inventory
- `tmf679:read` - Read product qualification
- `tmf688:read` - Read event management
- `dashboard:read` - Access dashboard

## Security Considerations

### 1. Domain Restrictions
- Only allow sign-in from authorized domains
- Regularly review and update authorized domains

### 2. User Validation
- Consider implementing additional user validation
- Add admin approval for new user accounts if needed

### 3. Rate Limiting
- Firebase provides built-in rate limiting
- Monitor for unusual sign-in patterns

## Production Deployment

### 1. Update Authorized Domains
- Add your production domain to Firebase
- Remove `localhost` from production

### 2. Environment Variables
- Ensure Firebase config is properly set for production
- Use environment variables for sensitive config

### 3. SSL Requirements
- Google Sign-In requires HTTPS in production
- Ensure your domain has valid SSL certificate

## Troubleshooting

### Sign-In Not Working
1. Check Firebase Console for Google provider status
2. Verify domain is authorized
3. Check browser console for errors
4. Ensure popup blockers are disabled

### User Not Created
1. Check Firebase Database rules
2. Verify user creation permissions
3. Check console for database errors

### Permission Issues
1. Verify user role assignment
2. Check permission mapping logic
3. Ensure user profile is properly created

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify Firebase configuration
3. Test with different browsers
4. Check Firebase Console logs
5. Review this documentation

## Next Steps

After successful Google Sign-In implementation:
1. Test with multiple Google accounts
2. Implement user profile management
3. Add additional social providers if needed
4. Consider implementing user roles and permissions
5. Add user activity logging
