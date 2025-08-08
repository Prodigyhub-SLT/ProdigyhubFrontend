// client/hooks/usePolling.ts
import { useState, useEffect, useCallback } from 'react';

interface UsePollingOptions {
  fetchFunction: () => Promise<any>;
  interval: number;
  enabled: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const usePolling = (options: UsePollingOptions) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await options.fetchFunction();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    if (!options.enabled) return;

    // Initial load
    refresh();
    
    // Set up polling interval
    const interval = setInterval(refresh, options.interval);
    
    return () => clearInterval(interval);
  }, [options.enabled, options.interval, refresh]);

  return { data, loading, error, refresh };
};

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    apiCalls: 0,
    errorRate: 0,
    responseTime: 0,
    uptime: 99.9
  });

  useEffect(() => {
    // Simulate dashboard metrics
    const interval = setInterval(() => {
      setMetrics({
        apiCalls: Math.floor(Math.random() * 1000) + 5000,
        errorRate: Math.random() * 2,
        responseTime: Math.random() * 100 + 50,
        uptime: 99.9
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { data: metrics, loading: false, error: null };
};

export const useStatusUpdates = (services: string[]) => {
  const [statuses, setStatuses] = useState<Record<string, { status: string }>>({});
  
  useEffect(() => {
    // Initialize all services as healthy
    const initialStatuses = services.reduce((acc, service) => ({
      ...acc,
      [service]: { status: Math.random() > 0.1 ? 'healthy' : 'degraded' } // 90% healthy
    }), {});
    
    setStatuses(initialStatuses);

    // Simulate occasional status changes
    const interval = setInterval(() => {
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomStatus = Math.random() > 0.2 ? 'healthy' : 'degraded';
      
      setStatuses(prev => ({
        ...prev,
        [randomService]: { status: randomStatus }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [services]);

  const getOverallHealth = () => {
    const healthyServices = Object.values(statuses).filter(s => s.status === 'healthy').length;
    const totalServices = Object.keys(statuses).length;
    
    if (totalServices === 0) return 'unknown';
    if (healthyServices === totalServices) return 'healthy';
    if (healthyServices > totalServices / 2) return 'degraded';
    return 'unhealthy';
  };

  return { statuses, getOverallHealth };
};