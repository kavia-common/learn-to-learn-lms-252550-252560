import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * Modal displays content in a dialog with backdrop and accessible focus handling.
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - title?: string
 * - children: React.ReactNode
 * - footer?: React.ReactNode
 */
function Modal({ open = false, onClose, title = "Dialog", children, footer = null }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (typeof onClose === "function") onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Initial focus
  useEffect(() => {
    if (open) {
      // Focus the close button or dialog container
      const t = setTimeout(() => {
        (closeBtnRef.current || dialogRef.current)?.focus?.();
      }, 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        // click outside to close
        if (e.target === e.currentTarget && typeof onClose === "function") onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        alignItems: "center",
        justifyItems: "center",
        padding: 16,
      }}
      aria-hidden={!open}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bb-modal-title"
        tabIndex={-1}
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}
      >
        <div
          className="gradient-bg"
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h3 id="bb-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            {title}
          </h3>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
        <div
          style={{
            padding: 12,
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {footer || (
            <>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                aria-label="Cancel and close"
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                OK
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
