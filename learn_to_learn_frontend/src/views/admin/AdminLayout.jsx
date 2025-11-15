import React from "react";
import { NavLink, Outlet } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * AdminLayout provides a sub-navigation for admin pages and renders nested routes via <Outlet/>.
 */
function AdminLayout() {
  return (
    <div style={{ padding: 24, width: "100%" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Admin</h2>
          <p className="card-desc" style={{ marginTop: 4 }}>Manage platform content and users</p>
        </div>
        <nav aria-label="Admin sections" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <NavLink to="/admin" end className="btn btn-outline">Overview</NavLink>
          <NavLink to="/admin/courses" className="btn btn-outline">Courses</NavLink>
          <NavLink to="/admin/users" className="btn btn-outline">Users</NavLink>
          <NavLink to="/admin/categories" className="btn btn-outline">Categories</NavLink>
        </nav>
      </header>
      <section style={{ marginTop: 16 }}>
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
