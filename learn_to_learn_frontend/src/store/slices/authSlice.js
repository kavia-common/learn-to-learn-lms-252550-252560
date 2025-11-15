import { createSlice } from "@reduxjs/toolkit";

/**
 * AUTH SLICE
 * - Manages authentication state and current user details.
 * - Persists to localStorage under key "bb_auth".
 * - Provides PUBLIC_INTERFACE actions: login, register, logout, loadFromStorage.
 */

const AUTH_KEY = "bb_auth";

function readFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeToStorage(state) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  } catch {
    // ignore write failures
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore clear failures
  }
}

const initialState = {
  isAuthenticated: false,
  user: null, // { id, name, role }
  hydrated: false, // indicates state loaded from localStorage
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    loadFromStorage(state) {
      /** Hydrate auth state from localStorage on app init */
      const stored = readFromStorage();
      if (stored && typeof stored === "object") {
        state.isAuthenticated = !!stored.isAuthenticated;
        state.user = stored.user || null;
      }
      state.hydrated = true;
    },

    // PUBLIC_INTERFACE
    login(state, action) {
      /**
       * Log a user in.
       * Payload: { id: string, name: string, role: "user" | "admin" }
       */
      const user = action.payload || null;
      state.isAuthenticated = !!user;
      state.user = user;
      writeToStorage({ isAuthenticated: state.isAuthenticated, user });
    },

    // PUBLIC_INTERFACE
    register(state, action) {
      /**
       * Register a user (prototype).
       * Payload: { id, name, role }
       * Mirrors login behavior for this prototype.
       */
      const user = action.payload || null;
      state.isAuthenticated = !!user;
      state.user = user;
      writeToStorage({ isAuthenticated: state.isAuthenticated, user });
    },

    // PUBLIC_INTERFACE
    logout(state) {
      /** Log out user and clear persisted auth */
      state.isAuthenticated = false;
      state.user = null;
      clearStorage();
    },
  },
});

export const { loadFromStorage, login, register, logout } = authSlice.actions;

export default authSlice.reducer;
