//
// PUBLIC_INTERFACE
// Service factory: returns domain services that use remote API when enabled,
// or fall back to localStorage mocks otherwise.
//

import { createApiClient } from "../api/client";
import { endpoints } from "../api/endpoints";
import { adaptUser, adaptCourse, adaptCategory, adaptEnrollment, adaptProgress } from "../api/adapters/openapiAdapter";
import { storage } from "./storage";

function hasRemoteEnabled() {
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || "").toLowerCase();
  const base = process.env.REACT_APP_API_BASE || "";
  return base && flags.split(",").map((s) => s.trim()).includes("remote");
}

const api = createApiClient({});

//
// Remote implementations
//
function remoteAuthService() {
  return {
    // PUBLIC_INTERFACE
    async login(credentials) {
      // Often returns token + user; here we simulate returning user shape
      const data = await api.post(endpoints.auth.login, credentials);
      const user = adaptUser(data?.user || data);
      return user;
    },
    // PUBLIC_INTERFACE
    async register(payload) {
      const data = await api.post(endpoints.auth.register, payload);
      const user = adaptUser(data?.user || data);
      return user;
    },
    // PUBLIC_INTERFACE
    async me() {
      const data = await api.get(endpoints.auth.me);
      return adaptUser(data);
    },
    // PUBLIC_INTERFACE
    async logout() {
      try {
        await api.post(endpoints.auth.logout);
      } catch {
        // ignore errors
      }
      return true;
    },
  };
}

function remoteUsersService() {
  return {
    // PUBLIC_INTERFACE
    async list() {
      const data = await api.get(endpoints.users.root);
      return Array.isArray(data) ? data.map(adaptUser) : [];
    },
    async get(id) {
      const data = await api.get(endpoints.users.byId(id));
      return adaptUser(data);
    },
    async create(payload) {
      const data = await api.post(endpoints.users.root, payload);
      return adaptUser(data);
    },
    async update(payload) {
      const { id, ...changes } = payload || {};
      const data = await api.put(endpoints.users.byId(id), changes);
      return adaptUser(data);
    },
    async remove(id) {
      await api.delete(endpoints.users.byId(id));
      return { id };
    },
  };
}

function remoteCoursesService() {
  return {
    async list() {
      const data = await api.get(endpoints.courses.root);
      return Array.isArray(data) ? data.map(adaptCourse) : [];
    },
    async get(id) {
      const data = await api.get(endpoints.courses.byId(id));
      return adaptCourse(data);
    },
    async create(payload) {
      const data = await api.post(endpoints.courses.root, payload);
      return adaptCourse(data);
    },
    async update(payload) {
      const { id, ...changes } = payload || {};
      const data = await api.put(endpoints.courses.byId(id), changes);
      return adaptCourse(data);
    },
    async remove(id) {
      await api.delete(endpoints.courses.byId(id));
      return { id };
    },
  };
}

function remoteCategoriesService() {
  return {
    async list() {
      const data = await api.get(endpoints.categories.root);
      return Array.isArray(data) ? data.map(adaptCategory) : [];
    },
    async get(id) {
      const data = await api.get(endpoints.categories.byId(id));
      return adaptCategory(data);
    },
    async create(payload) {
      const data = await api.post(endpoints.categories.root, payload);
      return adaptCategory(data);
    },
    async update(payload) {
      const { id, ...changes } = payload || {};
      const data = await api.put(endpoints.categories.byId(id), changes);
      return adaptCategory(data);
    },
    async remove(id) {
      await api.delete(endpoints.categories.byId(id));
      return { id };
    },
  };
}

function remoteEnrollmentsService() {
  return {
    async list() {
      const data = await api.get(endpoints.enrollments.root);
      return Array.isArray(data) ? data.map(adaptEnrollment) : [];
    },
    async get(id) {
      const data = await api.get(endpoints.enrollments.byId(id));
      return adaptEnrollment(data);
    },
    async create(payload) {
      const data = await api.post(endpoints.enrollments.root, payload);
      return adaptEnrollment(data);
    },
    async update(payload) {
      const { id, ...changes } = payload || {};
      const data = await api.put(endpoints.enrollments.byId(id), changes);
      return adaptEnrollment(data);
    },
    async remove(id) {
      await api.delete(endpoints.enrollments.byId(id));
      return { id };
    },
  };
}

