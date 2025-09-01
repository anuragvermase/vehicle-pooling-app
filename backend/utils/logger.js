// utils/logger.js
import fs from 'fs';
import path from 'path';
import util from 'util';

/* ------------------------------ internals ------------------------------ */
function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // last-ditch: do not throw from the logger
    console.error('Failed to ensure log directory:', e);
  }
}

// Safely serialize anything, including Error objects & circular structures
function safeSerialize(obj) {
  if (obj == null) return null;

  // Pretty-print Error objects with stack + custom fields
  if (obj instanceof Error) {
    const base = {
      name: obj.name,
      message: obj.message,
      stack: obj.stack,
    };
    try {
      const extras = Object.fromEntries(
        Object.getOwnPropertyNames(obj).map((k) => [k, obj[k]])
      );
      return { ...base, ...extras };
    } catch {
      return base;
    }
  }

  // Avoid circular refs & summarize Buffers
  const seen = new WeakSet();
  const replacer = (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer?.(value)) {
      return `<Buffer length=${value.length}>`;
    }
    return value;
  };

  try {
    return JSON.parse(JSON.stringify(obj, replacer));
  } catch {
    // Fallback to util.inspect when JSON fails
    return util.inspect(obj, { depth: 4, colors: false });
  }
}

/* -------------------------------- Logger -------------------------------- */
class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    ensureDir(this.logDir);

    this.level = (process.env.LOG_LEVEL || 'info').toLowerCase(); // 'debug' to enable debug in any env
    this.isDev = process.env.NODE_ENV === 'development';
  }

  filePathForToday() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${date}.log`);
  }

  format(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const head = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (data !== null && data !== undefined) {
      const payload = safeSerialize(data);
      const block = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
      return `${head}\nData: ${block}`;
    }
    return head;
  }

  write(_level, formatted) {
    try {
      fs.appendFileSync(this.filePathForToday(), formatted + '\n');
    } catch (e) {
      // As a fallback, at least print to console
      console.error('Failed writing log file:', e);
    }
  }

  /* Level gating (info >= debug) */
  shouldLogDebug() {
    return this.isDev || this.level === 'debug';
  }

  info(message, data = null) {
    const line = this.format('INFO', message, data);
    console.log('\x1b[36m%s\x1b[0m', line); // cyan
    this.write('INFO', line);
  }

  warn(message, data = null) {
    const line = this.format('WARN', message, data);
    console.warn('\x1b[33m%s\x1b[0m', line); // yellow
    this.write('WARN', line);
  }

  error(message, data = null) {
    // Support both signatures: error(err) and error(msg, data)
    if (message instanceof Error && data == null) {
      const err = message;
      const line = this.format('ERROR', err.message, err);
      console.error('\x1b[31m%s\x1b[0m', line); // red
      this.write('ERROR', line);
      return;
    }
    const line = this.format('ERROR', message, data);
    console.error('\x1b[31m%s\x1b[0m', line); // red
    this.write('ERROR', line);
  }

  debug(message, data = null) {
    if (!this.shouldLogDebug()) return;
    const line = this.format('DEBUG', message, data);
    console.debug('\x1b[90m%s\x1b[0m', line); // gray
    this.write('DEBUG', line);
  }
}

export const logger = new Logger();
