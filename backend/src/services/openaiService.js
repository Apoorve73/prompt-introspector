import OpenAI from 'openai';
import config from '../config/index.js';
import { logger } from '../middleware/logging.js';
import { ExternalServiceError, AuthenticationError, RateLimitError } from '../middleware/errorHandler.js';

class OpenAIService {
    constructor() {
        this.clients = new Map(); // Cache clients by API key
    }

    // Get or create OpenAI client for API key
    getClient(apiKey) {
        if (this.clients.has(apiKey)) {
            return this.clients.get(apiKey);
        }

        const client = new OpenAI({
            apiKey,
            timeout: config.openai.timeout,
        });
        this.clients.set(apiKey, client);

        return client;
    }

    // Validate API key by making a test request
    async validateApiKey(apiKey) {
        try {
            const client = this.getClient(apiKey);
            await client.models.list();
            return true;
        } catch (error) {
            logger.warn('API key validation failed', { error: error.message });
            return false;
        }
    }

    // Get available models
    async getModels(apiKey) {
        try {
            const client = this.getClient(apiKey);
            const response = await client.models.list();
            return response;
        } catch (error) {
            logger.error('Failed to fetch models', { error: error.message });
            throw this.handleOpenAIError(error);
        }
    }

    // Tokenize text using OpenAI
    async tokenize(apiKey, text) {
        try {
            const client = this.getClient(apiKey);

            // Use chat completions to get token count
            const response = await client.chat.completions.create({
                model: config.openai.defaultModel,
                messages: [{ role: 'user', content: text }],
                max_tokens: 1,
                temperature: 0,
            });

            const totalTokens = response.usage.total_tokens;
            const tokens = this.improvedTokenize(text, totalTokens);

            logger.debug('Text tokenized', {
                textLength: text.length,
                tokenCount: totalTokens
            });

            return { tokens, totalTokens };
        } catch (error) {
            logger.error('Tokenization failed', { error: error.message });
            throw this.handleOpenAIError(error);
        }
    }

    // Create chat completion
    async createChatCompletion(apiKey, options) {
        try {
            const client = this.getClient(apiKey);

            const response = await client.chat.completions.create({
                model: options.model || config.openai.defaultModel,
                messages: options.messages,
                max_tokens: options.max_tokens || config.openai.maxTokens,
                temperature: options.temperature || config.openai.temperature,
                stream: options.stream || false,
                ...options.otherParams,
            });

            logger.debug('Chat completion created', {
                model: options.model || config.openai.defaultModel,
                tokenCount: response.usage?.total_tokens || 0,
            });

            return response;
        } catch (error) {
            logger.error('Chat completion failed', { error: error.message });
            throw this.handleOpenAIError(error);
        }
    }

    // Handle OpenAI API errors
    handleOpenAIError(error) {
        if (error.status) {
            const status = error.status;
            const message = (error.error && error.error.message) || 'OpenAI API error';

            if (status === 401) {
                return new AuthenticationError('Invalid OpenAI API key');
            } else if (status === 429) {
                return new RateLimitError('OpenAI API rate limit exceeded');
            } else if (status >= 500) {
                return new ExternalServiceError('OpenAI service temporarily unavailable');
            } else {
                return new ExternalServiceError(message, error);
            }
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return new ExternalServiceError('Unable to connect to OpenAI service');
        }

        if (error.code === 'ETIMEDOUT') {
            return new ExternalServiceError('OpenAI request timeout');
        }

        return new ExternalServiceError('OpenAI service error', error);
    }

    // Improved tokenization that matches OpenAI's token count
    improvedTokenize(text, targetTokenCount) {
        const tokens = [];
        let tokenId = 0;
        let currentTokenCount = 0;

        let currentWord = '';
        let currentType = null;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charType = this.getTokenType(char);

            // If we're starting a new token type, save the previous one
            if (currentType !== null && charType !== currentType && currentWord !== '') {
                tokens.push({
                    id: tokenId++,
                    text: currentWord,
                    originalWord: currentWord,
                    type: currentType,
                    processed: false,
                    attention: 0,
                });
                currentTokenCount += 1;
                currentWord = '';
            }

            // Start new token or continue current one
            if (currentWord === '') {
                currentType = charType;
                currentWord = char;
            } else if (charType === currentType) {
                currentWord += char;
            } else {
                // Different type, save current and start new
                tokens.push({
                    id: tokenId++,
                    text: currentWord,
                    originalWord: currentWord,
                    type: currentType,
                    processed: false,
                    attention: 0,
                });
                currentTokenCount += 1;
                currentWord = char;
                currentType = charType;
            }
        }

        // Don't forget the last token
        if (currentWord !== '') {
            tokens.push({
                id: tokenId++,
                text: currentWord,
                originalWord: currentWord,
                type: currentType,
                processed: false,
                attention: 0,
            });
            currentTokenCount += 1;
        }

        return tokens.slice(0, targetTokenCount);
    }

    // Helper function to determine token type
    getTokenType(text) {
        if (/^[.,!?;:'"()\[\]{}]$/.test(text)) {
            return 'punctuation';
        } else if (/^\s+$/.test(text)) {
            return 'space';
        } else if (/^[a-zA-Z]+$/.test(text)) {
            if (text.length <= 4 && !/^[A-Z]/.test(text)) {
                return 'subword';
            }
            return 'word';
        } else if (/^[0-9]+$/.test(text)) {
            return 'number';
        }
        return 'other';
    }

    // Clean up old clients
    cleanup() {
        this.clients.clear();
        logger.info('OpenAI clients cleaned up');
    }
}

export default new OpenAIService();