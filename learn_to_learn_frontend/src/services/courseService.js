//
// Courses service: fetch courses from Strapi and map to LMS course model
//

import { api, isFeatureEnabled } from '../api/client';
import { mapToCuratedCategory } from './categoryService';

function pickFirstText(...vals) {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function extractImageUrl(attributes) {
  const img =
    attributes?.thumbnail?.data?.attributes ||
    attributes?.cover?.data?.attributes ||
    attributes?.image?.data?.attributes ||
    null;
  if (img?.url) return img.url.startsWith('http') ? img.url : img.url;
  return null;
}

function extractPrice(attributes) {
  const price = attributes?.price ?? attributes?.cost ?? attributes?.amount;
  if (price == null) return null;
  const n = Number(price);
  return Number.isFinite(n) ? n : null;
}

function extractCategory(attributes) {
  // Try various potential fields
  const raw =
    attributes?.category?.data?.attributes?.name ||
    attributes?.category ||
    (Array.isArray(attributes?.tags) ? attributes?.tags[0] : null) ||
    attributes?.type ||
    attributes?.slug ||
    attributes?.title;
  return mapToCuratedCategory(raw);
}

function mapStrapiItemToCourse(item) {
  const id = item?.id ?? item?._id ?? String(Math.random());
  const attrs = item?.attributes || {};
  const title = pickFirstText(attrs.title, attrs.name, `Course ${id}`);
  const description = pickFirstText(attrs.description, attrs.summary, attrs.content, '');
  const thumbnail = extractImageUrl(attrs);
  const price = extractPrice(attrs);
  const category = extractCategory(attrs);

  return {
    id: String(id),
    title,
    description,
    thumbnail,
    price,
    category: category || 'Programming & Development', // sensible default
    subcategory: null,

    // Enrollment/progress defaults (can be filled from remote if available)
    isEnrolled: false,
    progress: 0,
  };
}

async function fetchStrapiCourses({ category, signal } = {}) {
  const params = {
    populate: '*',
    pagination: { pageSize: 100 },
  };

  // Attempt server-side filter when we have recognizable category
  if (category && category !== 'All') {
    // We don't know the exact field on demo; try filtering by category name where possible
    // This may not work on demo; we keep client-side fallback if empty result.
    params.filters = {
      $or: [
        { category: { name: { $containsi: category } } },
        { category: { $containsi: category } },
        { tags: { name: { $containsi: category } } },
        { tags: { $containsi: category } },
        { type: { $containsi: category } },
      ],
    };
  }

  // Try products first
  try {
    const res = await api.get('/products', { params, signal });
    const data = res?.data || [];
    let mapped = data.map(mapStrapiItemToCourse);

    // If category specified, ensure client-side guard filter as fallback
    if (category && category !== 'All') {
      mapped = mapped.filter((c) => c.category === category);
    }

    // Initialize remote enrollment/progress if Strapi has such fields; otherwise keep defaults
    return mapped;
  } catch (e) {
    // Try articles as fallback
    try {
      const res = await api.get('/articles', { params, signal });
      const data = res?.data || [];
      let mapped = data.map(mapStrapiItemToCourse);
      if (category && category !== 'All') {
        mapped = mapped.filter((c) => c.category === category);
      }
      return mapped;
    } catch {
      return [];
    }
  }
}

// PUBLIC_INTERFACE
export async function getCourses({ category = 'All', signal } = {}) {
  /**
   * Get courses, using Strapi when 'remote' feature is enabled.
   * Falls back to empty list if remote unavailable (UI handles empty state).
   */
  const includeRemote = isFeatureEnabled('remote');
  if (!includeRemote) {
    // In local/mock mode we don't have built-in mocks here; return empty to let UI show EmptyState.
    return [];
  }
  const courses = await fetchStrapiCourses({ category, signal });
  return courses;
}
