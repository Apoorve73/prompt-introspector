import { useState, useCallback } from 'react';
import { realTokenize, callOpenAI } from '../utils/api';

/**
 * Custom hook for OpenAI API interactions
 */
export const useOpenAI = (apiKey, backendUrl, sessionId) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Clear error
    const clearError = useCallback(() => {
        setError('');
    }, []);

    // Tokenize text
    const tokenize = useCallback(async(text) => {
        if (!text.trim()) {
            throw new Error('Text is required for tokenization');
        }

        setIsLoading(true);
        setError('');

        try {
            const tokens = await realTokenize(text, backendUrl, sessionId);
            return tokens;
        } catch (err) {
            const errorMessage = err.message || 'Failed to tokenize text';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, sessionId]);

    // Call OpenAI API
    const generateResponse = useCallback(async(prompt, onToken) => {
        if (!prompt.trim()) {
            throw new Error('Prompt is required');
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await callOpenAI(prompt, onToken, apiKey, backendUrl, sessionId);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Failed to generate response';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, backendUrl, sessionId]);

    // Generate multiple responses with different temperatures
    const generateTemperatureResponses = useCallback(async(prompt, temperatures = [0.1, 0.5, 0.7, 1.0, 1.5]) => {
        if (!prompt.trim()) {
            throw new Error('Prompt is required');
        }

        setIsLoading(true);
        setError('');

        try {
            const promises = temperatures.map(async(temperature) => {
                try {
                    const response = await callOpenAI(
                        prompt,
                        null, // No streaming for temperature comparison
                        apiKey,
                        backendUrl,
                        sessionId, { temperature, max_tokens: 300 }
                    );
                    return { temperature, response, error: null };
                } catch (error) {
                    return { temperature, response: null, error: error.message };
                }
            });

            const results = await Promise.all(promises);
            return results.reduce((acc, { temperature, response, error }) => {
                acc[temperature] = { response, error };
                return acc;
            }, {});
        } catch (err) {
            const errorMessage = err.message || 'Failed to generate temperature responses';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, backendUrl, sessionId]);

    return {
        isLoading,
        error,
        clearError,
        tokenize,
        generateResponse,
        generateTemperatureResponses,
    };
};