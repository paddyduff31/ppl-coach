// Cross-platform detection
const isWeb = typeof window !== 'undefined' && !window.ReactNativeWebView;
const isMobile = !isWeb;
const isDev = process.env.NODE_ENV === 'development';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log entry interface
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
  userId?: string;
  sessionId?: string;
  platform: 'web' | 'mobile';
  version?: string;
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enablePersistence: boolean;
  remoteEndpoint?: string;
  apiKey?: string;
  maxLocalLogs: number;
  context?: string;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: isDev ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: isDev,
  enableRemote: !isDev,
  enablePersistence: true,
  maxLocalLogs: 1000,
};

class PPLLogger {
  private config: LoggerConfig;
  private localLogs: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();

    // Initialize platform-specific logging
    this.initializePlatformLogging();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePlatformLogging() {
    if (isMobile) {
      // React Native specific initialization
      try {
        // Could integrate with Flipper, Reactotron, or other RN debugging tools
        const { YellowBox } = require('react-native');
        YellowBox?.ignoreWarnings?.(['PPL Logger']);
      } catch (e) {
        // React Native not available
      }
    }

    if (isWeb) {
      // Web specific initialization
      this.setupUnhandledErrorLogging();
    }
  }

  private setupUnhandledErrorLogging() {
    if (isWeb) {
      window.addEventListener('error', (event) => {
        this.error('Unhandled Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled Promise Rejection', {
          reason: event.reason,
        });
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      data,
      context: this.config.context,
      sessionId: this.sessionId,
      platform: isWeb ? 'web' : 'mobile',
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    return `${timestamp} ${levelName} ${context} ${entry.message}`;
  }

  private async log(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, data);

    // Console logging
    if (this.config.enableConsole) {
      const consoleMessage = this.formatConsoleMessage(entry);

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(consoleMessage, data);
          break;
        case LogLevel.INFO:
          console.info(consoleMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(consoleMessage, data);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(consoleMessage, data);
          break;
      }
    }

    // Local persistence
    if (this.config.enablePersistence) {
      this.addToLocalLogs(entry);
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      await this.sendToRemote(entry);
    }
  }

  private addToLocalLogs(entry: LogEntry) {
    this.localLogs.push(entry);

    // Maintain max log size
    if (this.localLogs.length > this.config.maxLocalLogs) {
      this.localLogs.shift();
    }

    // Persist to storage
    this.persistLogs();
  }

  private persistLogs() {
    try {
      const logsToStore = this.localLogs.slice(-100); // Store last 100 logs

      if (isWeb && window.localStorage) {
        localStorage.setItem('ppl-coach-logs', JSON.stringify(logsToStore));
      }

      if (isMobile) {
        // Could integrate with AsyncStorage for React Native
        // For now, keep in memory only
      }
    } catch (error) {
      // Storage failed, continue without persistence
    }
  }

  private async sendToRemote(entry: LogEntry) {
    try {
      if (!this.config.remoteEndpoint) return;

      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Remote logging failed, continue silently
      if (isDev) {
        console.warn('Failed to send log to remote endpoint:', error);
      }
    }
  }

  // Public logging methods
  debug(message: string, data?: any) {
    return this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    return this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    return this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any) {
    return this.log(LogLevel.ERROR, message, data);
  }

  fatal(message: string, data?: any) {
    return this.log(LogLevel.FATAL, message, data);
  }

  // Utility methods
  setUserId(userId: string) {
    this.config.context = `user:${userId}`;
  }

  setContext(context: string) {
    this.config.context = context;
  }

  getLocalLogs(): LogEntry[] {
    return [...this.localLogs];
  }

  clearLocalLogs() {
    this.localLogs = [];
    if (isWeb && window.localStorage) {
      localStorage.removeItem('ppl-coach-logs');
    }
  }

  // Performance monitoring
  startTimer(label: string): () => void {
    const startTime = performance.now();
    this.debug(`Timer started: ${label}`);

    return () => {
      const duration = performance.now() - startTime;
      this.info(`Timer finished: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  // API call logging
  logApiCall(method: string, url: string, status: number, duration: number, data?: any) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${url}`, {
      status,
      duration: `${duration.toFixed(2)}ms`,
      ...data,
    });
  }
}

// Create default logger instance
export const logger = new PPLLogger();

// Export logger class for custom instances
export { PPLLogger };
