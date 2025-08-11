
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './csp.js';

// Performance monitoring
import { performanceMonitor } from './utils/performance';

// Ensure React is available globally for JSX
if (typeof window !== 'undefined') {
  window.React = React;
}

// Create root and render app with error handling
try {
  performanceMonitor.startTimer('app-initialization');
  const root = createRoot(document.getElementById("root"));
  root.render(<App />);
  performanceMonitor.endTimer('app-initialization');
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback error display
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Something went wrong</h1>
        <p>Failed to load the application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin: 10px;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
