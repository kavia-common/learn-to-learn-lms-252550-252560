import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";

/**
 * PUBLIC_INTERFACE
 * Courses listing and categories.
 */
function Courses() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async load so Loader is visible briefly
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Courses</h2>
      <p className="card-desc">Browse your enrolled courses and categories.</p>

      {loading ? (
        <Loader label="Loading courses..." />
      ) : (
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
      )}
    </div>
  );
}

export default Courses;
