import React from "react";

/**
 * PUBLIC_INTERFACE
 * User dashboard overview.
 */
function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p className="card-desc">
        Quick glance at your courses, progress and upcoming sessions.
      </p>
      <div className="cards" style={{ marginTop: 12 }}>
        <div className="card">
          <h3 className="card-title">Progress</h3>
          <p className="card-desc">You have completed 4 of 10 modules this week.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Upcoming</h3>
          <p className="card-desc">Next session: Saturday 9:00 AM</p>
        </div>
        <div className="card">
          <h3 className="card-title">Recommendations</h3>
          <p className="card-desc">Revise "Memory Techniques" for mastery.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
