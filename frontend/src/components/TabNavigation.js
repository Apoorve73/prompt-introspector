import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab, className = '' }) => {
  const tabs = [
    { 
      id: 'introspector', 
      label: 'Token Introspector', 
      icon: '🔍',
      description: 'Analyze token processing in real-time'
    },
    { 
      id: 'temperature', 
      label: 'Temperature Comparison', 
      icon: '🌡️',
      description: 'Compare responses across different creativity levels'
    },
  ];

  return (
    <nav className={`tabs ${className}`} role="tablist" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          title={tab.description}
        >
          <span aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;
