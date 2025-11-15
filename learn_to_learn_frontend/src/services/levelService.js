//
// Level service: fetch level options from API with fallback
//

import { api, isFeatureEnabled } from '../api/client';

/**
 * Default level options when API endpoint is absent.
 */
export const DEFAULT_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

/**
 * Normalize a level string (trim and title-case the known values).
 */
function normalizeLevel(value) {
  if (!value) return null;
  const s = String(value).trim();
  const lower = s.toLowerCase();
  if (lower.includes('beginner')) return 'Beginner';
  if (lower.includes('intermediate')) return 'Intermediate';
  if (lower.includes('advanced')) return 'Advanced';
  // Fallback: capitalize first letter
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function uniqueList(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const k = (v || '').toString();
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

// PUBLIC_INTERFACE
export async function getLevels({ signal } = {}) {
  /** Fetch levels from /levels; on 404 or empty, fallback to defaults. */
  const includeRemote = isFeatureEnabled('remote');
  if (!includeRemote) {
    return ['All', ...DEFAULT_LEVELS];
  }

  try {
    const res = await api.get('/levels', { signal });
    const items = res?.data ?? res ?? [];
    // Support both array of strings and array of objects with name/slug
    const levels = (Array.isArray(items) ? items : []).map((it) => {
      if (typeof it === 'string') return normalizeLevel(it);
      const attrs = it?.attributes ?? it ?? {};
      return normalizeLevel(attrs.name || attrs.title || attrs.slug);
    }).filter(Boolean);

    const final = levels.length ? uniqueList(levels) : DEFAULT_LEVELS;
    return ['All', ...final.filter((l) => l !== 'All')];
  } catch (e) {
    // 404 or network error -> fallback
    return ['All', ...DEFAULT_LEVELS];
  }
}
