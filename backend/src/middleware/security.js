import config from '../config/index.js';

// Security headers middleware
export const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security (only in production)
    if (config.server.nodeEnv === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
};

// API key validation middleware
export const validateApiKey = (req, res, next) => {
    const apiKey = req.body.apiKey || req.headers.authorization?.replace('Bearer ', '');

    if (!apiKey) {
        return res.status(401).json({
            error: 'API key is required',
        });
    }

    if (!apiKey.startsWith(config.security.apiKeyValidation.prefix)) {
        return res.status(400).json({
            error: `API key must start with "${config.security.apiKeyValidation.prefix}"`,
        });
    }

    if (apiKey.length < config.security.apiKeyValidation.minLength) {
        return res.status(400).json({
            error: `API key must be at least ${config.security.apiKeyValidation.minLength} characters long`,
        });
    }

    req.apiKey = apiKey;
    next();
};

// Session validation middleware
export const validateSession = (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;

    if (!sessionId) {
        return res.status(400).json({
            error: 'Session ID is required',
        });
    }

    if (typeof sessionId !== 'string' || sessionId.length < 10 || sessionId.length > 50) {
        return res.status(400).json({
            error: 'Invalid session ID format',
        });
    }

    req.sessionId = sessionId;
    next();
};

// Request size limiter
export const requestSizeLimiter = (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = 1024 * 1024; // 1MB

    if (contentLength > maxSize) {
        return res.status(413).json({
            error: 'Request too large',
            message: `Maximum request size is ${maxSize} bytes`,
        });
    }

    next();
};