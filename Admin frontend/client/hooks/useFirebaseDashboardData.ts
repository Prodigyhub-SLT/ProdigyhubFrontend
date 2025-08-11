import { useState, useEffect } from 'react';
import { realtimeListeners, dbOperations } from '@/lib/firebase';

export interface FirebaseDashboardData {
  orders: any[];
  products: any[];
  offerings: any[];
  categories: any[];
  qualifications: any[];
  events: any[];
  systemHealth: any;
  collectionStats: any;
  infrastructure: any;
}

export const useFirebaseDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FirebaseDashboardData>({
    orders: [],
    products: [],
    offerings: [],
    categories: [],
    qualifications: [],
    events: [],
    systemHealth: null,
    collectionStats: null,
    infrastructure: null
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Set up real-time listeners
    const unsubscribeOrders = realtimeListeners.listenToOrders((orders) => {
      setData(prev => ({ ...prev, orders }));
    });

    const unsubscribeProducts = realtimeListeners.listenToProducts((products) => {
      setData(prev => ({ ...prev, products }));
    });

    const unsubscribeOfferings = realtimeListeners.listenToOfferings((offerings) => {
      setData(prev => ({ ...prev, offerings }));
    });

    const unsubscribeCategories = realtimeListeners.listenToCategories((categories) => {
      setData(prev => ({ ...prev, categories }));
    });

    const unsubscribeQualifications = realtimeListeners.listenToQualifications((qualifications) => {
      setData(prev => ({ ...prev, qualifications }));
    });

    const unsubscribeEvents = realtimeListeners.listenToEvents((events) => {
      setData(prev => ({ ...prev, events }));
    });

    const unsubscribeSystemHealth = realtimeListeners.listenToSystemHealth((systemHealth) => {
      setData(prev => ({ ...prev, systemHealth }));
    });

    const unsubscribeCollectionStats = realtimeListeners.listenToCollectionStats((collectionStats) => {
      setData(prev => ({ ...prev, collectionStats }));
    });

    const unsubscribeInfrastructure = realtimeListeners.listenToInfrastructure((infrastructure) => {
      setData(prev => ({ ...prev, infrastructure }));
    });

    // Set loading to false after initial data load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Cleanup function
    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeOfferings();
      unsubscribeCategories();
      unsubscribeQualifications();
      unsubscribeEvents();
      unsubscribeSystemHealth();
      unsubscribeCollectionStats();
      unsubscribeInfrastructure();
      clearTimeout(timer);
    };
  }, []);

  // Function to add new data
  const addData = {
    addOrder: (orderData: any) => dbOperations.addOrder(orderData),
    addQualification: (qualificationData: any) => dbOperations.addQualification(qualificationData),
    updateSystemHealth: (healthData: any) => dbOperations.updateSystemHealth(healthData),
    updateCollectionStats: (statsData: any) => dbOperations.updateCollectionStats(statsData)
  };

  return {
    data,
    loading,
    error,
    addData
  };
};
