import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

/**
 * PUBLIC_INTERFACE
 * Schedule page for planning sessions.
 * - CRUD personal sessions stored per user in localStorage.
 */
function Schedule() {
  const userId = useSelector((s) => s.auth.user?.id || "anon");
  const STORAGE_KEY = useMemo(() => `bb_schedule_${userId}`, [userId]);

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [STORAGE_KEY]);

  const persist = (next) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const add = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const id = `sess_${Math.random().toString(36).slice(2, 9)}`;
    const newItem = { id, title: title.trim(), date, time };
    persist([newItem, ...items]);
    setTitle("");
    setDate("");
    setTime("");
  };

  const remove = (id) => {
    persist(items.filter((x) => x.id !== id));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Schedule</h2>
      <p className="card-desc">Plan study sessions and set reminders.</p>

      <section aria-labelledby="add-session-title" className="card" style={{ marginTop: 12 }}>
        <h3 id="add-session-title" className="card-title">Add session</h3>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 160px 140px auto", gap: 8, marginTop: 8 }}>
          <label style={{ display: "grid" }}>
            <span style={{ fontWeight: 600, marginBottom: 4 }}>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deep focus block"
              required
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </label>
          <label style={{ display: "grid" }}>
            <span style={{ fontWeight: 600, marginBottom: 4 }}>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </label>
          <label style={{ display: "grid" }}>
            <span style={{ fontWeight: 600, marginBottom: 4 }}>Time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </label>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      </section>

      <section aria-labelledby="sessions-title" style={{ marginTop: 12 }}>
        <h3 id="sessions-title" className="card-title">Your sessions</h3>
        {items.length === 0 ? (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                border: "1px dashed var(--border-color)",
                borderRadius: "var(--radius)",
                padding: 16,
                color: "var(--text-secondary)",
              }}
            >
              No sessions yet. Use the form above to add one.
            </div>
          </div>
        ) : (
          <div className="cards" style={{ marginTop: 8 }}>
            {items.map((it) => (
              <article key={it.id} className="card" aria-labelledby={`sess-${it.id}-title`}>
                <h4 id={`sess-${it.id}-title`} className="card-title" style={{ marginBottom: 4 }}>
                  {it.title}
                </h4>
                <p className="card-desc" style={{ margin: 0 }}>
                  {it.date} {it.time ? `at ${it.time}` : ""}
                </p>
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-outline" onClick={() => remove(it.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Schedule;
