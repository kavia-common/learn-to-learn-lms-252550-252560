import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * 404 page.
 */
function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Page Not Found</h2>
      <p className="card-desc">The page you are looking for doesn't exist.</p>
      <div style={{ marginTop: 16 }}>
        <Link className="btn btn-primary" to="/">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
