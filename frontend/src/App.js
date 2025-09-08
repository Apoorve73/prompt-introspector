import React, { useState, useCallback } from 'react';
import config from './config.js';
import { APP_CONFIG } from './utils/constants.js';
import { useApiKey } from './hooks/useApiKey.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import TabNavigation from './components/TabNavigation.js';
import ApiKeyInput from './components/ApiKeyInput.js';
import TokenIntrospector from './components/TokenIntrospector.js';
import TemperatureComparison from './components/TemperatureComparison.js';
import './styles/globals.css';
import './styles/components.css';

const PromptIntrospector = () => {
  // State management
  const [activeTab, setActiveTab] = useState('introspector');
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);
  const [backendUrl] = useState(() => config.apiBaseUrl);

  // Use custom hook for API key management
  const { apiKey, setApiKey, validationError } = useApiKey(backendUrl);

  // Memoized tab change handler
  const handleTabChange = useCallback(tabId => {
    setActiveTab(tabId);
  }, []);

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-white text-gray-900' style={{ padding: 'var(--spacing-xl)' }}>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <header className='text-center mb-8'>
            <h1 className='text-4xl font-bold mb-2'>{APP_CONFIG.TITLE}</h1>
            <p className='text-lg text-gray-600'>{APP_CONFIG.SUBTITLE}</p>
          </header>

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} className='mb-8' />

          {/* API Key Input */}
          <ApiKeyInput
            apiKey={apiKey}
            setApiKey={setApiKey}
            isAnalyzing={false}
            backendUrl={backendUrl}
            className='mb-8'
          />

          {/* Error Display */}
          {validationError && <div className='alert alert-error mb-8'>{validationError}</div>}

          {/* Main Content */}
          <main role='main'>
            {activeTab === 'introspector' && (
              <div role='tabpanel' id='tabpanel-introspector' aria-labelledby='tab-introspector'>
                <ErrorBoundary>
                  <TokenIntrospector
                    apiKey={apiKey}
                    backendUrl={backendUrl}
                    sessionId={sessionId}
                  />
                </ErrorBoundary>
              </div>
            )}

            {activeTab === 'temperature' && (
              <div role='tabpanel' id='tabpanel-temperature' aria-labelledby='tab-temperature'>
                <ErrorBoundary>
                  <TemperatureComparison
                    apiKey={apiKey}
                    backendUrl={backendUrl}
                    sessionId={sessionId}
                  />
                </ErrorBoundary>
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PromptIntrospector;
