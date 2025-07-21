const createLogger = () => {
  const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = [`${timestamp}] [${level.toUpperCase()}] ${message}`];
    
    if (args.length > 0) {
      console[level](logMessage, ...args);
    } else {
      console[level](logMessage);
    }
  };

  return {
    info: (message, ...args) => log('info', message, ...args),
    warn: (message, ...args) => log('warn', message, ...args),
    error: (message, ...args) => log('error', message, ...args),
    debug: (message, ...args) => {
      if (process.env.NODE_ENV === 'development') {
        log('debug', message, ...args);
      }
    }
  };
};

export const logger = createLogger();