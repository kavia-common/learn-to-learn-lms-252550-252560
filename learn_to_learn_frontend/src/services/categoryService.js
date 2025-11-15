/**
 * PUBLIC_INTERFACE
 * getCategoryTaxonomy fetches curated categories with subcategories.
 * - Tries backend `${REACT_APP_API_BASE}/categories/taxonomy` if REACT_APP_API_BASE is set.
 * - Falls back to local static JSON at src/data/categoryTaxonomy.json if backend is unavailable.
 * Returns an array of { name: string, subcategories: string[] }.
 */
export async function getCategoryTaxonomy() {
  const base = process.env.REACT_APP_API_BASE || "";
  const hasBase = Boolean(base);
  // Try backend first if configured
  if (hasBase) {
    try {
      const res = await fetch(`${base.replace(/\/+$/, "")}/categories/taxonomy`, {
        headers: { "Accept": "application/json" },
      });
      if (res && res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data?.categories) ? data.categories : (Array.isArray(data) ? data : []);
        if (Array.isArray(arr) && arr.length >= 1) {
          return normalizeTaxonomy(arr);
        }
      }
    } catch {
      // ignore and fallback to local
    }
  }
  // Fallback to local static JSON
  try {
    const taxonomy = await import("../data/categoryTaxonomy.json");
    const arr = Array.isArray(taxonomy?.default?.categories)
      ? taxonomy.default.categories
      : (Array.isArray(taxonomy?.categories) ? taxonomy.categories : []);
    return normalizeTaxonomy(arr);
  } catch {
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * normalizeTaxonomy ensures each entry has { name, subcategories[] } with safe defaults.
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
