import React from "react";

/**
 * PUBLIC_INTERFACE
 * Pagination renders simple page controls.
 * Props:
 * - page: number (1-based)
 * - pageSize: number
 * - total: number (total items)
 * - onPageChange: (nextPage:number) => void
 */
function Pagination({ page = 1, pageSize = 10, total = 0, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const current = Math.min(Math.max(1, page), pageCount);

  const go = (n) => {
    if (typeof onPageChange === "function") {
      const next = Math.min(Math.max(1, n), pageCount);
      if (next !== current) onPageChange(next);
    }
  };

  const disabledStyle = { opacity: 0.5, cursor: "not-allowed" };
  const btnStyle = {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 10,
    padding: "8px 12px",
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        justifyContent: "flex-end",
        paddingTop: 8,
      }}
    >
      <button
        type="button"
        style={{ ...btnStyle, ...(current <= 1 ? disabledStyle : {}) }}
        onClick={() => go(current - 1)}
        disabled={current <= 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      <span aria-live="polite" style={{ color: "var(--text-secondary)" }}>
        Page {current} of {pageCount}
      </span>

      <button
        type="button"
        style={{ ...btnStyle, ...(current >= pageCount ? disabledStyle : {}) }}
        onClick={() => go(current + 1)}
        disabled={current >= pageCount}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

export default Pagination;
