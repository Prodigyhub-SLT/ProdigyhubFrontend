// client/hooks/use-toast.ts
import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

// Global toast state (you can also use a context for this)
let toastState: ToastState = { toasts: [] };
let listeners: Array<(state: ToastState) => void> = [];

const generateId = () => Math.random().toString(36).substring(2, 9);

const updateToastState = (newState: ToastState) => {
  toastState = newState;
  listeners.forEach(listener => listener(newState));
};

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = generateId();
  const newToast: Toast = {
    id,
    duration: 5000, // Default 5 seconds
    ...toast,
  };

  updateToastState({
    toasts: [...toastState.toasts, newToast]
  });

  // Auto remove toast after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }

  return id;
};

const removeToast = (id: string) => {
  updateToastState({
    toasts: toastState.toasts.filter(toast => toast.id !== id)
  });
};

const clearAllToasts = () => {
  updateToastState({ toasts: [] });
};

export const useToast = () => {
  const [state, setState] = useState<ToastState>(toastState);

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  // Subscribe to state changes
  useState(() => {
    const unsubscribe = subscribe(setState);
    return unsubscribe;
  });

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = addToast(props);
    
    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      const emoji = props.variant === 'destructive' ? '❌' : 
                   props.variant === 'success' ? '✅' : 
                   props.variant === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} Toast: ${props.title}${props.description ? ` - ${props.description}` : ''}`);
    }
    
    return {
      id,
      dismiss: () => removeToast(id),
      update: (updates: Partial<Toast>) => {
        updateToastState({
          toasts: toastState.toasts.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        });
      }
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return {
    toast,
    dismiss,
    toasts: state.toasts,
    clearAll: clearAllToasts
  };
};

// Convenience functions for different toast types
export const toast = {
  success: (title: string, description?: string) => 
    addToast({ title, description, variant: 'success' }),
  
  error: (title: string, description?: string) => 
    addToast({ title, description, variant: 'destructive' }),
  
  warning: (title: string, description?: string) => 
    addToast({ title, description, variant: 'warning' }),
  
  info: (title: string, description?: string) => 
    addToast({ title, description, variant: 'default' }),
    
  custom: (props: Omit<Toast, 'id'>) => addToast(props)
};

export default useToast;