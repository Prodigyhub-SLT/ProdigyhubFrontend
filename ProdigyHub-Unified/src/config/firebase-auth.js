// src/config/firebase-auth.js
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  updateProfile
} = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firebase Authentication Functions
const firebaseAuth = {
  // Create user with email and password
  createUser: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Send email verification automatically
      await sendEmailVerification(user, {
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email`,
        handleCodeInApp: false
      });
      
      console.log('✅ Firebase user created and verification email sent');
      return { success: true, user: user };
      
    } catch (error) {
      console.error('❌ Firebase user creation failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Sign in user
  signInUser: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        return { 
          success: false, 
          error: 'Email not verified',
          needsVerification: true,
          user: user 
        };
      }
      
      console.log('✅ Firebase user signed in successfully');
      return { success: true, user: user };
      
    } catch (error) {
      console.error('❌ Firebase sign in failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Resend verification email
  resendVerification: async (user) => {
    try {
      await sendEmailVerification(user, {
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email`,
        handleCodeInApp: false
      });
      
      console.log('✅ Verification email resent successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to resend verification email:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  sendPasswordReset: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
      });
      
      console.log('✅ Password reset email sent successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Verify password reset code
  verifyResetCode: async (code) => {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      console.log('✅ Password reset code verified');
      return { success: true, email: email };
      
    } catch (error) {
      console.error('❌ Password reset code verification failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Confirm password reset
  confirmPasswordReset: async (code, newPassword) => {
    try {
      await confirmPasswordReset(auth, code, newPassword);
      console.log('✅ Password reset confirmed successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Password reset confirmation failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!auth.currentUser;
  },

  // Sign out user
  signOut: async () => {
    try {
      await auth.signOut();
      console.log('✅ User signed out successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Sign out failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  auth,
  firebaseAuth
};
