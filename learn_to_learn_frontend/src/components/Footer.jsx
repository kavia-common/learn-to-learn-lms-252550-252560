import React from "react";

/**
 * PUBLIC_INTERFACE
 * Footer renders the application footer with brand and basic links.
 * Accessible landmarks and color-contrast friendly design.
 */
function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      style={{
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-elevated)",
        color: "var(--text-secondary)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--space-3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--primary)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          BB
        </span>
        <span style={{ fontWeight: 700 }}>BrainBoost</span>
        <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
          © {new Date().getFullYear()}
        </span>
      </div>
      <nav aria-label="Footer links" style={{ display: "flex", gap: 12 }}>
        <a className="App-link" href="https://react.dev" target="_blank" rel="noopener noreferrer">
          Docs
        </a>
        <a className="App-link" href="https://github.com" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="App-link" href="https://kavia.ai" target="_blank" rel="noopener noreferrer">
          Kavia
        </a>
      </nav>
    </footer>
  );
}

export default Footer;
