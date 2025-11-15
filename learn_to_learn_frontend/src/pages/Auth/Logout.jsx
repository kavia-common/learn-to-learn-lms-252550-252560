import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getServices } from "../../services";
import { logout as logoutAction } from "../../store/slices/authSlice";

/**
 * PUBLIC_INTERFACE
 * Logout page: performs logout via service (best effort), clears Redux auth, and redirects home.
 * Shows a short status message for screen readers while redirecting.
 */
function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { authService } = getServices();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await authService.logout();
      } catch {
        // ignore
      } finally {
        if (!alive) return;
        dispatch(logoutAction());
        navigate("/", { replace: true, state: { from: location.pathname } });
      }
    })();
    return () => {
      alive = false;
    };
  }, [dispatch, navigate, location, authService]);

  return (
    <div style={{ padding: 24, display: "grid", justifyItems: "center" }}>
      <div
        role="status"
        aria-live="polite"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius)",
          padding: 18,
          boxShadow: "var(--shadow-sm)",
          color: "var(--text-secondary)",
        }}
      >
        Signing you out…
      </div>
    </div>
  );
}

export default Logout;
