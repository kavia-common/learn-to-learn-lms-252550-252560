//
// PUBLIC_INTERFACE
// Text formatting utilities used across the app.
//
/**
 * PUBLIC_INTERFACE
 * Convert a slug like "home-decoration" or "smartphones" into "Home Decoration" and "Smartphones".
 * - Replaces hyphens/underscores with spaces
 * - Collapses multiple separators
 * - Title-cases each word
 * @param {string} str - The slug or id to format
 * @returns {string} Title-cased label
 */
export function slugToTitle(str) {
  if (str == null) return "";
  const s = String(str)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!s) return "";
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}
