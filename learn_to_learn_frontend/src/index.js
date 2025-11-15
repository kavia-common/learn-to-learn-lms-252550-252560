import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import store from './store';
import { loadFromStorage } from './store/slices/authSlice';

// Set initial title for BrainBoost before React mounts (helps on slow loads)
if (typeof document !== 'undefined') {
  document.title = 'BrainBoost';
}

// Hydrate auth state from localStorage before rendering
store.dispatch(loadFromStorage());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
