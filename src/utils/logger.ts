// Comprehensive Logging Utility

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

class Logger {
  private readonly MAX_LOGS = 1000;
  private logs: LogEntry[] = [];
  private currentLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // Load saved logs from localStorage
    this.loadLogs();
    
    // Save logs periodically
    setInterval(() => {
      this.saveLogs();
    }, 30000); // Every 30 seconds
  }

  private loadLogs(): void {
    try {
      const saved = localStorage.getItem('app_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  private addLog(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    if (level < this.currentLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    this.logs.push(entry);

    // Keep only the last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
      console[levelNames[level].toLowerCase() as keyof Console](
        `[${levelNames[level]}] ${message}`,
        data || '',
        error || ''
      );
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const userData = sessionStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData) as { id: string };
        return user.id;
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('sessionId') || undefined;
    } catch (error) {
      return undefined;
    }
  }

  debug(message: string, data?: unknown): void {
    this.addLog(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.addLog(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.addLog(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: unknown): void {
    this.addLog(LogLevel.ERROR, message, data, error);
  }

  fatal(message: string, error?: Error, data?: unknown): void {
    this.addLog(LogLevel.FATAL, message, data, error);
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Set log level
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
}

export const logger = new Logger(); 