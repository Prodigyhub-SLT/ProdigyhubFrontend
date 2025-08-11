import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set, remove, query, orderByChild, limitToLast } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

// 🔥 FIREBASE CONFIGURATION SETUP 🔥
// 
// ✅ CONFIGURATION UPDATED WITH REAL VALUES!
// 
const firebaseConfig = {
  apiKey: "AIzaSyD6M4fOwtZCtvzDIZjqOMj3rgaV-n1XYcc",
  authDomain: "prodigyhub-dashboard.firebaseapp.com",
  databaseURL: "https://prodigyhub-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "prodigyhub-dashboard",
  storageBucket: "prodigyhub-dashboard.firebasestorage.app",
  messagingSenderId: "686673435740",
  appId: "1:686673435740:web:5833089fce37c5f9b55a99",
  measurementId: "G-9X9XM04XJE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Initialize Auth
export const auth = getAuth(app);

// Database references
export const dbRefs = {
  orders: ref(database, 'orders'),
  products: ref(database, 'products'),
  offerings: ref(database, 'offerings'),
  categories: ref(database, 'categories'),
  qualifications: ref(database, 'qualifications'),
  events: ref(database, 'events'),
  systemHealth: ref(database, 'systemHealth'),
  collectionStats: ref(database, 'collectionStats'),
  infrastructure: ref(database, 'infrastructure')
};

// Real-time data listeners
export const realtimeListeners = {
  // Listen to orders changes
  listenToOrders: (callback: (data: any) => void) => {
    return onValue(dbRefs.orders, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    });
  },

  // Listen to products changes
  listenToProducts: (callback: (data: any) => void) => {
    return onValue(dbRefs.products, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    });
  },

  // Listen to offerings changes
  listenToOfferings: (callback: (data: any) => void) => {
    return onValue(dbRefs.offerings, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    });
  },

  // Listen to categories changes
  listenToCategories: (callback: (data: any) => void) => {
    return onValue(dbRefs.categories, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    });
  },

  // Listen to qualifications changes
  listenToQualifications: (callback: (data: any) => void) => {
    return onValue(dbRefs.qualifications, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    });
  },

  // Listen to events changes
  listenToEvents: (callback: (data: any) => void) => {
    return onValue(dbRefs.events, (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    });
  },

  // Listen to system health changes
  listenToSystemHealth: (callback: (data: any) => void) => {
    return onValue(dbRefs.systemHealth, (snapshot) => {
      const data = snapshot.val();
      callback(data || { status: 'unknown', uptime: 0 });
    });
  },

  // Listen to collection stats changes
  listenToCollectionStats: (callback: (data: any) => void) => {
    return onValue(dbRefs.collectionStats, (snapshot) => {
      const data = snapshot.val();
      callback(data || { collections: {} });
    });
  },

  // Listen to infrastructure changes
  listenToInfrastructure: (callback: (data: any) => void) => {
    return onValue(dbRefs.infrastructure, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  }
};

// Data operations
export const dbOperations = {
  // Add new order
  addOrder: (orderData: any) => {
    const newOrderRef = push(dbRefs.orders);
    return set(newOrderRef, {
      ...orderData,
      id: newOrderRef.key,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  },

  // Update order
  updateOrder: (orderId: string, updates: any) => {
    const orderRef = ref(database, `orders/${orderId}`);
    return set(orderRef, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  // Delete order
  deleteOrder: (orderId: string) => {
    const orderRef = ref(database, `orders/${orderId}`);
    return remove(orderRef);
  },

  // Add new qualification
  addQualification: (qualificationData: any) => {
    const newQualRef = push(dbRefs.qualifications);
    return set(newQualRef, {
      ...qualificationData,
      id: newQualRef.key,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  },

  // Update system health
  updateSystemHealth: (healthData: any) => {
    return set(dbRefs.systemHealth, {
      ...healthData,
      updatedAt: Date.now()
    });
  },

  // Update collection stats
  updateCollectionStats: (statsData: any) => {
    return set(dbRefs.collectionStats, {
      ...statsData,
      updatedAt: Date.now()
    });
  }
};

// Authentication
export const authOperations = {
  // Sign in anonymously (for demo purposes)
  signInAnonymously: () => {
    return signInAnonymously(auth);
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

// Initialize anonymous auth
authOperations.signInAnonymously().catch(console.error);

export default app;
