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
 * - If user's role is not in allowedRoles, redirect to "/dashboard" if authenticated, else "/".
 */
function RoleRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const { user, isAuthenticated, hydrated } = useSelector((s) => s.auth);
  const role = user?.role || null;

  if (!hydrated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!role || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
    const fallback = isAuthenticated ? "/dashboard" : "/";
    return <Navigate to={fallback} replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RoleRoute;
