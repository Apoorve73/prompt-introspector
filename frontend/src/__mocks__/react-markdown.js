import React from 'react';

// Mock ReactMarkdown component for testing
const ReactMarkdown = ({ children, ...props }) => {
  return React.createElement('div', { ...props, 'data-testid': 'react-markdown' }, children);
};

export default ReactMarkdown;
