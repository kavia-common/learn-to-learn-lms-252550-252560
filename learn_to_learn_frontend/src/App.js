import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppRouter from './routes/AppRouter';
import Footer from './components/Footer';

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
      <header className="gradient-bg">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
      </header>
      <main style={{ display: 'flex', alignItems: 'stretch', minHeight: 'calc(100vh - 64px)' }}>
        <Sidebar />
        <section style={{ flex: 1, background: 'var(--bg-primary)' }}>
          <AppRouter />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
