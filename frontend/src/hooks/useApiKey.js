import { useState, useEffect, useCallback } from 'react';
import { checkDefaultKey } from '../utils/api';

/**
 * Custom hook for managing API key state and validation
 */
export const useApiKey = backendUrl => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Check for default API key on mount
  useEffect(() => {
    const initializeApiKey = async () => {
      try {
        setIsValidating(true);
        const hasDefaultKey = await checkDefaultKey(backendUrl);
        if (hasDefaultKey) {
          setApiKey('***DEFAULT_KEY***');
        }
      } catch (error) {
        // console.log('No default API key available:', error.message);
      } finally {
        setIsValidating(false);
      }
    };

    if (backendUrl) {
      initializeApiKey();
    }
  }, [backendUrl]);

  // Validate API key format
  const validateApiKeyFormat = useCallback(key => {
    if (key === '***DEFAULT_KEY***') {
      return { isValid: true, error: '' };
    }

    if (!key.trim()) {
      return { isValid: false, error: 'API key is required' };
    }

    if (!key.startsWith('sk-')) {
      return { isValid: false, error: 'API key must start with "sk-"' };
    }

    if (key.length < 20) {
      return { isValid: false, error: 'API key must be at least 20 characters long' };
    }

    return { isValid: true, error: '' };
  }, []);

  // Update API key with validation
  const updateApiKey = useCallback(
    newKey => {
      const validation = validateApiKeyFormat(newKey);
      setValidationError(validation.error);
      setApiKey(newKey);
    },
    [validateApiKeyFormat]
  );

  // Check if current API key is valid
  const isApiKeyValid = useCallback(() => {
    return validateApiKeyFormat(apiKey).isValid;
  }, [apiKey, validateApiKeyFormat]);

  // Clear API key
  const clearApiKey = useCallback(() => {
    setApiKey('');
    setValidationError('');
  }, []);

  return {
    apiKey,
    setApiKey: updateApiKey,
    isValidating,
    validationError,
    isApiKeyValid: isApiKeyValid(),
    clearApiKey,
    hasDefaultKey: apiKey === '***DEFAULT_KEY***',
  };
};
