import { body, validationResult } from 'express-validator';

// Validation middleware factory
export const validate = (validations) => {
    return async(req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value,
            })),
        });
    };
};

// Common validation rules
export const validationRules = {
    apiKey: body('apiKey')
        .isString()
        .isLength({ min: 20 })
        .matches(/^sk-/)
        .withMessage('API key must start with "sk-" and be at least 20 characters long'),

    sessionId: body('sessionId')
        .isString()
        .isLength({ min: 10, max: 50 })
        .withMessage('Session ID must be between 10 and 50 characters'),

    text: body('text')
        .isString()
        .isLength({ min: 1, max: 10000 })
        .withMessage('Text must be between 1 and 10,000 characters'),

    messages: body('messages')
        .isArray({ min: 1 })
        .withMessage('Messages must be a non-empty array'),

    model: body('model')
        .optional()
        .isString()
        .isLength({ min: 1, max: 100 })
        .withMessage('Model must be a valid string'),

    temperature: body('temperature')
        .optional()
        .isFloat({ min: 0, max: 2 })
        .withMessage('Temperature must be between 0 and 2'),

    maxTokens: body('max_tokens')
        .optional()
        .isInt({ min: 1, max: 4000 })
        .withMessage('Max tokens must be between 1 and 4000'),
};