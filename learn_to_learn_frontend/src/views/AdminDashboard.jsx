import React from "react";

/**
 * PUBLIC_INTERFACE
 * Admin dashboard for managing courses, users, and analytics.
 */
function AdminDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Admin Panel</h2>
      <p className="card-desc">Manage courses, users, and review platform analytics.</p>
      <div className="cards" style={{ marginTop: 12 }}>
        <div className="card">
          <h3 className="card-title">Courses</h3>
          <p className="card-desc">Create and curate learning tracks and modules.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Users</h3>
          <p className="card-desc">View and manage learner accounts and roles.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Reports</h3>
          <p className="card-desc">Export insights on engagement and outcomes.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
