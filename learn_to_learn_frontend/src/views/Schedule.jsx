import React from "react";

/**
 * PUBLIC_INTERFACE
 * Schedule page for planning sessions.
 */
function Schedule() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Schedule</h2>
      <p className="card-desc">Plan study sessions and set reminders.</p>
      <div className="cards" style={{ marginTop: 12 }}>
        <div className="card">
          <h3 className="card-title">Today</h3>
          <p className="card-desc">Review notes and practice problems.</p>
        </div>
        <div className="card">
          <h3 className="card-title">This Week</h3>
          <p className="card-desc">Complete module 2 and take quiz.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Upcoming</h3>
          <p className="card-desc">Workshop on productivity techniques.</p>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
