import config from '../config/index.js';

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

const currentLogLevel = LOG_LEVELS[config.logging.level.toUpperCase()] || LOG_LEVELS.INFO;

// Log formatter
const formatLog = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();

    if (config.logging.format === 'json') {
        return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
        });
    }

    // Pretty format for development
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
};

// Logger class
class Logger {
    error(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.ERROR) {
            console.error(formatLog('error', message, meta));
        }
    }

    warn(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.WARN) {
            console.warn(formatLog('warn', message, meta));
        }
    }

    info(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.INFO) {
            console.info(formatLog('info', message, meta));
        }
    }

    debug(message, meta = {}) {
        if (currentLogLevel >= LOG_LEVELS.DEBUG) {
            console.debug(formatLog('debug', message, meta));
        }
    }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info('Request received', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;

        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
    logger.error('Request error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });

    next(err);
};