import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * PUBLIC_INTERFACE
 * RoleRoute restricts access to users with one of the allowed roles.
 *
 * Props:
 * - allowedRoles: string[] (e.g., ["admin"])
 *
 * Behavior:
 * - If not hydrated or not authenticated, redirect to "/auth/login".
 * - If user's role is not in allowedRoles, redirect to "/dashboard".
 */
function RoleRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const { user, isAuthenticated, hydrated } = useSelector((s) => s.auth);
  const role = user?.role || null;

  if (!hydrated || !isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RoleRoute;