function remoteProgressService() {
  return {
    async list() {
      const data = await api.get(endpoints.progress.root);
      return Array.isArray(data) ? data.map(adaptProgress) : [];
    },
    async get(id) {
      const data = await api.get(endpoints.progress.byId(id));
      return adaptProgress(data);
    },
    async create(payload) {
      const data = await api.post(endpoints.progress.root, payload);
      return adaptProgress(data);
    },
    async update(payload) {
      const { id, ...changes } = payload || {};
      const data = await api.put(endpoints.progress.byId(id), changes);
      return adaptProgress(data);
    },
    async remove(id) {
      await api.delete(endpoints.progress.byId(id));
      return { id };
    },
  };
}

//
// Local (mock) implementations using localStorage
//
function localCrud(key, adapt, prefix) {
  return {
    async list() {
      const arr = storage.read(key, []);
      return arr.map(adapt);
    },
    async get(id) {
      const arr = storage.read(key, []);
      const found = arr.find((x) => String(x.id) === String(id)) || null;
      return found ? adapt(found) : { id };
    },
    async create(payload) {
      const arr = storage.read(key, []);
      const item = { id: storage.genId(prefix), ...payload };
      arr.push(item);
      storage.write(key, arr);
      return adapt(item);
    },
    async update(payload) {
      const arr = storage.read(key, []);
      const idx = arr.findIndex((x) => String(x.id) === String(payload.id));
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...payload };
        storage.write(key, arr);
        return adapt(arr[idx]);
      }
      // If not found, create (upsert)
      const item = { id: payload.id ?? storage.genId(prefix), ...payload };
      arr.push(item);
      storage.write(key, arr);
      return adapt(item);
    },
    async remove(id) {
      const arr = storage.read(key, []);
      const next = arr.filter((x) => String(x.id) !== String(id));
      storage.write(key, next);
      return { id };
    },
  };
}

function localAuthService() {
  // For prototype: simply echo back a "user" with role, and rely on auth slice
  return {
    async login(credentials) {
      return {
        id: storage.genId("user"),
        name: credentials?.name ?? "Learner",
        role: credentials?.role ?? "user",
      };
    },
    async register(payload) {
      return {
        id: storage.genId("user"),
        name: payload?.name ?? "Learner",
        role: payload?.role ?? "user",
      };
    },
    async me() {
      return {
        id: "u_local",
        name: "Local User",
        role: "user",
      };
    },
    async logout() {
      return true;
    },
  };
}

// Domain local services
const localUsersService = () => localCrud(storage.KEYS.users, (x) => x, "user");
const localCoursesService = () => localCrud(storage.KEYS.courses, (x) => x, "course");
const localCategoriesService = () => localCrud(storage.KEYS.categories, (x) => x, "cat");
const localEnrollmentsService = () => localCrud(storage.KEYS.enrollments, (x) => x, "enr");
const localProgressService = () => localCrud(storage.KEYS.progress, (x) => x, "prog");

// PUBLIC_INTERFACE
export function getServices() {
  if (hasRemoteEnabled()) {
    return {
      authService: remoteAuthService(),
      usersService: remoteUsersService(),
      coursesService: remoteCoursesService(),
      categoriesService: remoteCategoriesService(),
      enrollmentsService: remoteEnrollmentsService(),
      progressService: remoteProgressService(),
    };
  }
  return {
    authService: localAuthService(),
    usersService: localUsersService(),
    coursesService: localCoursesService(),
    categoriesService: localCategoriesService(),
    enrollmentsService: localEnrollmentsService(),
    progressService: localProgressService(),
  };
}
