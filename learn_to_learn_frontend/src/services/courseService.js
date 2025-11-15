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
  if (img?.url) return img.url;
  return null;
}

function extractPrice(attributes) {
  const price = attributes?.price ?? attributes?.cost ?? attributes?.amount;
  if (price == null) return null;
  const n = Number(price);
  return Number.isFinite(n) ? n : null;
}

function extractCategoryObj(attributes) {
  // Try relational category first
  const rel = attributes?.category?.data;
  if (rel?.id) {
    const name = rel?.attributes?.name || rel?.attributes?.title || rel?.attributes?.slug || '';
    return { id: Number(rel.id), name, slug: rel?.attributes?.slug || null };
  }
  // Fallback mapping to curated label when numeric id isn't available
  const raw =
    attributes?.category ||
    (Array.isArray(attributes?.tags) ? attributes?.tags[0] : null) ||
    attributes?.type ||
    attributes?.slug ||
    attributes?.title;
  const curated = mapToCuratedCategory(raw);
  return curated ? { id: null, name: curated, slug: null } : { id: null, name: null, slug: null };
}

function extractTags(attributes) {
  // Support both array of strings and relation array with attributes.name
  const tags = attributes?.tags;
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .map((t) => {
        if (typeof t === 'string') return t;
        const a = t?.attributes ?? t ?? {};
        return a.name || a.title || a.slug || null;
      })
      .filter(Boolean)
      .map((s) => String(s));
  }
  // Strapi relation object form: { data: [{ attributes: { name } }]}
  const rel = tags?.data;
  if (Array.isArray(rel)) {
    return rel
      .map((t) => t?.attributes?.name || t?.attributes?.title || t?.attributes?.slug || null)
      .filter(Boolean)
      .map((s) => String(s));
  }
  return [];
}

function extractLevel(attributes) {
  const levelRel = attributes?.level?.data;
  if (levelRel?.attributes?.name) return String(levelRel.attributes.name);
  const lvl = attributes?.level || attributes?.difficulty || attributes?.experience;
  if (!lvl) return null;
  const s = String(lvl).toLowerCase();
  if (s.includes('beginner')) return 'Beginner';
  if (s.includes('intermediate')) return 'Intermediate';
  if (s.includes('advanced')) return 'Advanced';
  return String(lvl);
}

function extractLanguage(attributes) {
  const langRel = attributes?.language?.data;
  if (langRel?.attributes?.code) return String(langRel.attributes.code);
  const lang = attributes?.language || attributes?.locale || attributes?.lang;
  return lang ? String(lang) : null;
}

function mapStrapiItemToCourse(item) {
  const id = item?.id ?? item?._id ?? String(Math.random());
  const attrs = item?.attributes || {};
  const title = pickFirstText(attrs.title, attrs.name, `Course ${id}`);
  const description = pickFirstText(attrs.description, attrs.summary, attrs.content, '');
  const thumbnail = extractImageUrl(attrs);
  const price = extractPrice(attrs);
  const categoryObj = extractCategoryObj(attrs);

  return {
    id: String(id),
    title,
    description,
    thumbnail,
    price,
    // Fields requested by requirements
    level: extractLevel(attrs),
    category: categoryObj.id ?? null, // numeric id per API spec when available
    categoryName: categoryObj.name || null, // keep for display when id isn't provided
    language: extractLanguage(attrs),
    tags: extractTags(attrs),

    // Enrollment/progress defaults
    isEnrolled: false,
    progress: 0,
  };
}

async function fetchStrapiCourses({ signal } = {}) {
  const params = {
    populate: '*',
    pagination: { pageSize: 100 },
  };

  // Prefer a generic 'courses' collection when available
  try {
    const res = await api.get('/courses', { params, signal });
    const data = res?.data || [];
    return data.map(mapStrapiItemToCourse);
  } catch (e) {
    // Try products as fallback
    try {
      const res = await api.get('/products', { params, signal });
      const data = res?.data || [];
      return data.map(mapStrapiItemToCourse);
    } catch (e2) {
      // Try articles as last resort
      try {
        const res = await api.get('/articles', { params, signal });
        const data = res?.data || [];
        return data.map(mapStrapiItemToCourse);
      } catch {
        return [];
      }
    }
  }
}

// PUBLIC_INTERFACE
export async function getCourses({ signal } = {}) {
  /**
   * Get courses, using Strapi when 'remote' feature is enabled.
   * Return array of {id,title,description,level,category,language,thumbnail,tags?:[]}
   */
  const includeRemote = isFeatureEnabled('remote');
  if (!includeRemote) {
    return [];
  }
  const courses = await fetchStrapiCourses({ signal });
  return courses;
}
