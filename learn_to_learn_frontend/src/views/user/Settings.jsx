import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";

/**
 * PUBLIC_INTERFACE
 * Settings page
 * - Allows updating basic profile fields locally (name only in prototype)
 * - Persists to auth slice/localStorage via login action (mock)
 */
function Settings() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  async function onSave(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // In prototype, re-dispatch login with updated user info to persist locally.
      const next = { ...user, name: name?.trim() || user.name };
      dispatch(login(next));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <p className="card-desc">Update your profile basics.</p>

      <section className="card" aria-labelledby="profile-title" style={{ marginTop: 12, maxWidth: 560 }}>
        <h3 id="profile-title" className="card-title">Profile</h3>
        <form onSubmit={onSave} style={{ display: "grid", gap: 12, marginTop: 8 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="settings-name" style={{ fontWeight: 600 }}>Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              aria-busy={saving ? "true" : "false"}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Settings;
