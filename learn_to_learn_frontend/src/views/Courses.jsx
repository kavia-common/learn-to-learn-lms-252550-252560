import React from "react";

/**
 * PUBLIC_INTERFACE
 * Courses listing and categories.
 */
function Courses() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Courses</h2>
      <p className="card-desc">Browse your enrolled courses and categories.</p>
      <div className="cards" style={{ marginTop: 12 }}>
        <div className="card">
          <h3 className="card-title">Focused Learning</h3>
          <p className="card-desc">Deep work, spaced repetition, active recall.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Habits & Routines</h3>
          <p className="card-desc">Design routines and track habit formation.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Memory Techniques</h3>
          <p className="card-desc">Mnemonic devices and visualization skills.</p>
        </div>
      </div>
    </div>
  );
}

export default Courses;
