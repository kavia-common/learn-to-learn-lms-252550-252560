import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

/**
 * Create and export the Redux store for the BrainBoost LMS frontend.
 * - Registers the auth slice
 * - Disables serializableCheck for localStorage payload convenience
 * - Exposes a PUBLIC_INTERFACE helper to create store (useful for tests)
 */

// PUBLIC_INTERFACE
export function createAppStore(preloadedState) {
  /** Create store with optional preloaded state */
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

// Default store instance for app usage
const store = createAppStore();

export default store;
