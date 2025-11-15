import React from "react";

/**
 * PUBLIC_INTERFACE
 * Loader displays a spinner and optional message with accessible live region.
 * Props:
 * - label?: string - message to announce
 * - inline?: boolean - render inline without full overlay
 */
function Loader({ label = "Loading...", inline = false }) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        color: "var(--text-secondary)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "2px solid rgba(37,99,235,0.25)",
          borderTopColor: "var(--primary)",
          animation: "bb-spin 0.9s linear infinite",
        }}
      />
      <span>{label}</span>
    </div>
  );

  if (inline) return content;

  return (
    <div
      style={{
        minHeight: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {content}
      <style>{`
        @keyframes bb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Loader;
