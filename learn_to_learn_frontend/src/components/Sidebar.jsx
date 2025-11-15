import React from "react";
import { NavLink } from "react-router-dom";
import "../App.css";

/**
 * PUBLIC_INTERFACE
 * Sidebar renders a vertical navigation suitable for dashboard pages.
 */
function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        borderRight: "1px solid var(--border-color)",
        padding: 16,
        background: "var(--bg-elevated)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 12, color: "var(--text-secondary)" }}>
        Menu
      </div>
      <nav aria-label="Sidebar" style={{ display: "grid", gap: 8 }}>
        <NavLink to="/dashboard" className="btn btn-outline">Overview</NavLink>
        <NavLink to="/catalog" className="btn btn-outline">Catalog</NavLink>
        <NavLink to="/enrollments" className="btn btn-outline">Enrollments</NavLink>
        <NavLink to="/progress" className="btn btn-outline">Progress</NavLink>
        <NavLink to="/courses" className="btn btn-outline">My Courses</NavLink>
        <NavLink to="/schedule" className="btn btn-outline">Schedule</NavLink>
        <NavLink to="/settings" className="btn btn-outline">Settings</NavLink>
        <NavLink to="/analytics" className="btn btn-outline">Analytics</NavLink>
        <NavLink to="/admin" className="btn btn-outline">Admin</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
