import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState, Loader, Pagination, Modal } from "../../components";
import { fetchCategories, createCategory, updateCategory, deleteCategory, categoriesSelectors } from "../../store/slices/categoriesSlice";

/**
 * PUBLIC_INTERFACE
 * AdminCategories page
 * - List categories
 * - Create/Edit category (name, description)
 */
function AdminCategories() {
  const dispatch = useDispatch();
  const categories = useSelector(categoriesSelectors.selectAll);
  const loading = useSelector(categoriesSelectors.selectLoading);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter(c => (c.name || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
  }, [categories, query]);

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  function resetPage() { setPage(1); }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "" });
    setOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ name: c.name || "", description: c.description || "" });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (editing) {
      await dispatch(updateCategory({ id: editing.id, ...form })).unwrap().catch(() => {});
    } else {
      await dispatch(createCategory(form)).unwrap().catch(() => {});
    }
    setOpen(false);
  }

  async function onRemove(c) {
    await dispatch(deleteCategory(c.id)).unwrap().catch(() => {});
  }

  if (loading) {
    return (
      <div>
        <Loader label="Loading categories..." />
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <div>
            <label htmlFor="cat-q" style={{ fontWeight: 600 }}>Search</label>
            <input
              id="cat-q"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              placeholder="Search categories..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-primary" onClick={openCreate}>New category</button>
          </div>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <EmptyState
            title="No categories"
            description="Create your first category."
            actions={<button className="btn btn-outline" onClick={openCreate}>Create</button>}
            icon={<span aria-hidden="true">🏷️</span>}
          />
        </div>
      ) : (
        <div className="cards" style={{ marginTop: 12 }}>
          {pageItems.map((c) => (
            <article key={c.id} className="card" aria-labelledby={`cat-${c.id}-title`}>
              <h4 id={`cat-${c.id}-title`} className="card-title">{c.name}</h4>
              <p className="card-desc" style={{ minHeight: 40 }}>{c.description || "No description"}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "Create category"}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editing ? "Save changes" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCategories;
