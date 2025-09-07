import express from 'express';
import rateLimit from 'express-rate-limit';
import { validate, validationRules } from '../middleware/validation.js';
import { validateApiKey, validateSession, requestSizeLimiter } from '../middleware/security.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import openaiService from '../services/openaiService.js';
import sessionService from '../services/sessionService.js';
import config from '../config/index.js';

const router = express.Router();

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: config.rateLimit.message,
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Apply request size limiting
router.use(requestSizeLimiter);

// Health check endpoint
router.get('/health', (req, res) => {
    const stats = sessionService.getStats();
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.server.nodeEnv,
        sessions: stats,
    });
});

// Set API key endpoint
router.post('/set-key',
    validate([validationRules.apiKey, validationRules.sessionId]),
    asyncHandler(async(req, res) => {
        const { apiKey, sessionId } = req.body;

        // Validate API key with OpenAI
        const isValid = await openaiService.validateApiKey(apiKey);
        if (!isValid) {
            return res.status(400).json({
                error: 'Invalid API key',
                message: 'The provided API key is not valid or has insufficient permissions'
            });
        }

        // Store API key in session
        sessionService.setApiKey(sessionId, apiKey);

        res.json({
            success: true,
            message: 'API key set and validated successfully'
        });
    })
);

// Validate API key endpoint
router.post('/validate-key',
    validate([validationRules.apiKey]),
    asyncHandler(async(req, res) => {
        const { apiKey } = req.body;

        const isValid = await openaiService.validateApiKey(apiKey);

        if (isValid) {
            res.json({
                valid: true,
                message: 'API key is valid'
            });
        } else {
            res.status(401).json({
                valid: false,
                error: 'Invalid API key or insufficient permissions',
            });
        }
    })
);

// Tokenize text endpoint
router.post('/tokenize',
    validate([validationRules.text]),
    validateSession,
    asyncHandler(async(req, res) => {
        const { text } = req.body;
        const sessionId = req.sessionId;

        // Get API key from session or environment
        let apiKey = sessionService.getApiKey(sessionId);
        if (!apiKey && config.openai.apiKey) {
            apiKey = config.openai.apiKey;
        }

        if (!apiKey) {
            return res.status(401).json({
                error: 'API key not set',
                message: 'Please set your API key first'
            });
        }

        const result = await openaiService.tokenize(apiKey, text);
        res.json(result);
    })
);

// Get available models endpoint
router.get('/models',
    validateSession,
    asyncHandler(async(req, res) => {
        const sessionId = req.sessionId;

        // Get API key from session or environment
        let apiKey = sessionService.getApiKey(sessionId);
        if (!apiKey && config.openai.apiKey) {
            apiKey = config.openai.apiKey;
        }

        if (!apiKey) {
            return res.status(401).json({
                error: 'API key not set',
                message: 'Please set your API key first'
            });
        }

        const models = await openaiService.getModels(apiKey);
        res.json(models);
    })
);

// Chat completions endpoint
router.post('/chat/completions',
    validate([
        validationRules.messages,
        validationRules.model,
        validationRules.temperature,
        validationRules.maxTokens,
    ]),
    validateSession,
    asyncHandler(async(req, res) => {
        const sessionId = req.sessionId;
        const { messages, model, stream = false, ...otherParams } = req.body;

        // Get API key from session or environment
        let apiKey = sessionService.getApiKey(sessionId);
        if (!apiKey && config.openai.apiKey) {
            apiKey = config.openai.apiKey;
        }

        if (!apiKey) {
            return res.status(401).json({
                error: 'API key not set',
                message: 'Please set your API key first'
            });
        }

        const options = {
            messages,
            model,
            stream,
            ...otherParams,
        };

        if (stream) {
            // Handle streaming response
            const completion = await openaiService.createChatCompletion(apiKey, options);

            // Set headers for Server-Sent Events
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control',
            });

            // Stream the response
            const stream = completion.createReadStream();
            stream.on('data', (chunk) => {
                res.write(chunk);
            });

            stream.on('end', () => {
                res.end();
            });

            stream.on('error', (error) => {
                console.error('Stream error:', error);
                res.end();
            });
        } else {
            // Handle non-streaming response
            const completion = await openaiService.createChatCompletion(apiKey, options);
            res.json(completion);
        }
    })
);

// Get default API key info endpoint
router.get('/default-key', (req, res) => {
    const hasDefaultKey = !!config.openai.apiKey;

    if (hasDefaultKey) {
        res.json({
            hasDefaultKey: true,
            keyPrefix: config.openai.apiKey.substring(0, 7) + '...',
        });
    } else {
        res.json({ hasDefaultKey: false });
    }
});

// Session management endpoints
router.get('/sessions', (req, res) => {
    const sessions = sessionService.getAllSessionsInfo();
    res.json({ sessions });
});

router.delete('/sessions/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const removed = sessionService.removeSession(sessionId);

    if (removed) {
        res.json({ success: true, message: 'Session removed' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

router.post('/sessions/cleanup', (req, res) => {
    const cleanedCount = sessionService.cleanupExpiredSessions();
    res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired sessions`
    });
});

export default router;