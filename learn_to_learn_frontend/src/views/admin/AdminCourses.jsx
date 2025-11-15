import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState, Loader, Pagination, Modal } from "../../components";
import { fetchCourses, createCourse, updateCourse, deleteCourse, coursesSelectors } from "../../store/slices/coursesSlice";
import { fetchCategories, categoriesSelectors } from "../../store/slices/categoriesSlice";

/**
 * PUBLIC_INTERFACE
 * AdminCourses page
 * - List/search/sort courses
 * - Create and Edit course (title, description, category, level)
 */
function AdminCourses() {
  const dispatch = useDispatch();
  const courses = useSelector(coursesSelectors.selectAll);
  const loading = useSelector(coursesSelectors.selectLoading);
  const categories = useSelector(categoriesSelectors.selectAll);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("title");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "", level: "beginner" });

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  const categorizedName = (c) => categories.find((x) => String(x.id) === String(c.categoryId))?.name || "Uncategorized";

  const filtered = useMemo(() => {
    let list = [...courses];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(c => (c.title || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
    }
    switch (sort) {
      case "title":
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "category":
        list.sort((a, b) => categorizedName(a).localeCompare(categorizedName(b)));
        break;
      case "level":
        list.sort((a, b) => (a.level || "").localeCompare(b.level || ""));
        break;
      default:
        break;
    }
    return list;
  }, [courses, query, sort, categories]);

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  function resetPage() { setPage(1); }

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", categoryId: "", level: "beginner" });
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ title: c.title || "", description: c.description || "", categoryId: c.categoryId || "", level: c.level || "beginner" });
    setModalOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { ...form, categoryId: form.categoryId || null };
    if (editing) {
      await dispatch(updateCourse({ id: editing.id, ...payload })).unwrap().catch(() => {});
    } else {
      await dispatch(createCourse(payload)).unwrap().catch(() => {});
    }
    setModalOpen(false);
  }

  async function onRemove(c) {
    await dispatch(deleteCourse(c.id)).unwrap().catch(() => {});
  }

  if (loading) {
    return (
      <div>
        <Loader label="Loading courses..." />
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 160px auto", gap: "var(--space-2)" }}>
          <div>
            <label htmlFor="course-q" style={{ fontWeight: 600 }}>Search</label>
            <input
              id="course-q"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              placeholder="Search courses..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label htmlFor="course-sort" style={{ fontWeight: 600 }}>Sort by</label>
            <select
              id="course-sort"
              value={sort}
              onChange={(e) => { setSort(e.target.value); resetPage(); }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            >
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="level">Level</option>
            </select>
          </div>
          <div />
          <div style={{ display: "flex", alignItems: "end", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-primary" onClick={openCreate}>New course</button>
          </div>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <EmptyState
            title="No courses found"
            description="Try changing your filters."
            actions={<button className="btn btn-outline" onClick={() => setQuery("")}>Reset search</button>}
            icon={<span aria-hidden="true">📘</span>}
          />
        </div>
      ) : (
        <div className="cards" style={{ marginTop: 12 }}>
          {pageItems.map((c) => (
            <article key={c.id} className="card" aria-labelledby={`ac-${c.id}-title`}>
              <h4 id={`ac-${c.id}-title`} className="card-title">{c.title}</h4>
              <p className="card-desc" style={{ minHeight: 40 }}>{c.description || "No description"}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: "4px 8px", fontSize: 12 }}>
                  Category: {categorizedName(c)}
                </span>
                {c.level ? (
                  <span style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: "4px 8px", fontSize: 12 }}>
                    {c.level}
                  </span>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-outline" onClick={() => openEdit(c)}>Edit</button>
                <button type="button" className="btn btn-outline" onClick={() => onRemove(c)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit course" : "Create course"}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Category</span>
              <select
                value={form.categoryId || ""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Level</span>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? "Save changes" : "Create course"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCourses;
