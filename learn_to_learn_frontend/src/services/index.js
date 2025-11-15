//
// PUBLIC_INTERFACE
// Service factory: returns domain services that use remote API when enabled,
// or fall back to localStorage mocks otherwise.
//

import { createApiClient } from "../api/client";
import { endpoints } from "../api/endpoints";
import {
  adaptUser,
  adaptCourse,
  adaptCategory,
  adaptEnrollment,
  adaptProgress,
  mapCategoryListFromDummyJSON,
  mapProductListFromDummyJSON,
  mapProductFromDummyJSON,
} from "../api/adapters/openapiAdapter";
import { storage } from "./storage";

function hasRemoteEnabled() {
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || "").toLowerCase();
  const base = process.env.REACT_APP_API_BASE || "";
  return Boolean(base) && flags.split(",").map((s) => s.trim()).includes("remote");
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
  // DummyJSON-backed implementation
  return {
    /**
     * list with options: { category, q, limit=20, skip=0 }
     * If q provided -> /products/search?q=...
     * Else if category provided -> /products/category/{category}?limit&skip
     * Else -> /products?limit&skip
     */
    async list(opts = {}) {
      const { category, q, limit = 20, skip = 0 } = opts || {};
      let payload;
      if (q && String(q).trim().length > 0) {
        payload = await api.get(`${endpoints.dummy.searchRoot}`, {
          query: { q: String(q).trim(), limit, skip, select: "id,title,description,price,thumbnail,rating,brand,category" },
        });
      } else if (category) {
        payload = await api.get(`${endpoints.dummy.categoryProductsRoot}/${encodeURIComponent(category)}`, {
          query: { limit, skip, select: "id,title,description,price,thumbnail,rating,brand,category" },
        });
      } else {
        payload = await api.get(`${endpoints.dummy.productsRoot}`, {
          query: { limit, skip, select: "id,title,description,price,thumbnail,rating,brand,category" },
        });
      }
      const mapped = mapProductListFromDummyJSON(payload);
      return mapped;
    },
    async get(id) {
      const data = await api.get(`${endpoints.dummy.productsRoot}/${encodeURIComponent(id)}`);
      return mapProductFromDummyJSON(data);
    },
    // keep create/update/remove as no-ops for DummyJSON (not supported)
    async create(payload) {
      return adaptCourse({ id: storage.genId("course"), ...payload });
    },
    async update(payload) {
      return adaptCourse(payload);
    },
    async remove(id) {
      return { id };
    },
  };
}

function remoteCategoriesService() {
  // DummyJSON-backed categories
  return {
    async list() {
      const arr = await api.get(endpoints.dummy.categories);
      return mapCategoryListFromDummyJSON(arr);
    },
    async get(id) {
      // DummyJSON has no category-by-id; emulate by searching list
      const arr = await api.get(endpoints.dummy.categories);
      const mapped = mapCategoryListFromDummyJSON(arr);
      return mapped.find((c) => String(c.id) === String(id)) || null;
    },
    async create(payload) {
      // Not supported remotely; return local-adapted
      return adaptCategory({ id: storage.genId("cat"), ...payload });
    },
    async update(payload) {
      return adaptCategory(payload);
    },
    async remove(id) {
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
  // Mock PATCH-like update via localStorage to persist progress per user
  const USER_KEY = (userId) => `bb_progress_${userId || "anon"}`;
  function readAll(userId) {
    try {
      const raw = localStorage.getItem(USER_KEY(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function writeAll(userId, arr) {
    try {
      localStorage.setItem(USER_KEY(userId), JSON.stringify(arr));
    } catch {
      // ignore
    }
  }
  function nowIso() {
    return new Date().toISOString();
  }

  return {
    async list({ userId } = {}) {
      return readAll(userId);
    },
    async get(id, { userId } = {}) {
      const arr = readAll(userId);
      return arr.find((x) => String(x.id) === String(id)) || null;
    },
    async create(payload = {}, { userId } = {}) {
      const arr = readAll(userId);
      const item = {
        id: payload.id || storage.genId("prog"),
        userId: userId || payload.userId || "anon",
        courseId: payload.courseId,
        percent: Number(payload.percent ?? 0),
        updatedAt: nowIso(),
      };
      arr.push(item);
      writeAll(userId || item.userId, arr);
      return item;
    },
    // PUBLIC_INTERFACE
    async update(payload = {}, { userId } = {}) {
      // payload can be either { id, percent } or { courseId, percent }
      const arr = readAll(userId);
      let idx = -1;
      if (payload.id) {
        idx = arr.findIndex((x) => String(x.id) === String(payload.id));
      } else if (payload.courseId) {
        idx = arr.findIndex((x) => String(x.courseId) === String(payload.courseId));
      }
      let item;
      if (idx >= 0) {
        item = { ...arr[idx], percent: Number(payload.percent ?? arr[idx].percent ?? 0), updatedAt: nowIso() };
        arr[idx] = item;
      } else {
        item = {
          id: storage.genId("prog"),
          userId: userId || payload.userId || "anon",
          courseId: payload.courseId,
          percent: Number(payload.percent ?? 0),
          updatedAt: nowIso(),
        };
        arr.push(item);
      }
      writeAll(userId || item.userId, arr);
      return item;
    },
    async remove(id, { userId } = {}) {
      const arr = readAll(userId);
      const next = arr.filter((x) => String(x.id) !== String(id));
      writeAll(userId, next);
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
