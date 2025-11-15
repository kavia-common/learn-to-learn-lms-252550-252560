import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Loader, EmptyState, Pagination } from "../../components";
import { fetchCourses, coursesSelectors } from "../../store/slices/coursesSlice";
import { fetchCategories, categoriesSelectors } from "../../store/slices/categoriesSlice";

/**
 * PUBLIC_INTERFACE
 * Course Catalog page
 * - Lists courses with filters (category, level), search, and pagination.
 * - Uses Redux slices for courses and categories.
 * - Respects remote API mode via services layer.
 */
function Catalog() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state derived from URL for shareability
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("cat") || "");
  const [level, setLevel] = useState(searchParams.get("lvl") || "");
  const [page, setPage] = useState(Number(searchParams.get("p") || 1));
  const pageSize = 9;

  const courses = useSelector(coursesSelectors.selectAll);
  const coursesLoading = useSelector(coursesSelectors.selectLoading);
  const categories = useSelector(categoriesSelectors.selectAll);
  const categoriesLoading = useSelector(categoriesSelectors.selectLoading);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Apply filters client-side (remote APIs could support query server-side later)
  const filtered = useMemo(() => {
    let list = courses || [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter((c) => String(c.categoryId || "") === String(category));
    }
    if (level) {
      list = list.filter((c) => String(c.level || "").toLowerCase() === String(level).toLowerCase());
    }
    return list;
  }, [courses, query, category, level]);

  const total = filtered.length;
  const startIdx = (page - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  // Sync URL params for shareability
  useEffect(() => {
    const next = {};
    if (query) next.q = query;
    if (category) next.cat = category;
    if (level) next.lvl = level;
    if (page > 1) next.p = String(page);
    setSearchParams(next, { replace: true });
  }, [query, category, level, page, setSearchParams]);

  const resetPage = () => setPage(1);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Course Catalog</h2>
      <p className="card-desc">Browse all available BrainBoost courses.</p>

      <section aria-label="Filters" style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px 200px", gap: 12 }}>
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
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

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

      {(coursesLoading || categoriesLoading) ? (
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
                  setCategory("");
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
