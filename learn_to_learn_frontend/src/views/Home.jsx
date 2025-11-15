import React from "react";
import logo from "../logo.svg";
import "../App.css";

/**
 * PUBLIC_INTERFACE
 * Home landing page with CTA and intro content.
 */
function Home() {
  return (
    <div className="gradient-bg" style={{ paddingBottom: 24 }}>
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
          <a className="btn btn-outline" href="https://react.dev/">
            Learn React
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
