/**
 * Centralized logging utility.
 * Prevents debug logs in production while maintaining error logging.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

interface LogOptions {
  level?: LogLevel;
  sendToErrorTracking?: boolean;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true;
    
    // Only log debug/info in development
    if (level === 'debug' || level === 'info') {
      return isDevelopment;
    }
    
    // Warn in both development and production (but less verbose)
    if (level === 'warn') return true;
    
    return false;
  }

  private formatMessage(...args: any[]): string {
    return args
      .map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: any[]): void {
    // Always log errors to console
    console.error('[ERROR]', ...args);
    
    // In production, send to error tracking service
    if (isProduction) {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      // Example:
      // if (typeof window !== 'undefined' && (window as any).Sentry) {
      //   const message = this.formatMessage(...args);
      //   (window as any).Sentry.captureException(new Error(message), {
      //     level: 'error',
      //     extra: { args }
      //   });
      // }
    }
  }

  // Convenience method for API responses (only in development)
  apiResponse(url: string, data: any): void {
    if (isDevelopment) {
      this.debug(`API Response [${url}]:`, data);
    }
  }

  // Convenience method for API errors (always logged)
  apiError(url: string, error: any): void {
    if (error && typeof error === 'object') {
      this.error(`API Error [${url}]:`, error);
    } else {
      this.error(`API Error [${url}]:`, String(error));
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };

