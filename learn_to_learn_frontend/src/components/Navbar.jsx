import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../App.css";

/**
 * PUBLIC_INTERFACE
 * Navbar renders the top navigation bar with brand and quick links.
 * Includes a simple theme toggle button passed via props.
 */
function Navbar({ theme = "light", onToggleTheme }) {
  return (
    <div className="navbar">
      <div className="brand">
        <Link to="/" className="brand" style={{ textDecoration: "none" }} aria-label="Go to Home">
          <span className="brand-badge">BB</span>
          <span className="brand-text">BrainBoost</span>
        </Link>
      </div>
      <nav aria-label="Top" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <NavLink to="/dashboard" className="btn btn-outline">Dashboard</NavLink>
        <NavLink to="/catalog" className="btn btn-outline">Catalog</NavLink>
        <NavLink to="/enrollments" className="btn btn-outline">Enrollments</NavLink>
        <NavLink to="/progress" className="btn btn-outline">Progress</NavLink>
        <NavLink to="/courses" className="btn btn-outline">My Courses</NavLink>
        <NavLink to="/schedule" className="btn btn-outline">Schedule</NavLink>
        <NavLink to="/settings" className="btn btn-outline">Settings</NavLink>
        <NavLink to="/analytics" className="btn btn-outline">Analytics</NavLink>
        <NavLink to="/admin" className="btn btn-outline">Admin</NavLink>
        <NavLink to="/auth/login" className="btn btn-outline">Login</NavLink>
        <NavLink to="/auth/register" className="btn btn-outline">Register</NavLink>
        <NavLink to="/auth/logout" className="btn btn-outline">Logout</NavLink>
      </nav>
      <button
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
  );
}

export default Navbar;
