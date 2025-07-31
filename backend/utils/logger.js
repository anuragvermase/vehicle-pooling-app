import fs from 'fs';
import path from 'path';

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (data) {
      return `${logMessage}\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  writeToFile(level, formattedMessage) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);
    
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  info(message, data = null) {
    const formatted = this.formatMessage('INFO', message, data);
    console.log('\x1b[36m%s\x1b[0m', formatted); // Cyan
    this.writeToFile('INFO', formatted);
  }

  warn(message, data = null) {
    const formatted = this.formatMessage('WARN', message, data);
    console.warn('\x1b[33m%s\x1b[0m', formatted); // Yellow
    this.writeToFile('WARN', formatted);
  }

  error(message, data = null) {
    const formatted = this.formatMessage('ERROR', message, data);
    console.error('\x1b[31m%s\x1b[0m', formatted); // Red
    this.writeToFile('ERROR', formatted);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('DEBUG', message, data);
      console.debug('\x1b[90m%s\x1b[0m', formatted); // Gray
      this.writeToFile('DEBUG', formatted);
    }
  }
}

export const logger = new Logger();