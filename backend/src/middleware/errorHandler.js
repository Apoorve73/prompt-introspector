import config from '../config/index.js';

// Custom error classes
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429);
    }
}

export class ExternalServiceError extends AppError {
    constructor(message = 'External service error', originalError = null) {
        super(message, 502);
        this.originalError = originalError;
    }
}

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    let error = {...err };
    error.message = err.message;

    // Log error
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ValidationError(message);
    }

    // OpenAI API errors
    if (err.response && err.response.status) {
        const status = err.response.status;
        const message = err.response.data?.error?.message || 'OpenAI API error';

        if (status === 401) {
            error = new AuthenticationError('Invalid OpenAI API key');
        } else if (status === 429) {
            error = new RateLimitError('OpenAI API rate limit exceeded');
        } else if (status >= 500) {
            error = new ExternalServiceError('OpenAI service temporarily unavailable');
        } else {
            error = new AppError(message, status);
        }
    }

    // Network errors
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        error = new ExternalServiceError('Unable to connect to external service');
    }

    // Timeout errors
    if (err.code === 'ETIMEDOUT') {
        error = new ExternalServiceError('Request timeout');
    }

    // Default to 500 server error
    if (!error.statusCode) {
        error.statusCode = 500;
    }

    // Send error response
    const response = {
        error: error.message,
        ...(config.server.nodeEnv === 'development' && {
            stack: err.stack,
            details: err.details,
        }),
    };

    res.status(error.statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: 'This is an API server. Please use the frontend application.',
        availableEndpoints: [
            '/api/health',
            '/api/set-key',
            '/api/validate-key',
            '/api/tokenize',
            '/api/chat/completions',
            '/api/models',
            '/api/default-key',
        ],
    });
};

// Async error wrapper
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};