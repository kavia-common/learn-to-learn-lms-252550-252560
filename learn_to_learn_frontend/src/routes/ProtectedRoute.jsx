import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute gates child content behind an authentication check.
 * For this implementation, authentication status is read from Redux store (auth slice).
 *
 * Behavior:
 * - If not hydrated yet, remain conservative and redirect to "/auth/login" (rare on SPA mount).
 * - If not authenticated, redirects to "/auth/login" with state to return after login.
 * - If authenticated, renders its children.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, hydrated } = useSelector((s) => s.auth);

  if (!hydrated) {
    // Until hydration completes, block protected content to avoid flicker.
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default ProtectedRoute;
