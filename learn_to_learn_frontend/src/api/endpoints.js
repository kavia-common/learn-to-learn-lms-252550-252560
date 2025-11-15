// PUBLIC_INTERFACE
// Centralized endpoint path declarations for BrainBoost LMS domains.
// These are relative paths; the client will prepend REACT_APP_API_BASE.

import { isFeatureEnabled } from './client';

const REMOTE = isFeatureEnabled('remote');

export const endpoints = {
  auth: {
    // Strapi demo API mapping when remote flag is enabled
    login: REMOTE ? "/auth/local" : "/auth/login",
    register: REMOTE ? "/auth/local/register" : "/auth/register",
    me: REMOTE ? "/users/me" : "/auth/me",
    logout: "/auth/logout",
  },
  users: {
    root: "/users",
    byId: (id) => `/users/${encodeURIComponent(id)}`,
  },
  courses: {
    root: "/courses",
    byId: (id) => `/courses/${encodeURIComponent(id)}`,
  },
  categories: {
    root: "/categories",
    byId: (id) => `/categories/${encodeURIComponent(id)}`,
  },
  enrollments: {
    root: "/enrollments",
    byId: (id) => `/enrollments/${encodeURIComponent(id)}`,
  },
  progress: {
    root: "/progress",
    byId: (id) => `/progress/${encodeURIComponent(id)}`,
  },
};
