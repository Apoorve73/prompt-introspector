import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
    // Server configuration
    server: {
        port: process.env.PORT || 3001,
        nodeEnv: process.env.NODE_ENV || 'development',
        corsOrigins: [
            'http://localhost:3000',
            'https://apoorve73.github.io',
            'https://prompt-introspector.vercel.app',
        ],
    },

    // OpenAI configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        defaultModel: 'gpt-3.5-turbo',
        maxTokens: 800,
        temperature: 0.7,
        timeout: 30000, // 30 seconds
    },

    // Security configuration
    security: {
        sessionTimeout: 3600000, // 1 hour in milliseconds
        maxRequestsPerMinute: 60,
        apiKeyValidation: {
            minLength: 20,
            prefix: 'sk-',
        },
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
    },

    // Rate limiting configuration
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
    },
};

export default config;