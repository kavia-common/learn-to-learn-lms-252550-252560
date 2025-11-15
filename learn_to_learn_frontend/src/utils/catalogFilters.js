/**
 * PUBLIC_INTERFACE
 * normalizeTaxonomy: safe-normalize a taxonomy array of { name, subcategories[] }.
 */
export function normalizeTaxonomy(input) {
  const items = Array.isArray(input) ? input : [];
  return items
    .map((c) => ({
      name: String(c?.name ?? "").trim(),
      subcategories: Array.isArray(c?.subcategories) ? c.subcategories.filter(Boolean).map(String) : [],
    }))
    .filter((c) => c.name.length > 0);
}

/**
 * PUBLIC_INTERFACE
 * applyCourseFilters filters a list of courses by selectedCategory and selectedSubcategory.
 * - Courses can have course.category and optional course.subcategory.
 * - If fields are missing, function degrades gracefully.
 */
export function applyCourseFilters(courses, selectedCategory, selectedSubcategory) {
  const list = Array.isArray(courses) ? courses : [];
  const cat = String(selectedCategory || "").trim();
  const sub = String(selectedSubcategory || "").trim();

  let out = list;
  if (cat) {
    out = out.filter((c) => String(c?.category || "").trim() === cat);
  }
  if (sub) {
    out = out.filter((c) => String(c?.subcategory || "").trim() === sub);
  }
  return out;
}
