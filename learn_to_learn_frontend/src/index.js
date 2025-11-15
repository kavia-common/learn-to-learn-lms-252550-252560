import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Set initial title for BrainBoost before React mounts (helps on slow loads)
if (typeof document !== 'undefined') {
  document.title = 'BrainBoost';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
