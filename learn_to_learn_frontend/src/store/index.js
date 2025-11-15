import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import coursesReducer from "./slices/coursesSlice";
import usersReducer from "./slices/usersSlice";
import categoriesReducer from "./slices/categoriesSlice";
import enrollmentsReducer from "./slices/enrollmentsSlice";
import progressReducer from "./slices/progressSlice";

/**
 * Create and export the Redux store for the BrainBoost LMS frontend.
 * - Registers the auth slice + domain slices (courses, users, categories, enrollments, progress)
 * - Disables serializableCheck for localStorage payload convenience
 * - Exposes a PUBLIC_INTERFACE helper to create store (useful for tests)
 */

// PUBLIC_INTERFACE
export function createAppStore(preloadedState) {
  /** Create store with optional preloaded state */
  return configureStore({
    reducer: {
      auth: authReducer,
      courses: coursesReducer,
      users: usersReducer,
      categories: categoriesReducer,
      enrollments: enrollmentsReducer,
      progress: progressReducer,
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
