// client/hooks/useWebSocket.ts
import { useState, useEffect } from 'react';

interface RealtimeUpdate {
  message: string;
  type: string;
  timestamp: string;
}

export const useRealTimeUpdates = (channel: string) => {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');

  useEffect(() => {
    // Simulate connection establishment
    setConnectionStatus('connected');
    
    // Add initial updates
    const initialUpdates: RealtimeUpdate[] = [
      {
        message: 'Dashboard initialized successfully',
        type: 'system',
        timestamp: new Date().toISOString()
      },
      {
        message: 'Real-time monitoring enabled',
        type: 'monitoring',
        timestamp: new Date(Date.now() - 1000).toISOString()
      }
    ];
    
    setUpdates(initialUpdates);

    // Generate realistic real-time updates
    const updateMessages = [
      'API TMF622 - New product order received',
      'API TMF620 - Product catalog updated',
      'API TMF637 - Inventory level changed',
      'API TMF679 - Product qualification completed',
      'API TMF688 - System event processed',
      'API TMF760 - Configuration validated',
      'System Health Check - All services operational',
      'Database backup completed successfully',
      'Cache cleared and rebuilt',
      'User authentication session refreshed',
      'Monitoring alert resolved',
      'Performance metrics updated'
    ];

    const updateTypes = ['order', 'catalog', 'inventory', 'qualification', 'event', 'configuration', 'system', 'database', 'cache', 'auth', 'monitoring', 'performance'];

    // Create interval for real-time updates
    const interval = setInterval(() => {
      const randomMessage = updateMessages[Math.floor(Math.random() * updateMessages.length)];
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      const newUpdate: RealtimeUpdate = {
        message: randomMessage,
        type: randomType,
        timestamp: new Date().toISOString()
      };
      
      setUpdates(prev => [newUpdate, ...prev].slice(0, 20)); // Keep only last 20 updates
    }, 8000); // Update every 8 seconds

    // Simulate occasional connection issues
    const connectionInterval = setInterval(() => {
      const shouldDisconnect = Math.random() < 0.05; // 5% chance
      if (shouldDisconnect) {
        setConnectionStatus('disconnected');
        setTimeout(() => {
          setConnectionStatus('connected');
          setUpdates(prev => [{
            message: 'Real-time connection restored',
            type: 'system',
            timestamp: new Date().toISOString()
          }, ...prev]);
        }, 2000); // Reconnect after 2 seconds
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, [channel]);

  return { updates, connectionStatus };
};

// Alternative hook for WebSocket-like functionality
export const useWebSocketConnection = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock WebSocket connection
    setIsConnected(true);
    
    const interval = setInterval(() => {
      // Simulate receiving messages
      const mockMessage = {
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        data: {
          status: 'ok',
          activeSessions: Math.floor(Math.random() * 100) + 50
        }
      };
      
      setLastMessage(mockMessage);
    }, 10000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [url]);

  const sendMessage = (message: any) => {
    // Mock sending message
    console.log('Sending message:', message);
  };

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage
  };
};