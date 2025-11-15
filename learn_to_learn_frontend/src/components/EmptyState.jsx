import React from "react";

/**
 * PUBLIC_INTERFACE
 * EmptyState displays a friendly message when there is no data to show.
 * Props:
 * - title: string
 * - description?: string
 * - actions?: React.ReactNode
 * - icon?: React.ReactNode
 */
function EmptyState({ title = "Nothing here yet", description = "", actions = null, icon = null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        border: "1px dashed var(--border-color)",
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius)",
        padding: 24,
        display: "grid",
        justifyItems: "center",
        gap: 8,
        color: "var(--text-secondary)",
      }}
    >
      <div aria-hidden="true" style={{ fontSize: 28 }}>
        {icon ?? "📄"}
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 800,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h3>
      {description ? (
        <p className="card-desc" style={{ margin: 0, textAlign: "center" }}>
          {description}
        </p>
      ) : null}
      {actions ? <div style={{ marginTop: 8, display: "flex", gap: 8 }}>{actions}</div> : null}
    </div>
  );
}

export default EmptyState;
