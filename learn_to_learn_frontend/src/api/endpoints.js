//
// PUBLIC_INTERFACE
// Centralized endpoint path declarations for BrainBoost LMS domains.
// These are relative paths; the client will prepend REACT_APP_API_BASE.
//

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
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
