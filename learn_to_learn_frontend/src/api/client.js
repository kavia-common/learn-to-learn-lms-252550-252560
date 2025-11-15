//
// PUBLIC_INTERFACE
// A small fetch-based HTTP client with base URL, timeout, retries, and JSON handling.
// Uses REACT_APP_API_BASE for remote calls. Safe for both remote and local mock usage.
//

const DEFAULT_TIMEOUT = 10000; // 10s
const DEFAULT_RETRIES = 2;

/**
 * Build a full URL from the base and path, safely handling slashes.
 */
function buildUrl(base, path) {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * Delay helper used for retry backoff.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if we should treat this error/status as retriable.
 */
function isRetriable(errorOrStatus) {
  if (typeof errorOrStatus === "number") {
    // Network-ish/server transient conditions
    return [408, 429, 500, 502, 503, 504].includes(errorOrStatus);
  }
  // Fetch/network error: often transient
  return true;
}

/**
 * Attempt a fetch with timeout. Aborts if timeout exceeded.
 */
async function fetchWithTimeout(resource, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Normalize response: parse JSON when possible, attach ok/status/headers.
 */
async function toJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }
  return {
    ok: res.ok,
    status: res.status,
    headers: res.headers,
    data,
  };
}

/**
 * PUBLIC_INTERFACE
 * Create an API client.
 * @param {Object} cfg
 * @param {string} cfg.baseUrl - Base URL for the API (from REACT_APP_API_BASE)
 * @param {number} cfg.timeoutMs - Per-request timeout in ms
 * @param {number} cfg.retries - Number of retries for transient failures
 */
export function createApiClient({
  baseUrl = process.env.REACT_APP_API_BASE || "",
  timeoutMs = DEFAULT_TIMEOUT,
  retries = DEFAULT_RETRIES,
} = {}) {
  /**
   * Build the final request with retries and JSON parsing.
   */
  async function request(path, { method = "GET", headers = {}, body, query } = {}) {
    const url = new URL(buildUrl(baseUrl, path), window.location.origin);
    if (query && typeof query === "object") {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }

    const opts = {
      method,
      headers: {
        "Accept": "application/json",
        ...headers,
      },
    };

    if (body !== undefined) {
      if (body instanceof FormData) {
        opts.body = body;
        // Let browser set multipart boundary
      } else if (typeof body === "string") {
        opts.body = body;
      } else {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
      }
    }

    let attempt = 0;
    let lastError = null;

    while (attempt <= retries) {
      try {
        const res = await fetchWithTimeout(url.toString(), opts, timeoutMs);
        const parsed = await toJsonResponse(res);
        if (!parsed.ok && isRetriable(parsed.status) && attempt < retries) {
          // Exponential backoff: 200ms, 400ms, etc.
          await sleep(200 * Math.pow(2, attempt));
          attempt += 1;
          continue;
        }
        if (!parsed.ok) {
          const error = new Error(`Request failed with status ${parsed.status}`);
          error.status = parsed.status;
          error.response = parsed;
          throw error;
        }
        return parsed.data;
      } catch (err) {
        lastError = err;
        // Retry only on network/abort or retriable statuses (already handled above)
        if (attempt < retries && isRetriable(err)) {
          await sleep(200 * Math.pow(2, attempt));
          attempt += 1;
          continue;
        }
        throw err;
      }
    }
    throw lastError || new Error("Request failed");
  }

  // PUBLIC_INTERFACE
  /** Simple convenience methods */
  return {
    get: (path, opts = {}) => request(path, { ...opts, method: "GET" }),
    post: (path, body, opts = {}) => request(path, { ...opts, method: "POST", body }),
    put: (path, body, opts = {}) => request(path, { ...opts, method: "PUT", body }),
    patch: (path, body, opts = {}) => request(path, { ...opts, method: "PATCH", body }),
    delete: (path, opts = {}) => request(path, { ...opts, method: "DELETE" }),
    request,
    baseUrl,
  };
}
