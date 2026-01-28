import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log file paths
const appLogFile = path.join(logsDir, 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

// Log levels
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

// Format log message
const formatLogMessage = (level: LogLevel, message: string, meta?: any): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
};

// Write to log file
const writeToLog = (filePath: string, message: string): void => {
  fs.appendFile(filePath, message, (err) => {
    if (err) {
      console.error(`Failed to write to log file: ${err.message}`);
    }
  });
};

// Log functions
export const logger = {
  info: (message: string, meta?: any): void => {
    const logMessage = formatLogMessage(LogLevel.INFO, message, meta);
    console.log(logMessage.trim());
    writeToLog(appLogFile, logMessage);
  },

  warn: (message: string, meta?: any): void => {
    const logMessage = formatLogMessage(LogLevel.WARN, message, meta);
    console.warn(logMessage.trim());
    writeToLog(appLogFile, logMessage);
  },

  error: (message: string, meta?: any): void => {
    const logMessage = formatLogMessage(LogLevel.ERROR, message, meta);
    console.error(logMessage.trim());
    writeToLog(appLogFile, logMessage);
    writeToLog(errorLogFile, logMessage); // Also write to error log
  },

  debug: (message: string, meta?: any): void => {
    // Only log debug messages in development environment
    if (process.env.NODE_ENV === 'development') {
      const logMessage = formatLogMessage(LogLevel.DEBUG, message, meta);
      console.debug(logMessage.trim());
      writeToLog(appLogFile, logMessage);
    }
  },

  // Function to get the log contents (for admin/debug purposes)
  getAppLogs: (lines: number = 100): string => {
    try {
      if (!fs.existsSync(appLogFile)) {
        return 'No log file exists yet.';
      }
      
      const content = fs.readFileSync(appLogFile, 'utf8');
      const allLines = content.split('\n').filter(Boolean);
      const lastLines = allLines.slice(-lines);
      return lastLines.join('\n');
    } catch (error) {
      console.error('Failed to read log file:', error);
      return 'Failed to read log file.';
    }
  },

  getErrorLogs: (lines: number = 100): string => {
    try {
      if (!fs.existsSync(errorLogFile)) {
        return 'No error log file exists yet.';
      }
      
      const content = fs.readFileSync(errorLogFile, 'utf8');
      const allLines = content.split('\n').filter(Boolean);
      const lastLines = allLines.slice(-lines);
      return lastLines.join('\n');
    } catch (error) {
      console.error('Failed to read error log file:', error);
      return 'Failed to read error log file.';
    }
  }
};