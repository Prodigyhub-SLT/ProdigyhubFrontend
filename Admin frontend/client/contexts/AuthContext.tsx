// client/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authOperations, dbOperations } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

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
const createUserFromFirebase = (firebaseUser: FirebaseUser): User => {
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
  const [isLoading, setIsLoading] = useState(false); // Start with false, not true

  // Initialize auth state from localStorage only (not Firebase auto-login)
  useEffect(() => {
    // Check if user was previously logged in via localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      }
    } catch (error) {
      console.warn('Failed to restore auth data from localStorage:', error);
    }
  }, []);

  // Firebase auth state listener - only for active sessions
  useEffect(() => {
    // Only set up Firebase listener if user is already authenticated
    if (!user) return;

    const unsubscribe = authOperations.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser && user) {
        // Firebase user signed out, clear local state
        setUser(null);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('auth_user');
          }
        } catch (error) {
          console.warn('Failed to clear auth data:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - replace with real API call
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
      
      if (!mockUser || password !== 'admin123') {
        throw new Error('Invalid email or password');
      }
      
      const userData: User = {
        ...mockUser,
        lastLogin: new Date().toISOString()
      };
      
      setUser(userData);
      
      // Store user data (handle gracefully if localStorage not available)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
      } catch (error) {
        console.warn('Failed to store auth data:', error);
      }
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const result = await authOperations.signInWithGoogle();
      
      if (result.user) {
        const userData = createUserFromFirebase(result.user);
        setUser(userData);
        
        // Store user data in localStorage
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('auth_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.warn('Failed to store auth data:', error);
        }
        
        // Create/update user profile in Firebase database
        try {
          await dbOperations.createUserProfile({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            lastLogin: Date.now()
          });
        } catch (error) {
          console.warn('Failed to update user profile in database:', error);
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear Firebase auth state
      await authOperations.signOut();
      
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
    } catch (error) {
      console.error('Logout Error:', error);
      // Still clear local state even if Firebase logout fails
      setUser(null);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('auth_user');
        }
      } catch (localError) {
        console.warn('Failed to clear local auth data:', localError);
      }
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