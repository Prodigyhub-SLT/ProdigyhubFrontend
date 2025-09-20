// client/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authOperations, auth, dbOperations } from '@/lib/firebase';

// Enhanced User interface to match what your pages expect
export interface User {
  id: string;
  uid?: string; // Firebase UID
  userId?: string; // Custom user ID from MongoDB
  name: string;
  firstName?: string; // Add firstName field
  lastName?: string; // Add lastName field
  email: string;
  role: 'admin' | 'user' | 'viewer';
  department: string;
  lastLogin?: string;
  avatar?: string;
  emailVerified?: boolean; // Add email verification status
  authMethod?: 'email' | 'google'; // Track authentication method
  permissions?: string[];
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  // Direct fields for backward compatibility with MongoDB structure
  phoneNumber?: string;
  nic?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
  profile?: {
    phone?: string;
    nic?: string;
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
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string, nic: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  
  // Email verification
  sendEmailVerification: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  
  // Profile management
  refreshUserProfile: () => Promise<void>;
  
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
    userId: 'user_admin_001', // Set userId for MongoDB backend compatibility
    name: 'System Administrator',
    email: 'admin@company.com',
    role: 'admin' as const,
    department: 'Engineering',
    lastLogin: new Date().toISOString(),
    avatar: '/api/placeholder/150/150',
    emailVerified: true, // Admin users are pre-verified
    authMethod: 'email' as const, // Admin uses email/password
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
    userId: 'user_regular_002', // Set userId for MongoDB backend compatibility
    name: 'Product Manager',
    email: 'user@company.com',
    role: 'user' as const,
    department: 'Product',
    lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    avatar: '/api/placeholder/150/150',
    emailVerified: true, // Mock users are pre-verified
    authMethod: 'email' as const, // Mock users use email/password
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
  // Debug logging to see what Firebase user data we're getting
  console.log('🔍 createUserFromFirebase - Firebase user data:', {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    providerData: firebaseUser.providerData
  });

  // Check if user exists in mock data
  const mockUser = MOCK_USERS[firebaseUser.email as keyof typeof MOCK_USERS];
  
  if (mockUser) {
    return {
      ...mockUser,
      uid: firebaseUser.uid,
      avatar: firebaseUser.photoURL || 
              firebaseUser.providerData?.[0]?.photoURL || 
              mockUser.avatar || 
              '/api/placeholder/150/150',
      lastLogin: new Date().toISOString()
    };
  }
  
  // Create new user from Google account
  return {
    id: `user_${firebaseUser.uid}`,
    uid: firebaseUser.uid,
    userId: firebaseUser.uid, // Set userId for MongoDB backend compatibility
    name: firebaseUser.displayName || 'Google User',
    email: firebaseUser.email || '',
    role: 'user' as const,
    department: 'General',
    lastLogin: new Date().toISOString(),
    avatar: firebaseUser.photoURL || '/api/placeholder/150/150',
    emailVerified: true, // Google users are pre-verified
    authMethod: 'google', // Track that this user signed in with Google
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
      
      // Create basic user data from Firebase user
      const userData: User = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        userId: firebaseUser.uid, // Set userId for MongoDB backend compatibility
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email || email,
        role: userRole,
        department: userDepartment,
        lastLogin: new Date().toISOString(),
        avatar: firebaseUser.photoURL || 
                firebaseUser.providerData?.[0]?.photoURL || 
                '/api/placeholder/150/150',
        emailVerified: firebaseUser.emailVerified || false,
        authMethod: 'email', // Track that this user signed in with email/password
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
      
      // Fetch complete user profile from MongoDB backend
      try {
        const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        
        // Try multiple methods to find the user in MongoDB
        let mongoUser = null;
        const searchMethods = [
          { url: `${backendURL}/users/profile/${firebaseUser.uid}`, method: 'userId' },
          { url: `${backendURL}/users/email/${firebaseUser.email}`, method: 'email' }
        ];
        
        for (const searchMethod of searchMethods) {
          try {
            const response = await fetch(searchMethod.url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              mongoUser = data.user || data;
              console.log(`✅ Found user in MongoDB by ${searchMethod.method}:`, mongoUser.email);
              break;
            }
          } catch (error) {
            console.log(`❌ Failed to find user by ${searchMethod.method}:`, error.message);
          }
        }
        
        if (mongoUser) {
          console.log('✅ MongoDB profile data fetched:', mongoUser);
          
          // Merge MongoDB data with Firebase data
          const completeUserData: User = {
            ...userData,
            // Use MongoDB userId for backend compatibility
            userId: mongoUser.userId || mongoUser.id || firebaseUser.uid,
            // Direct fields from MongoDB
            phoneNumber: mongoUser.phoneNumber || '',
            nic: mongoUser.nic || '',
            address: mongoUser.address || {},
            // Profile object with MongoDB data
            profile: {
              phone: mongoUser.phoneNumber || '',
              nic: mongoUser.nic || '',
              location: mongoUser.address?.city || '',
              bio: 'User authenticated via Firebase.',
            }
          };
          
          setUser(completeUserData);
          console.log('👤 Complete user profile set in context:', completeUserData);
          
          // Store complete user data in localStorage
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('auth_user', JSON.stringify(completeUserData));
            }
          } catch (error) {
            console.warn('Failed to store user data:', error);
          }
        } else {
          console.log('⚠️ No MongoDB user found, creating user in MongoDB...');
          
          // Create user in MongoDB backend
          try {
            const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const createUserData = {
              firstName: userData.name?.split(' ')[0] || 'User',
              lastName: userData.name?.split(' ').slice(1).join(' ') || 'Name',
              email: userData.email,
              phoneNumber: userData.phoneNumber || '',
              nic: userData.nic || '',
              password: 'tempPassword123', // Temporary password
              userId: firebaseUser.uid // Use Firebase UID as userId
            };
            
            console.log('🔄 Creating user in MongoDB:', createUserData);
            
            const createResponse = await fetch(`${backendURL}/users/signup`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(createUserData)
            });
            
            if (createResponse.ok) {
              const createdUser = await createResponse.json();
              console.log('✅ User created in MongoDB:', createdUser);
              
              // Update user data with MongoDB info
              const completeUserData: User = {
                ...userData,
                userId: firebaseUser.uid,
                phoneNumber: createdUser.user?.phoneNumber || '',
                nic: createdUser.user?.nic || '',
                address: createdUser.user?.address || {}
              };
              
              setUser(completeUserData);
              
              // Store in localStorage
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  localStorage.setItem('auth_user', JSON.stringify(completeUserData));
                }
              } catch (error) {
                console.warn('Failed to store user data:', error);
              }
            } else {
              console.log('❌ Failed to create user in MongoDB, using Firebase data only');
              setUser(userData);
            }
          } catch (createError) {
            console.log('❌ Error creating user in MongoDB:', createError);
            setUser(userData);
          }
        }
      } catch (mongoError) {
        console.warn('⚠️ Failed to fetch MongoDB profile, using Firebase data only:', mongoError);
        setUser(userData);
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

  const signUp = async (email: string, password: string, firstName: string, lastName: string, phone: string, nic: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting Firebase sign-up with:', { email, firstName, lastName, phone });
      
      // Use Firebase authentication
      const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      console.log('✅ Email verification sent to:', email);
      
      // Check if this should be an admin user
      const isAdmin = email === 'admin@company.com';
      const userRole = isAdmin ? 'admin' : 'user';
      const userDepartment = isAdmin ? 'Engineering' : 'General';
      
      // Create user profile in database
      const userProfile = {
        uid: firebaseUser.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        nic: nic,
        role: userRole,
        department: userDepartment,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        emailVerified: false
      };
      
      await dbOperations.createUserProfile(userProfile);
      
      // Also save user data to MongoDB backend
      try {
        // Use the backend URL - adjust this to match your MongoDB backend
        const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        
        const mongoUserData = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phoneNumber: phone,
          nic: nic,
          password: password, // Note: In production, consider if you want to store this
          userId: firebaseUser.uid
        };
        
        console.log('📤 Sending to MongoDB backend:', mongoUserData);
        console.log('📤 NIC value being sent:', nic);
        
        const response = await fetch(`${backendURL}/users/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mongoUserData),
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ User data saved to MongoDB successfully');
          console.log('📥 MongoDB response:', responseData);
        } else {
          const errorText = await response.text();
          console.warn('⚠️ MongoDB save failed:', errorText);
          console.warn('⚠️ Response status:', response.status);
        }
      } catch (mongoError: any) {
        console.warn('⚠️ Failed to save user data to MongoDB:', mongoError);
        // Don't fail the signup if MongoDB save fails
        // User is still created in Firebase
      }
      
              // Create user data for context
        const userData: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: userRole,
          department: userDepartment,
          lastLogin: new Date().toISOString(),
          avatar: '/api/placeholder/150/150',
          emailVerified: false, // Add email verification status
          authMethod: 'email', // Track that this user signed up with email/password
          // Direct fields for MongoDB compatibility
          phoneNumber: phone,
          nic: nic,
          permissions: isAdmin ? [
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
          phone: phone,
          nic: nic,
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
        
        // Fetch complete user profile from MongoDB backend
        try {
          const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          const response = await fetch(`${backendURL}/users/profile/${result.user.uid}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const mongoUserData = await response.json();
            console.log('✅ MongoDB profile data fetched for Google user:', mongoUserData);
            
            // Merge MongoDB data with Firebase data
            const completeUserData: User = {
              ...userData,
              // Direct fields from MongoDB
              phoneNumber: mongoUserData.phoneNumber || '',
              nic: mongoUserData.nic || '',
              // Profile object with MongoDB data
              profile: {
                phone: mongoUserData.phoneNumber || '',
                nic: mongoUserData.nic || '',
                location: mongoUserData.location || '',
                bio: mongoUserData.bio || 'User authenticated via Google.',
              }
            };
            
            setUser(completeUserData);
            console.log('👤 Complete Google user profile set in context:', completeUserData);
            
            // Store complete user data in localStorage
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('auth_user', JSON.stringify(completeUserData));
                // Clear force lock flag for existing users signing in
                localStorage.removeItem('force_locked_until_manual_completion');
                console.log('💾 Complete Google user data stored in localStorage');
                console.log('🔓 Cleared force lock flag for existing Google user');
              }
            } catch (error) {
              console.warn('Failed to store complete Google user data:', error);
            }
          } else {
            console.warn('⚠️ MongoDB profile fetch failed for Google user, using basic user data');
            setUser(userData);
            
            // Store basic user data in localStorage
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('auth_user', JSON.stringify(userData));
                // Clear force lock flag for existing users signing in
                localStorage.removeItem('force_locked_until_manual_completion');
                console.log('💾 Basic Google user data stored in localStorage');
                console.log('🔓 Cleared force lock flag for existing Google user');
              }
            } catch (error) {
              console.warn('Failed to store basic Google user data:', error);
            }
          }
        } catch (mongoError: any) {
          console.warn('⚠️ Failed to fetch MongoDB profile for Google user, using basic user data:', mongoError);
          setUser(userData);
          
          // Store basic user data in localStorage
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('auth_user', JSON.stringify(userData));
              // Clear force lock flag for existing users signing in
              localStorage.removeItem('force_locked_until_manual_completion');
              console.log('💾 Basic Google user data stored in localStorage');
              console.log('🔓 Cleared force lock flag for existing Google user');
            }
          } catch (error) {
            console.warn('Failed to store basic Google user data:', error);
          }
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

  // Refresh user profile from MongoDB
  const refreshUserProfile = async (): Promise<void> => {
    if (!user?.uid) {
      console.warn('⚠️ No user logged in, cannot refresh profile');
      return;
    }
    
    try {
      console.log('🔄 Refreshing user profile from MongoDB...');
      console.log('🔍 Using user ID for API call:', user.uid);
      const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${backendURL}/users/profile/${user.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const mongoUserData = await response.json();
        console.log('✅ MongoDB profile data refreshed:', mongoUserData);
        console.log('🏠 Address data from API:', mongoUserData.address);
        console.log('🔍 Available MongoDB fields:', Object.keys(mongoUserData));
        console.log('🔍 Address field exists:', 'address' in mongoUserData);
        console.log('🔍 Address field value:', mongoUserData.address);
        
        // Update user with MongoDB data
        const updatedUser: User = {
          ...user,
          // Direct fields from MongoDB
          firstName: mongoUserData.firstName || user.firstName,
          lastName: mongoUserData.lastName || user.lastName,
          userId: mongoUserData.userId || user.userId,
          phoneNumber: mongoUserData.phoneNumber || user.phoneNumber || '',
          nic: mongoUserData.nic || user.nic || '',
          // Address data from MongoDB
          address: mongoUserData.address || user.address || {
            street: '',
            city: '',
            district: '',
            province: '',
            postalCode: ''
          },
          // Profile object with MongoDB data
          profile: {
            phone: mongoUserData.phoneNumber || user.profile?.phone || '',
            nic: mongoUserData.nic || user.profile?.nic || '',
            location: mongoUserData.location || user.profile?.location || '',
            bio: mongoUserData.bio || user.profile?.bio || 'User profile refreshed.',
          }
        };
        
        setUser(updatedUser);
        console.log('👤 User profile refreshed:', updatedUser);
        console.log('🏠 Final address in user state:', updatedUser.address);
        
        // Update localStorage
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            console.log('💾 Refreshed user data stored in localStorage');
          }
        } catch (error) {
          console.warn('Failed to store refreshed user data:', error);
        }
      } else {
        console.warn('⚠️ MongoDB profile refresh failed:', await response.text());
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to refresh user profile from MongoDB:', error);
    }
  };

  // Email verification functions
  const sendEmailVerification = async (): Promise<void> => {
    if (!user?.uid) {
      throw new Error('No user logged in');
    }
    
    try {
      const { sendEmailVerification: firebaseSendEmailVerification } = await import('firebase/auth');
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await firebaseSendEmailVerification(currentUser);
        console.log('✅ Email verification sent successfully');
      } else {
        throw new Error('No Firebase user found');
      }
    } catch (error: any) {
      console.error('❌ Failed to send email verification:', error);
      throw new Error('Failed to send email verification');
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    if (!user?.uid) {
      return false;
    }
    
    try {
      const { reload } = await import('firebase/auth');
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await reload(currentUser);
        const isVerified = currentUser.emailVerified;
        
        console.log('🔍 Email verification check result:', {
          isVerified,
          previousStatus: user.emailVerified,
          needsUpdate: user.emailVerified !== isVerified
        });
        
        // Update user context with verification status immediately
        if (user.emailVerified !== isVerified) {
          console.log('🔄 Updating user emailVerified status from', user.emailVerified, 'to', isVerified);
          const updatedUser = { ...user, emailVerified: isVerified };
          setUser(updatedUser);
          
          // Update localStorage immediately
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
              console.log('💾 Email verification status updated in localStorage');
            }
          } catch (error) {
            console.warn('Failed to update localStorage with verification status:', error);
          }
        }
        
        return isVerified;
      }
      return false;
    } catch (error: any) {
      console.error('❌ Failed to check email verification:', error);
      return false;
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

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    console.log('🔄 updateUser called with updates:', updates);
    console.log('👤 Current user:', user);
    
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
    
    // Save updates to MongoDB backend
    try {
      const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      console.log('🔧 Environment variables:');
      console.log('🔧 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('🔧 Final backendURL:', backendURL);
      console.log('🔧 All env vars:', import.meta.env);
      
      // Get userId from user object (should be set during login)
      let userId = user.userId || user.uid || user.id;
      
      // Always try to look up user by email in MongoDB to get the correct userId
      // This handles the case where Firebase UID changes but MongoDB userId stays the same
      console.log('🔍 Looking up user by email in MongoDB to get correct userId...');
      try {
        const lookupResponse = await fetch(`${backendURL}/users/email/${user.email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json();
          console.log('🔍 Email lookup response data:', lookupData);
          console.log('🔍 Available fields:', Object.keys(lookupData));
          console.log('🔍 lookupData.userId:', lookupData.userId);
          console.log('🔍 lookupData.id:', lookupData.id);
          console.log('🔍 lookupData._id:', lookupData._id);
          
          // Use the MongoDB _id as the userId for the update
          // This is more reliable than using the userId field which might not match
          const mongoUserId = lookupData._id || lookupData.userId || lookupData.id;
          if (mongoUserId) {
            userId = mongoUserId;
            console.log('✅ Found correct userId by email lookup (using _id):', userId);
          } else {
            console.warn('⚠️ Email lookup succeeded but no userId found, using Firebase UID');
            userId = user.uid;
          }
        } else {
          console.warn('⚠️ Email lookup failed, using Firebase UID as fallback');
          userId = user.uid;
        }
      } catch (lookupError) {
        console.warn('⚠️ Email lookup error, using Firebase UID as fallback:', lookupError);
        userId = user.uid;
      }
      
      console.log('🔧 Using userId for update:', userId);
      console.log('📧 User email:', user.email);
      console.log('🔍 User object details:', {
        userId: user.userId,
        uid: user.uid,
        id: user.id,
        email: user.email,
        name: user.name
      });
      
      // If no userId found, try to use Firebase UID
      if (!userId) {
        console.warn('⚠️ No userId found, using Firebase UID as fallback');
        userId = user.uid;
      }
      
      const updatePayload = {
        userId: userId,
        updates: {
          firstName: updates.name?.split(' ')[0] || user.name?.split(' ')[0],
          lastName: updates.name?.split(' ').slice(1).join(' ') || user.name?.split(' ').slice(1).join(' '),
          email: updates.email || user.email,
          phoneNumber: updates.phoneNumber || updates.profile?.phone || user.phoneNumber || user.profile?.phone,
          nic: updates.nic || updates.profile?.nic || user.nic || user.profile?.nic,
          address: updates.address || user.address
        }
      };
      
      console.log('🔄 Sending update to backend:', updatePayload);
      console.log('🏠 Address being sent:', updatePayload.updates.address);
      console.log('👤 User ID being sent:', updatePayload.userId);
      console.log('📧 Email being sent:', updatePayload.updates.email);
      console.log('🔍 Full updatePayload being sent:', JSON.stringify(updatePayload, null, 2));
      console.log('🌐 Backend URL:', backendURL);
      console.log('🔗 Full API URL:', `${backendURL}/users/update`);
      
      console.log('🚀 Making API call to:', `${backendURL}/users/update`);
      console.log('📤 Request method: PUT');
      console.log('📤 Request headers:', { 'Content-Type': 'application/json' });
      console.log('📤 Request body:', JSON.stringify(updatePayload));
      
      const response = await fetch(`${backendURL}/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
      
      console.log('📥 Response received:');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response statusText:', response.statusText);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        console.log('✅ User profile updated in MongoDB successfully');
        const responseData = await response.json();
        console.log('📝 Updated user data from server:', responseData);
        
        // Update the local user state with the server response
        if (responseData.user) {
          const updatedUserData = {
            ...user,
            ...responseData.user,
            // Ensure we keep the Firebase UID
            uid: user.uid,
            userId: user.userId || user.uid,
            // Preserve Firebase authentication status (emailVerified, etc.)
            emailVerified: user.emailVerified,
            // Create a combined name field for backward compatibility
            name: responseData.user.firstName && responseData.user.lastName 
              ? `${responseData.user.firstName} ${responseData.user.lastName}`.trim()
              : user.name
          };
          setUser(updatedUserData);
          
          // Update stored data
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('auth_user', JSON.stringify(updatedUserData));
            }
          } catch (error) {
            console.warn('Failed to update stored auth data:', error);
          }
        }
      } else {
        console.error('❌ MongoDB update failed - Response not OK');
        console.error('❌ Response status:', response.status);
        console.error('❌ Response statusText:', response.statusText);
        
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        
        // Try to parse as JSON to see the actual error
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Parsed error JSON:', errorJson);
        } catch (parseError) {
          console.error('❌ Could not parse error as JSON:', parseError);
        }
        
        throw new Error(`Failed to update user profile: ${errorText}`);
      }
    } catch (mongoError: any) {
      console.error('❌ Failed to update user data in MongoDB:', mongoError);
      // Re-throw the error so the frontend knows the update failed
      throw mongoError;
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
    
    // Email verification
    sendEmailVerification,
    checkEmailVerification,
    
    // Profile management
    refreshUserProfile,
    
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