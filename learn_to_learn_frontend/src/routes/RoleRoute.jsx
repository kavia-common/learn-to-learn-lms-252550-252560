import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * RoleRoute restricts access to users with one of the allowed roles.
 * Relies on localStorage "bb_auth" for current user role.
 *
 * Props:
 * - allowedRoles: string[] (e.g., ["admin"])
 *
 * Behavior:
 * - If user's role is not in allowedRoles, redirect to "/dashboard".
 */
function RoleRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  let role = null;
  try {
    const raw = localStorage.getItem("bb_auth");
    if (raw) {
      const state = JSON.parse(raw);
      role = state?.user?.role || null;
    }
  } catch {
    role = null;
  }

  if (!role || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
    // Send non-authorized users to their user dashboard if they are logged in, or home otherwise
    const fallback = localStorage.getItem("bb_auth") ? "/dashboard" : "/";
    return <Navigate to={fallback} replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RoleRoute;
