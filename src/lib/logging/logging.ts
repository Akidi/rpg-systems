type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'events' | 'game' | 'player' | 'system' | 'performance';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private enabledLevels: Set<LogLevel> = new Set(['info', 'warn', 'error']);
  private enabledCategories: Set<LogCategory> = new Set(['events', 'game', 'player', 'system', 'performance']);

  // Configure what gets logged
  setLogLevel(levels: LogLevel[]): void {
    this.enabledLevels = new Set(levels);
  }

  setCategories(categories: LogCategory[]): void {
    this.enabledCategories = new Set(categories);
  }

  // Core logging methods
  debug(category: LogCategory, message: string, data?: unknown): void {
    this.log('debug', category, message, data);
  }

  info(category: LogCategory, message: string, data?: unknown): void {
    this.log('info', category, message, data);
  }

  warn(category: LogCategory, message: string, data?: unknown): void {
    this.log('warn', category, message, data);
  }

  error(category: LogCategory, message: string, data?: unknown): void {
    this.log('error', category, message, data);
  }

  // Main logging function
  private log(level: LogLevel, category: LogCategory, message: string, data?: unknown): void {
    // Check if this log should be processed
    if (!this.enabledLevels.has(level) || !this.enabledCategories.has(category)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data
    };

    // Add to internal log storage
    this.logs.push(entry);

    // Trim logs if we exceed max
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console
    this.outputToConsole(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}][${entry.category}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'error':
        console.error(message, entry.data);
        break;
    }
  }

  // Utility methods
  clear(): void {
    this.logs = [];
  }

  getLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (category && log.category !== category) return false;
      return true;
    });
  }

  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Development helpers
  enableDebug(): void {
    this.enabledLevels.add('debug');
  }

  disableDebug(): void {
    this.enabledLevels.delete('debug');
  }
}

// Export singleton instance
export const logger = new Logger();