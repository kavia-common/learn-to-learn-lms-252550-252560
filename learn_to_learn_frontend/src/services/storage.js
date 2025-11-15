//
// PUBLIC_INTERFACE
// Minimal localStorage-backed mock database for prototyping offline/local mode.
//

const KEYS = {
  users: "bb_users",
  courses: "bb_courses",
  categories: "bb_categories",
  enrollments: "bb_enrollments",
  progress: "bb_progress",
};

function read(key, def = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function genId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// PUBLIC_INTERFACE
export const storage = {
  KEYS,
  read,
  write,
  genId,
};
