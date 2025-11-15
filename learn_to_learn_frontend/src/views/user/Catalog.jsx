import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Loader, EmptyState, Pagination } from "../../components";
import { fetchCourses, fetchCoursesQuery, coursesSelectors } from "../../store/slices/coursesSlice";
import { slugToTitle } from "../../utils/format";
import { getCategoryTaxonomy } from "../../services/categoryService";
import { applyCourseFilters, normalizeTaxonomy as normalizeTaxonomyUtil } from "../../utils/catalogFilters";

/**
 * PUBLIC_INTERFACE
 * Course Catalog page
 * - Lists courses with filters (category, subcategory, level), search, and pagination.
 * - Loads curated category taxonomy (with backend fallback) on mount
 * - Populates Category dropdown with main categories (no duplicate 'All')
 * - Renders dependent Subcategory dropdown when available
 * - Keeps DummyJSON remote mode behind feature flag for course loading
 */
function Catalog() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-derived filters
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("cat") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("sub") || "");
  const [level, setLevel] = useState(searchParams.get("lvl") || "");
  const [page, setPage] = useState(Number(searchParams.get("p") || 1));
  const pageSize = 20;

  // Courses state
  const courses = useSelector(coursesSelectors.selectAll);
  const coursesLoading = useSelector(coursesSelectors.selectLoading);

  // Taxonomy state
  const [categories, setCategories] = useState([]); // [{name, subcategories[]}]
  const [subcategories, setSubcategories] = useState([]); // derived from selected main
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // On mount: load taxonomy
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingCategories(true);
      setCategoriesError("");
      try {
        const tax = await getCategoryTaxonomy();
        const norm = normalizeTaxonomyUtil(tax);
        if (!active) return;
        setCategories(norm);
        // If URL had a pre-selected category, derive subcategories
        if (searchParams.get("cat")) {
          const found = norm.find((c) => c.name === searchParams.get("cat"));
          setSubcategories(found?.subcategories || []);
        }
      } catch (e) {
        if (!active) return;
        setCategories([]);
        setCategoriesError("Failed to load categories. You can still browse all courses.");
      } finally {
        if (active) setLoadingCategories(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [searchParams]);

  // Determine remote mode (DummyJSON) or local mock
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || "").toLowerCase();
  const base = process.env.REACT_APP_API_BASE || "";
  const remote = Boolean(base) && flags.split(",").map((s) => s.trim()).includes("remote");

  // Load courses
  useEffect(() => {
    if (remote) {
      // For remote (DummyJSON), we only support query/category parameters it understands.
      // Since curated categories don't map to DummyJSON slugs, we fetch by q or all.
      dispatch(
        fetchCoursesQuery({
          category: undefined, // avoid mismatched slugs
          q: (query || "").trim() || undefined,
          limit: pageSize,
          page,
        })
      );
    } else {
      // local mode
      dispatch(fetchCourses());
    }
  }, [dispatch, remote, query, page, pageSize]);

  // Derived subcategories when main category changes
  useEffect(() => {
    const found = (categories || []).find((c) => c.name === selectedCategory);
    setSubcategories(found?.subcategories || []);
    // Reset selected subcategory if no longer valid
    if (!found || !(found.subcategories || []).includes(selectedSubcategory)) {
      setSelectedSubcategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, categories]);

  // Client-side filtering with curated category/subcategory
  const filtered = useMemo(() => {
    let list = Array.isArray(courses) ? courses : [];

    // Map courses to include category/subcategory fields if absent.
    // We do not infer subcategory; keep null unless already present.
    list = list.map((c) => ({
      ...c,
      category: c?.category ?? (selectedCategory || null),
      subcategory: c?.subcategory ?? null,
    }));

    // Text query filter
    const q = (query || "").trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }

    // Apply curated category/subcategory filters
    list = applyCourseFilters(list, selectedCategory, selectedSubcategory);

    // Level filter
    if (level) {
      list = list.filter(
        (c) => String(c.level || "").toLowerCase() === String(level).toLowerCase()
      );
    }

    return list;
  }, [courses, query, level, selectedCategory, selectedSubcategory]);

  // Always call hooks unconditionally
  const storeTotal = useSelector((s) => s.courses?.meta?.total) || 0;

  // Totals: remote uses server total; local uses filtered length
  const total = remote ? storeTotal : filtered.length;
  const startIdx = (page - 1) * pageSize;
  const pageItems = remote ? (Array.isArray(courses) ? courses : []) : filtered.slice(startIdx, startIdx + pageSize);

  // Sync URL params
  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (selectedCategory) next.cat = selectedCategory;
    if (selectedSubcategory) next.sub = selectedSubcategory;
    if (level) next.lvl = level;
    if (page > 1) next.p = String(page);
    setSearchParams(next, { replace: true });
  }, [query, selectedCategory, selectedSubcategory, level, page, setSearchParams]);

  const resetPage = () => setPage(1);

  // Category dropdown data (no duplicate "All" option; we choose no "All" per requirement)
  const categoryOptions = Array.isArray(categories) ? categories.map((c) => c.name) : [];
  const hasCategories = categoryOptions.length > 0;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Course Catalog</h2>
      <p className="card-desc">Browse all available BrainBoost courses.</p>

      <section aria-label="Filters" style={{ marginTop: 12, display: "grid", gap: "var(--space-3)" }}>
        <div style={{ display: "grid", gridTemplateColumns: subcategories.length > 0 ? "1fr 240px 220px 200px" : "1fr 240px 200px", gap: "var(--space-3)" }}>
          <div>
            <label htmlFor="catalog-search" style={{ display: "block", fontWeight: 600 }}>
              Search
            </label>
            <input
              id="catalog-search"
              type="search"
              placeholder="Search courses..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label htmlFor="catalog-category" style={{ display: "block", fontWeight: 600 }}>
              Category
            </label>
            <select
              id="catalog-category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                resetPage();
              }}
              disabled={loadingCategories || !hasCategories}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              {/* No duplicate 'All' - omitting an 'All' default per requirement */}
              <option value="" disabled>
                {loadingCategories ? "Loading..." : "Select a category"}
              </option>
              {categoryOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {loadingCategories ? (
              <div aria-live="polite" style={{ marginTop: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                Loading categories...
              </div>
            ) : categoriesError ? (
              <div role="alert" style={{ marginTop: 6, fontSize: 12, color: "var(--error, #EF4444)" }}>
                {categoriesError}
              </div>
            ) : null}
          </div>

          {subcategories.length > 0 && (
            <div>
              <label htmlFor="catalog-subcategory" style={{ display: "block", fontWeight: 600 }}>
                Subcategory
              </label>
              <select
                id="catalog-subcategory"
                value={selectedSubcategory}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  resetPage();
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                {/* No implicit All; allow empty to mean 'no subcategory filter' */}
                <option value="">Select a subcategory</option>
                {subcategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="catalog-level" style={{ display: "block", fontWeight: 600 }}>
              Level
            </label>
            <select
              id="catalog-level"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                resetPage();
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">All</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </section>

      {(coursesLoading || loadingCategories) ? (
        <div style={{ marginTop: 16 }}>
          <Loader label="Loading catalog..." />
        </div>
      ) : pageItems.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          <EmptyState
            title="No courses match your filters"
            description="Try adjusting search terms or selecting different filters."
            actions={
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("");
                  setSelectedSubcategory("");
                  setLevel("");
                  setPage(1);
                }}
              >
                Reset filters
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div aria-live="polite" style={{ marginTop: 8, color: "var(--text-secondary)" }}>
            {Number.isFinite(total) ? `${total} result${Number(total) === 1 ? "" : "s"}` : null}
          </div>
          <div className="cards" style={{ marginTop: 16 }}>
            {pageItems.map((c) => (
              <article className="card" key={c.id} aria-labelledby={`course-${c.id}-title`}>
                <h3 id={`course-${c.id}-title`} className="card-title">
                  {c.title}
                </h3>
                <p className="card-desc" style={{ minHeight: 40 }}>{c.description || "No description"}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {c.level ? (
                    <span
                      style={{
                        border: "1px solid var(--border-color)",
                        borderRadius: 8,
                        padding: "4px 8px",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                      }}
                    >
                      {c.level}
                    </span>
                  ) : null}
                  {c.tags?.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      style={{
                        border: "1px solid var(--border-color)",
                        borderRadius: 8,
                        padding: "4px 8px",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <Link className="btn btn-outline" to={`/courses/${encodeURIComponent(c.id)}`}>
                    View Details
                  </Link>
                  <Link className="btn btn-primary" to={`/courses/${encodeURIComponent(c.id)}`}>
                    Enroll
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Catalog;
