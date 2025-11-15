//
// Centralized API client for Strapi and feature flags
//
/* eslint-disable no-console */

// PUBLIC_INTERFACE
export function isFeatureEnabled(flag) {
  /** Determine if a feature flag is enabled via REACT_APP_FEATURE_FLAGS. */
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || '').split(',').map(f => f.trim().toLowerCase()).filter(Boolean);
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
 * Generic GET to Strapi
 */
async function strapiGet(path, { params, signal } = {}) {
  const base = getApiBase();
  const url = `${base}${path}${buildQuery(params)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Strapi request failed ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export const api = {
  /** GET wrapper for Strapi */
  get: strapiGet,
  /** Build query string for Strapi requests */
  buildQuery,
};
