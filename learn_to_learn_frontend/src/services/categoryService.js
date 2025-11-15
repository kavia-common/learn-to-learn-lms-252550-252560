//
// Category service: fetch from Strapi and map to curated taxonomy with fallback
//

import localTaxonomy from '../data/categoryTaxonomy.json';
import { api, isFeatureEnabled } from '../api/client';

// Curated main categories we want to surface
const CURATED_CATEGORIES = [
  'Programming & Development',
  'Data & AI',
  'Business & Management',
  'Design & Creativity',
  'IT & Software',
  'Personal Development',
  'Language Learning',
  'School & Academic',
];

// Map various incoming category names/slugs to curated labels
const CATEGORY_MAPPING = {
  // Programming & Development
  programming: 'Programming & Development',
  development: 'Programming & Development',
  'web-development': 'Programming & Development',
  'software-development': 'Programming & Development',
  coding: 'Programming & Development',
  'programming-development': 'Programming & Development',

  // Data & AI
  data: 'Data & AI',
  'data-science': 'Data & AI',
  ai: 'Data & AI',
  'machine-learning': 'Data & AI',
  'data-ai': 'Data & AI',

  // Business & Management
  business: 'Business & Management',
  management: 'Business & Management',
  leadership: 'Business & Management',
  'business-management': 'Business & Management',

  // Design & Creativity
  design: 'Design & Creativity',
  creativity: 'Design & Creativity',
  'graphic-design': 'Design & Creativity',
  'ui-ux': 'Design & Creativity',

  // IT & Software
  it: 'IT & Software',
  'it-software': 'IT & Software',
  software: 'IT & Software',
  networking: 'IT & Software',
  devops: 'IT & Software',
  security: 'IT & Software',

  // Personal Development
  personal: 'Personal Development',
  'personal-development': 'Personal Development',
  productivity: 'Personal Development',
  mindfulness: 'Personal Development',
  wellness: 'Personal Development',

  // Language Learning
  language: 'Language Learning',
  'language-learning': 'Language Learning',
  english: 'Language Learning',
  spanish: 'Language Learning',
  french: 'Language Learning',

  // School & Academic
  academic: 'School & Academic',
  school: 'School & Academic',
  science: 'School & Academic',
  math: 'School & Academic',
  history: 'School & Academic',
};

// PUBLIC_INTERFACE
export function mapToCuratedCategory(nameOrSlug) {
  /** Map any raw category name/slug from Strapi to curated label. */
  if (!nameOrSlug) return null;
  const key = String(nameOrSlug).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return CATEGORY_MAPPING[key] || null;
}

function dedupeSort(list) {
  const set = new Set(list.filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

// Attempt to derive categories from Strapi products/articles when categories are not directly available
async function fetchDerivedCategoriesFromContent({ signal } = {}) {
  try {
    // Try products first (populate category-like fields if present)
    const productsRes = await api.get('/products', {
      params: { populate: '*', pagination: { pageSize: 100 } },
      signal,
    });
    const items = productsRes?.data || [];
    const mapped = items
      .map((it) => {
        const attrs = it?.attributes || {};
        // Use category, tags, or type fields as hints
        const raw =
          attrs.category?.data?.attributes?.name ||
          attrs.category ||
          (Array.isArray(attrs.tags) ? attrs.tags[0] : null) ||
          attrs.type ||
          attrs.slug ||
          attrs.title;
        return mapToCuratedCategory(raw);
      })
      .filter(Boolean);
    return dedupeSort(mapped);
  } catch (e) {
    // Try articles as fallback
    try {
      const articlesRes = await api.get('/articles', {
        params: { populate: '*', pagination: { pageSize: 100 } },
        signal,
      });
      const items = articlesRes?.data || [];
      const mapped = items
        .map((it) => {
          const attrs = it?.attributes || {};
          const raw =
            attrs.category?.data?.attributes?.name ||
            attrs.category ||
            (Array.isArray(attrs.tags) ? attrs.tags[0] : null) ||
            attrs.slug ||
            attrs.title;
          return mapToCuratedCategory(raw);
        })
        .filter(Boolean);
      return dedupeSort(mapped);
    } catch {
      return [];
    }
  }
}

async function fetchStrapiCategories({ signal } = {}) {
  // Many Strapi demos don't have a categories collection; attempt to fetch if present.
  try {
    const res = await api.get('/categories', {
      params: { pagination: { pageSize: 100 } },
      signal,
    });
    const items = res?.data || [];
    const mapped = items
      .map((c) => {
        const attrs = c?.attributes || {};
        const raw = attrs.name || attrs.slug || attrs.title;
        return mapToCuratedCategory(raw);
      })
      .filter(Boolean);
    return dedupeSort(mapped);
  } catch {
    // Fall back to deriving from content
    return fetchDerivedCategoriesFromContent({ signal });
  }
}

function fallbackLocalCategories() {
  // Use curated list and also map any local taxonomy hints into curated labels
  const hints = (localTaxonomy?.main || []).map((n) => mapToCuratedCategory(n) || null);
  const merged = [...CURATED_CATEGORIES, ...hints];
  return dedupeSort(merged);
}

// PUBLIC_INTERFACE
export async function getCategories({ signal } = {}) {
  /**
   * Get curated categories, primarily from Strapi when 'remote' feature is enabled.
   * Fallback to local taxonomy when remote disabled or unavailable.
   */
  const includeRemote = isFeatureEnabled('remote');
  if (!includeRemote) {
    return ['All', ...fallbackLocalCategories()];
  }

  try {
    const cats = await fetchStrapiCategories({ signal });
    const finalList = cats.length > 0 ? cats : fallbackLocalCategories();
    // Ensure 'All' is present only once and at the start
    return ['All', ...finalList.filter((c) => c !== 'All')];
  } catch (err) {
    console.warn('Remote categories failed, using fallback:', err?.message || err);
    return ['All', ...fallbackLocalCategories()];
  }
}
