import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState, Loader, Pagination, Modal } from "../../components";
import { fetchUsers, updateUser, deleteUser, usersSelectors, createUser } from "../../store/slices/usersSlice";

/**
 * PUBLIC_INTERFACE
 * AdminUsers page
 * - List/search/sort users
 * - Toggle role (user/admin)
 * - Activate/Deactivate (active boolean in local model)
 * - Create mock user (local mode)
 */
function AdminUsers() {
  const dispatch = useDispatch();
  const users = useSelector(usersSelectors.selectAll);
  const loading = useSelector(usersSelectors.selectLoading);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let arr = users.map(u => ({ active: true, ...u })); // ensure active flag default true
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter(u =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "name":
        arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "role":
        arr.sort((a, b) => (a.role || "").localeCompare(b.role || ""));
        break;
      default:
        break;
    }
    return arr;
  }, [users, query, sort]);

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  function resetPage() { setPage(1); }

  async function onToggleRole(u) {
    const nextRole = (u.role === "admin") ? "user" : "admin";
    await dispatch(updateUser({ ...u, role: nextRole })).unwrap().catch(() => {});
  }

  async function onToggleActive(u) {
    const nextActive = !(u.active ?? true);
    await dispatch(updateUser({ ...u, active: nextActive })).unwrap().catch(() => {});
  }

  async function onRemove(u) {
    await dispatch(deleteUser(u.id)).unwrap().catch(() => {});
  }

  async function onCreateUser(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const payload = { name: newName.trim(), email: newEmail || undefined, role: "user", active: true };
    await dispatch(createUser(payload)).unwrap().catch(() => {});
    setNewName("");
    setNewEmail("");
    setOpenCreate(false);
  }

  if (loading) {
    return (
      <div>
        <Loader label="Loading users..." />
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 140px auto", gap: 8 }}>
          <div>
            <label htmlFor="user-q" style={{ fontWeight: 600 }}>Search</label>
            <input
              id="user-q"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              placeholder="Search name or email"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label htmlFor="user-sort" style={{ fontWeight: 600 }}>Sort by</label>
            <select
              id="user-sort"
              value={sort}
              onChange={(e) => { setSort(e.target.value); resetPage(); }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            >
              <option value="name">Name</option>
              <option value="role">Role</option>
            </select>
          </div>
          <div />
          <div style={{ display: "flex", alignItems: "end", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-primary" onClick={() => setOpenCreate(true)}>New user</button>
          </div>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <EmptyState
            title="No users to display"
            description="Try adjusting your search."
            actions={<button className="btn btn-outline" onClick={() => setQuery("")}>Clear search</button>}
            icon={<span aria-hidden="true">👥</span>}
          />
        </div>
      ) : (
        <div className="cards" style={{ marginTop: 12 }}>
          {pageItems.map((u) => (
            <article key={u.id} className="card" aria-labelledby={`user-${u.id}-title`}>
              <h4 id={`user-${u.id}-title`} className="card-title">{u.name || "User"}</h4>
              <p className="card-desc" style={{ margin: 0 }}>{u.email || "No email"}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: "4px 8px", fontSize: 12 }}>
                  Role: {u.role || "user"}
                </span>
                <span style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: "4px 8px", fontSize: 12 }}>
                  {u.active === false ? "Inactive" : "Active"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-outline" onClick={() => onToggleRole(u)}>
                  Make {u.role === "admin" ? "User" : "Admin"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => onToggleActive(u)}>
                  {u.active === false ? "Activate" : "Deactivate"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => onRemove(u)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create user">
        <form onSubmit={onCreateUser} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Name</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} required
                   style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Email</span>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                   style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setOpenCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminUsers;
