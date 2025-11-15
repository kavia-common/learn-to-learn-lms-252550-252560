import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  /** BrainBoost theme state (light/dark) */
  const [theme, setTheme] = useState('light');

  // Apply theme to document element and update page title
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.title = 'BrainBoost';
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <header className="App-header gradient-bg">
        <div className="navbar">
          <div className="brand">
            <span className="brand-badge">BB</span>
            <span className="brand-text">BrainBoost</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <div className="hero">
          <img src={logo} className="App-logo" alt="BrainBoost logo" />
          <h1 className="title">Welcome to BrainBoost</h1>
          <p className="subtitle">
            Elevate your learning with focused tracks, smart scheduling, and clear insights.
          </p>
          <div className="cta-row">
            <a
              className="btn btn-primary"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
            <button className="btn btn-outline" onClick={toggleTheme}>
              Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>
          <p className="description">
            Current theme: <strong>{theme}</strong>
          </p>
        </div>

        <section className="cards">
          <div className="card">
            <h3 className="card-title">Track Progress</h3>
            <p className="card-desc">Monitor course completion and category mastery at a glance.</p>
          </div>
          <div className="card">
            <h3 className="card-title">Smart Schedule</h3>
            <p className="card-desc">Plan sessions with adaptive reminders and pacing.</p>
          </div>
          <div className="card">
            <h3 className="card-title">Insights</h3>
            <p className="card-desc">Visualize performance with simple, actionable analytics.</p>
          </div>
        </section>
      </header>
    </div>
  );
}

export default App;
