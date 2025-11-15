 /**
  * PUBLIC_INTERFACE
  * Simple auth utilities backed by localStorage for prototyping.
  * Keys and shape are centralized here for consistency.
  */

export const AUTH_KEY = "bb_auth";

/**
 * Get current auth state from localStorage.
 * Returns: { isAuthenticated: boolean, user?: { id, name, role } } | null
 */
export function getAuthState() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set auth state to localStorage.
 */
export function setAuthState(state) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear auth state from localStorage.
 */
export function clearAuthState() {
  try {
    localStorage.removeItem(AUTH_KEY);
    return true;
  } catch {
    return false;
  }
}
