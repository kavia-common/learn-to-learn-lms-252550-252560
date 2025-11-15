import React, { useState } from "react";
import { EmptyState, Pagination, Modal } from "../components";

/**
 * PUBLIC_INTERFACE
 * Admin dashboard for managing courses, users, and analytics.
 * Demonstrates usage of EmptyState, Pagination and Modal components.
 */
function AdminDashboard() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Admin Panel</h2>
      <p className="card-desc">Manage courses, users, and review platform analytics.</p>
      <div className="cards" style={{ marginTop: 12 }}>
        <div className="card">
          <h3 className="card-title">Courses</h3>
          <p className="card-desc">Create and curate learning tracks and modules.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => setOpen(true)}>Create Course</button>
          </div>
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

      <div style={{ marginTop: 16 }}>
        <EmptyState
          title="No pending approvals"
          description="You're all caught up. New enrollments requiring approval will appear here."
          actions={<button className="btn btn-outline" onClick={() => setOpen(true)}>Open Modal</button>}
          icon={<span aria-hidden="true">✅</span>}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <Pagination page={page} pageSize={10} total={42} onPageChange={setPage} />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Course">
        <p className="card-desc" style={{ marginTop: 0 }}>
          This is a prototype dialog. Integrate with forms when services are ready.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="course-name" style={{ textAlign: "left", fontWeight: 600 }}>
            Course name
          </label>
          <input
            id="course-name"
            type="text"
            placeholder="Focus Fundamentals"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
