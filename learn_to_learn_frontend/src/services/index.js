/*
// Service exports and compatibility factory
*/

export * as storage from './storage';
export * from './categoryService';
export * from './courseService';
export { authService } from './authService';

// PUBLIC_INTERFACE
export function getServices() {
  /**
   * Compatibility factory used elsewhere in the app.
   * Returns minimal services used by views without altering legacy callers.
   */
  // Lazy import to avoid circular deps
  const category = require('./categoryService');
  const course = require('./courseService');
  const auth = require('./authService');

  return {
    // PUBLIC_INTERFACE
    categoriesService: {
      /** Get curated categories using Strapi (when remote enabled) with fallback */
      list: async (opts = {}) => {
        const res = await category.getCategories(opts);
        return res;
      },
    },
    // PUBLIC_INTERFACE
    coursesService: {
      /** Get courses, optionally filtered by category */
      list: async (opts = {}) => {
        const res = await course.getCourses(opts);
        return res;
      },
    },
    // PUBLIC_INTERFACE
    authService: auth.authService,
  };
}
