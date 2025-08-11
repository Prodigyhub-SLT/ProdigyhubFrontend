import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface DashboardData {
  orders: any[];
  products: any[];
  offerings: any[];
  categories: any[];
  qualifications: any[];
  events: any[];
  systemHealth: any;
  collectionStats: any;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    orders: [],
    products: [],
    offerings: [],
    categories: [],
    qualifications: [],
    events: [],
    systemHealth: null,
    collectionStats: null
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data from multiple endpoints in parallel
      const [
        ordersResponse,
        productsResponse,
        offeringsResponse,
        categoriesResponse,
        qualificationsResponse,
        eventsResponse,
        systemHealthResponse,
        collectionStatsResponse
      ] = await Promise.allSettled([
        api.getOrders(),
        api.getProducts(),
        api.getOfferings(),
        api.getCategories(),
        api.getCheckQualifications(),
        api.getEvents(),
        api.getHealth(),
        fetch('/debug/storage').then(res => res.json())
      ]);

      const newData: DashboardData = {
        orders: ordersResponse.status === 'fulfilled' ? ordersResponse.value : [],
        products: productsResponse.status === 'fulfilled' ? productsResponse.value : [],
        offerings: offeringsResponse.status === 'fulfilled' ? offeringsResponse.value : [],
        categories: categoriesResponse.status === 'fulfilled' ? categoriesResponse.value : [],
        qualifications: qualificationsResponse.status === 'fulfilled' ? qualificationsResponse.value : [],
        events: eventsResponse.status === 'fulfilled' ? eventsResponse.value : [],
        systemHealth: systemHealthResponse.status === 'fulfilled' ? systemHealthResponse.value : null,
        collectionStats: collectionStatsResponse.status === 'fulfilled' ? collectionStatsResponse.value : null
      };

      setData(newData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
