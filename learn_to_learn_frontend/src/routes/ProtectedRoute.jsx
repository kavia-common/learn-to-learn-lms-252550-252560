import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute gates child content behind an authentication check.
 * For this prototype, authentication status is read from localStorage key "bb_auth".
 * Expected shape:
 *   {
 *     "isAuthenticated": boolean,
 *     "user": { "id": string, "name": string, "role": "user" | "admin" }
 *   }
 *
 * Behavior:
 * - If not authenticated, redirects to "/" with state to return after login.
 * - If authenticated, renders its children.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();

  let isAuthed = false;
  try {
    const stateRaw = localStorage.getItem("bb_auth");
    if (stateRaw) {
      const state = JSON.parse(stateRaw);
      isAuthed = !!state?.isAuthenticated;
    }
  } catch {
    isAuthed = false;
  }

  if (!isAuthed) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default ProtectedRoute;
