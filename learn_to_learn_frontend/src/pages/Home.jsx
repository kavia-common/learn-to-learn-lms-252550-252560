import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../logo.svg";
import "../App.css";

/**
 * PUBLIC_INTERFACE
 * New Home landing page under src/pages with BrainBoost branding.
 * Shows hero, CTA to Login/Register, and featured courses preview.
 */
function Home() {
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  return (
    <div className="gradient-bg" style={{ paddingBottom: 24 }}>
      <div className="hero" role="region" aria-label="BrainBoost hero">
        <img src={logo} className="App-logo" alt="BrainBoost logo" />
        <h1 className="title">Welcome to BrainBoost</h1>
        <p className="subtitle">
          Elevate your learning with focused tracks, smart scheduling, and clear insights.
        </p>
        <div className="cta-row">
          <Link
            className="btn btn-primary"
            to="/auth/login"
            state={{ from }}
            aria-label="Go to Login page"
          >
            Log In
          </Link>
          <Link className="btn btn-outline" to="/auth/register" aria-label="Go to Register page">
            Create Account
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="featured-courses-heading"
        style={{ padding: "0 24px", maxWidth: 980, margin: "0 auto" }}
      >
        <h2 id="featured-courses-heading" style={{ marginTop: 24, textAlign: "left" }}>
          Featured Courses
        </h2>
        <div className="cards" style={{ marginTop: "var(--space-3)" }}>
          <article className="card" aria-labelledby="fc1-title">
            <h3 className="card-title" id="fc1-title">
              Focus Fundamentals
            </h3>
            <p className="card-desc">
              Learn deep work, flow, and attention strategies to get more from each session.
            </p>
          </article>
          <article className="card" aria-labelledby="fc2-title">
            <h3 className="card-title" id="fc2-title">
              Spaced Repetition
            </h3>
            <p className="card-desc">
              A science-backed approach to long-term retention with smart intervals.
            </p>
          </article>
          <article className="card" aria-labelledby="fc3-title">
            <h3 className="card-title" id="fc3-title">
              Active Recall
            </h3>
            <p className="card-desc">
              Build strong memory traces using retrieval practice and self-testing.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Home;
