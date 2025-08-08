type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  stackTrace?: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxLocalEntries: number;
  enableStackTrace: boolean;
}

class Logger {
  private config: LoggerConfig;
  private localEntries: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableRemote: false,
      maxLocalEntries: 1000,
      enableStackTrace: true,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.warn('Resource Loading Error', {
          type: (event.target as any)?.tagName,
          source: (event.target as any)?.src || (event.target as any)?.href,
          message: 'Failed to load resource'
        });
      }
    }, true);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add user ID if available
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        entry.userId = user.id;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Add stack trace for errors
    if (level === 'error' && this.config.enableStackTrace) {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  private storeLocal(entry: LogEntry) {
    this.localEntries.push(entry);
    
    // Maintain max entries limit
    if (this.localEntries.length > this.config.maxLocalEntries) {
      this.localEntries = this.localEntries.slice(-this.config.maxLocalEntries);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.localEntries.slice(-100))); // Keep last 100
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  private async sendRemote(entry: LogEntry) {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context);

    // Console logging
    if (this.config.enableConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      const contextStr = context ? JSON.stringify(context, null, 2) : '';
      console[consoleMethod](`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`, contextStr);
    }

    // Local storage
    this.storeLocal(entry);

    // Remote logging
    if (this.config.enableRemote) {
      this.sendRemote(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  // Performance logging
  timing(label: string, duration: number, context?: Record<string, any>) {
    this.info(`Performance: ${label}`, {
      duration,
      ...context,
      type: 'performance'
    });
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>) {
    this.info(`User Action: ${action}`, {
      ...context,
      type: 'user_action'
    });
  }

  // API call logging
  apiCall(method: string, url: string, status: number, duration: number, context?: Record<string, any>) {
    const level = status >= 400 ? 'error' : 'info';
    this.log(level, `API Call: ${method} ${url}`, {
      status,
      duration,
      ...context,
      type: 'api_call'
    });
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.localEntries.filter(entry => entry.level === level);
    }
    return [...this.localEntries];
  }

  // Clear local logs
  clearLogs() {
    this.localEntries = [];
    localStorage.removeItem('app_logs');
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.localEntries, null, 2);
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: '/api/logs',
  enableStackTrace: process.env.NODE_ENV !== 'production'
});

// Performance measurement utility
export class PerformanceTracker {
  private startTimes: Map<string, number> = new Map();

  start(label: string) {
    this.startTimes.set(label, performance.now());
  }

  end(label: string, context?: Record<string, any>) {
    const startTime = this.startTimes.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      logger.timing(label, duration, context);
      this.startTimes.delete(label);
      return duration;
    }
    return 0;
  }

  measure<T>(label: string, fn: () => T, context?: Record<string, any>): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label, context);
      return result;
    } catch (error) {
      this.end(label, { ...context, error: true });
      throw error;
    }
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, context);
      return result;
    } catch (error) {
      this.end(label, { ...context, error: true });
      throw error;
    }
  }
}

export const perf = new PerformanceTracker();

// Enhanced error boundary logging
export function logError(error: Error, errorInfo?: any, context?: Record<string, any>) {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    errorInfo,
    ...context
  });
}

// API error logging helper
export function logApiError(error: any, request: { method: string; url: string }, context?: Record<string, any>) {
  logger.error('API Error', {
    message: error.message || 'Unknown API error',
    status: error.status,
    method: request.method,
    url: request.url,
    ...context
  });
}

export default logger;
