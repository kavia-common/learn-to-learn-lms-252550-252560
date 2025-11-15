/**
// Centralized API client for Strapi and feature flags with robust POST helpers and timeouts
*/
 /* eslint-disable no-console */

const DEFAULT_TIMEOUT_MS = 15000;

// PUBLIC_INTERFACE
export function isFeatureEnabled(flag) {
  /** Determine if a feature flag is enabled via REACT_APP_FEATURE_FLAGS. */
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || '')
    .split(',')
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);
  return flags.includes(flag.toLowerCase());
}

// PUBLIC_INTERFACE
export const getApiBase = () => {
  /** Get API base URL from env with fallback to Strapi demo. */
  return process.env.REACT_APP_API_BASE || 'https://demo.strapi.io/api';
};

/**
 * Build Strapi query string from params object.
 * Supports nested objects for filters and populate.
 */
function buildQuery(params = {}) {
  const query = new URLSearchParams();

  const appendParam = (prefix, value) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => appendParam(`${prefix}[]`, v));
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => appendParam(`${prefix}[${k}]`, v));
    } else {
      query.append(prefix, String(value));
    }
  };

  Object.entries(params).forEach(([key, value]) => appendParam(key, value));
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Internal helper to apply timeout to fetch requests.
 */
function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS, controller) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      if (controller) controller.abort();
      reject(new Error('Request timed out'));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Build default CORS-safe fetch options (no credentials by default).
 */
function baseOptions(extra = {}) {
  return {
    mode: 'cors',
    cache: 'no-store',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    ...extra,
  };
}

/**
 * Normalize error message from fetch response.
 */
async function normalizeError(res) {
  const status = res.status;
  let message = res.statusText || 'Request failed';
  try {
    const data = await res.json();
    // Strapi error shape: { error: { message, status, details, name } }
    if (data?.error?.message) {
      message = data.error.message;
    } else if (data?.message) {
      message = Array.isArray(data.message) ? data.message.join(' ') : data.message;
    }
  } catch {
    // ignore JSON parse
  }
  return new Error(`${message} (${status})`);
}

/**
 * Generic GET to Strapi
 */
async function strapiGet(path, { params, signal, timeoutMs } = {}) {
  const base = getApiBase();
  const url = `${base}${path}${buildQuery(params)}`;
  const ctrl = new AbortController();
  const combinedSignal = signal
    ? new AbortController()
    : null;
  // If caller provided a signal, ensure abort if either aborts
  if (combinedSignal && signal) {
    signal.addEventListener('abort', () => combinedSignal.abort());
  }
  const res = await withTimeout(
    fetch(url, baseOptions({ method: 'GET', headers: { Accept: 'application/json' }, signal: ctrl.signal })),
    timeoutMs || DEFAULT_TIMEOUT_MS,
    ctrl
  );
  if (!res.ok) {
    throw await normalizeError(res);
  }
  return res.json();
}

/**
 * Generic POST with JSON body
 */
async function jsonPost(path, body, { headers = {}, signal, timeoutMs, authToken } = {}) {
  const base = getApiBase();
  const url = `${base}${path}`;
  const ctrl = new AbortController();
  const mergedHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };
  if (authToken) {
    mergedHeaders.Authorization = `Bearer ${authToken}`;
  }

  const res = await withTimeout(
    fetch(url, baseOptions({ method: 'POST', headers: mergedHeaders, body: JSON.stringify(body ?? {}), signal: ctrl.signal })),
    timeoutMs || DEFAULT_TIMEOUT_MS,
    ctrl
  );

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore non-JSON
  }

  if (!res.ok) {
    // Prefer Strapi error message when present
    const err = await normalizeError(res);
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export const api = {
  /** GET wrapper for Strapi */
  get: strapiGet,
  /** Build query string for Strapi requests */
  buildQuery,
  /** Low-level POST (JSON) */
  jsonPost,
  /** Alias for jsonPost */
  post: jsonPost,
};
