// client/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authOperations, auth, dbOperations } from '@/lib/firebase';

// Enhanced User interface to match what your pages expect
export interface User {
  id: string;
  uid?: string; // Firebase UID
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  department: string;
  lastLogin?: string;
  avatar?: string;
  permissions?: string[];
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  profile?: {
    phone?: string;
    location?: string;
    bio?: string;
    website?: string;
  };
}

export interface AuthContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  
  // Profile actions
  updateProfile: (profile: Partial<User['profile']>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  
  // Security
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  enableTwoFactor: () => Promise<boolean>;
  disableTwoFactor: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user data that matches your dashboard expectations
const MOCK_USERS = {
  'admin@company.com': {
    id: 'user_admin_001',
    name: 'System Administrator',
    email: 'admin@company.com',
    role: 'admin' as const,
    department: 'Engineering',
    lastLogin: new Date().toISOString(),
    avatar: '/api/placeholder/150/150',
    permissions: [
      'tmf620:read', 'tmf620:write', 'tmf620:delete',
      'tmf622:read', 'tmf622:write', 'tmf622:delete', 
      'tmf637:read', 'tmf637:write', 'tmf637:delete',
      'tmf679:read', 'tmf679:write', 'tmf679:delete',
      'tmf688:read', 'tmf688:write', 'tmf688:delete',
      'tmf760:read', 'tmf760:write', 'tmf760:delete',
      'dashboard:read', 'users:manage', 'settings:manage'
    ],
    preferences: {
      theme: 'system' as const,
      language: 'en-US',
      timezone: 'UTC-05:00'
    },
    profile: {
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      bio: 'System Administrator with 10+ years experience in telecom APIs and digital transformation.',
      website: 'https://company.com'
    }
  },
  'user@company.com': {
    id: 'user_regular_002',
    name: 'Product Manager',
    email: 'user@company.com',
    role: 'user' as const,
    department: 'Product',
    lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    avatar: '/api/placeholder/150/150',
    permissions: [
      'tmf620:read', 'tmf622:read', 'tmf622:write',
      'tmf637:read', 'tmf679:read', 'tmf688:read',
      'dashboard:read'
    ],
    preferences: {
      theme: 'light' as const,
      language: 'en-US',
      timezone: 'UTC-08:00'
    },
    profile: {
      phone: '+1 (555) 987-6543',
      location: 'San Francisco, CA',
      bio: 'Product Manager focused on API strategy and customer experience.',
    }
  }
};

// Helper function to create user from Firebase user
const createUserFromFirebase = (firebaseUser: any): User => {
  // Check if user exists in mock data
  const mockUser = MOCK_USERS[firebaseUser.email as keyof typeof MOCK_USERS];
  
  if (mockUser) {
    return {
      ...mockUser,
      uid: firebaseUser.uid,
      avatar: firebaseUser.photoURL || mockUser.avatar || '/api/placeholder/150/150',
      lastLogin: new Date().toISOString()
    };
  }
  
  // Create new user from Google account
  return {
    id: `user_${firebaseUser.uid}`,
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || 'Google User',
    email: firebaseUser.email || '',
    role: 'user' as const,
    department: 'General',
    lastLogin: new Date().toISOString(),
    avatar: firebaseUser.photoURL || '/api/placeholder/150/150',
    permissions: [
      'tmf620:read', 'tmf622:read', 'tmf637:read', 
      'tmf679:read', 'tmf688:read', 'dashboard:read'
    ],
    preferences: {
      theme: 'system' as const,
      language: 'en-US',
      timezone: 'UTC+00:00'
    },
    profile: {
      phone: '',
      location: '',
      bio: 'User signed in via Google authentication.',
    }
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔄 AuthProvider - Current state:', { user: user ? 'exists' : 'null', isAuthenticated: !!user, isLoading });

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting Firebase login with:', { email, password: '***' });
      
      // Use Firebase authentication
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase authentication successful for:', email);
      
      // Check if this is an admin user (you can customize this logic)
      let userRole: 'admin' | 'user' = 'user';
      let userDepartment = 'General';
      
      // Check if it's the admin email
      if (email === 'admin@company.com') {
        userRole = 'admin';
        userDepartment = 'Engineering';
      }
      
      // Create user data from Firebase user
      const userData: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email || email,
        role: userRole,
        department: userDepartment,
        lastLogin: new Date().toISOString(),
        avatar: firebaseUser.photoURL || '/api/placeholder/150/150',
        permissions: userRole === 'admin' ? [
          'tmf620:read', 'tmf620:write', 'tmf620:delete',
          'tmf622:read', 'tmf622:write', 'tmf622:delete', 
          'tmf637:read', 'tmf637:write', 'tmf637:delete',
          'tmf679:read', 'tmf679:write', 'tmf679:delete',
          'tmf688:read', 'tmf688:write', 'tmf688:delete',
          'tmf760:read', 'tmf760:write', 'tmf760:delete',
          'dashboard:read', 'users:manage', 'settings:manage'
        ] : [
          'tmf620:read', 'tmf622:read', 'tmf637:read', 
          'tmf679:read', 'tmf688:read', 'dashboard:read'
        ],
        preferences: {
          theme: 'light',
          language: 'en-US',
          timezone: 'UTC+00:00'
        },
        profile: {
          phone: '',
          location: '',
          bio: 'User authenticated via Firebase.',
        }
      };
      
      setUser(userData);
      console.log('👤 User set in context:', userData);
      
      // Store user data in localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('auth_user', JSON.stringify(userData));
          console.log('💾 User data stored in localStorage');
        }
      } catch (error) {
        console.warn('Failed to store auth data:', error);
      }
      
    } catch (error: any) {
      console.error('❌ Firebase login error:', error);
      let errorMessage = 'Invalid email or password';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting Firebase sign-up with:', { email, firstName, lastName, phone });
      
      // Use Firebase authentication
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Create user profile in database
      const userProfile = {
        uid: firebaseUser.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        role: 'user',
        department: 'General',
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      
      await dbOperations.createUserProfile(userProfile);
      
      // Create user data for context
      const userData: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: `${firstName} ${lastName}`,
        email: email,
        role: 'user',
        department: 'General',
        lastLogin: new Date().toISOString(),
        avatar: '/api/placeholder/150/150',
        permissions: [
          'tmf620:read', 'tmf622:read', 'tmf637:read', 
          'tmf679:read', 'tmf688:read', 'dashboard:read'
        ],
        preferences: {
          theme: 'light',
          language: 'en-US',
          timezone: 'UTC+00:00'
        },
        profile: {
          phone: phone,
          bio: 'New user account.',
        }
      };
      
      setUser(userData);
      console.log('👤 New user created and set in context:', userData);
      
      // Store user data in localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('auth_user', JSON.stringify(userData));
          console.log('💾 New user data stored in localStorage');
        }
      } catch (error) {
        console.warn('Failed to store new user data:', error);
      }
      
      console.log('✅ Firebase sign-up completed successfully');
      
    } catch (error: any) {
      console.error('❌ Firebase sign-up error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Starting Google Sign-In...');
      
      // Call Firebase Google Sign-In
      const result = await authOperations.signInWithGoogle();
      
      if (result.user) {
        console.log('✅ Google Sign-In successful, creating user profile');
        
        // Create user profile from Firebase user
        const userData = createUserFromFirebase(result.user);
        
        // Set user in context
        setUser(userData);
        console.log('👤 Google user set in context:', userData);
        
        // Store user data in localStorage
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('auth_user', JSON.stringify(userData));
            console.log('💾 Google user data stored in localStorage');
          }
        } catch (error) {
          console.warn('Failed to store Google auth data:', error);
        }
        
        console.log('✅ Google Sign-In completed successfully');
      } else {
        throw new Error('Google Sign-In failed - no user returned');
      }
      
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user');
      
      // Clear Firebase auth state if user was signed in with Google
      if (user?.uid) {
        try {
          await authOperations.signOut();
          console.log('✅ Firebase sign-out successful');
        } catch (error) {
          console.warn('Firebase sign-out failed, but continuing with local logout:', error);
        }
      }
      
      // Clear local state
      setUser(null);
      
      // Clear stored data
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('auth_user');
        }
      } catch (error) {
        console.warn('Failed to clear auth data:', error);
      }
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state even if there's an error
      setUser(null);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Update stored data
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.warn('Failed to update stored auth data:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const updateProfile = (profile: Partial<User['profile']>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      profile: { ...user.profile, ...profile }
    };
    
    updateUser(updatedUser);
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };
    
    updateUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Mock password change - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, validate current password with backend
    if (currentPassword !== 'admin123') {
      throw new Error('Current password is incorrect');
    }
    
    // In real implementation, send new password to backend
    console.log('Password changed successfully');
    return true;
  };

  const enableTwoFactor = async (): Promise<boolean> => {
    // Mock 2FA enable - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const disableTwoFactor = async (): Promise<boolean> => {
    // Mock 2FA disable - replace with real API call  
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    
    // Actions
    login,
    loginWithGoogle,
    signUp,
    logout,
    updateUser,
    
    // Permissions
    hasPermission,
    hasRole,
    
    // Profile
    updateProfile,
    updatePreferences,
    
    // Security
    changePassword,
    enableTwoFactor,
    disableTwoFactor,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Helper hook for checking permissions in components
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
};

// Helper hook for checking roles in components
export const useRole = (roles: string | string[]): boolean => {
  const { hasRole } = useAuth();
  return hasRole(roles);
};

export default AuthContext;