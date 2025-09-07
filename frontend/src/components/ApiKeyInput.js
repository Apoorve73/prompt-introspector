import React from 'react';
import { useApiKey } from '../hooks/useApiKey';

const ApiKeyInput = ({ 
  apiKey, 
  setApiKey, 
  isAnalyzing, 
  backendUrl,
  className = '' 
}) => {
  const { validationError, hasDefaultKey } = useApiKey(backendUrl);

  return (
    <div className={`card ${className}`}>
      <div className="card-body">
        <label className="font-bold text-base" style={{ marginBottom: 'var(--spacing-sm)' }}>
          OpenAI API Key:
        </label>
        
        {hasDefaultKey ? (
          <div className="alert alert-success">
            ✅ Using default API key from environment variables
          </div>
        ) : (
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isAnalyzing}
            placeholder="Enter your OpenAI API key (sk-...)"
            className={`input ${validationError ? 'border-red-500' : ''}`}
            aria-describedby={validationError ? 'api-key-error' : undefined}
          />
        )}

        {validationError && (
          <div id="api-key-error" className="alert alert-error" style={{ marginTop: 'var(--spacing-sm)' }}>
            {validationError}
          </div>
        )}

        <div className="text-sm text-gray-600" style={{ marginTop: 'var(--spacing-sm)' }}>
          <p style={{ margin: 'var(--spacing-xs) 0' }}>
            🚀 <strong>Backend Proxy:</strong> Uses secure backend server to call OpenAI API
          </p>
          <p style={{ margin: 'var(--spacing-xs) 0' }}>
            🔒 Your API key is securely handled by the backend proxy
          </p>
          <p style={{ margin: 'var(--spacing-xs) 0' }}>
            ⚡ <strong>Server:</strong> Make sure backend is running on port 3001
          </p>
          {hasDefaultKey && (
            <p style={{ margin: 'var(--spacing-xs) 0', color: 'var(--color-success)' }}>
              🌟 <strong>Default Key:</strong> Using API key from server environment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
