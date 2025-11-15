import React from "react";

/**
 * PUBLIC_INTERFACE
 * Analytics overview with simple content.
 */
function Analytics() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Analytics</h2>
      <p className="card-desc">Visualize your performance with actionable insights.</p>
      <div className="cards" style={{ marginTop: 12 }}>
        <div className="card">
          <h3 className="card-title">Completion</h3>
          <p className="card-desc">Overall 62% completed this month.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Consistency</h3>
          <p className="card-desc">You studied 5/7 days this week.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Focus</h3>
          <p className="card-desc">Average focus session 42 minutes.</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
