"use client";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  counts: Record<string, number>;
}

const filters = [
  { key: "all", label: "All" },
  { key: "pass", label: "Secure", color: "var(--pass)", bg: "var(--pass-dim)" },
  { key: "warn", label: "Warning", color: "var(--warn)", bg: "var(--warn-dim)" },
  { key: "fail", label: "Critical", color: "var(--fail)", bg: "var(--fail-dim)" },
  { key: "none", label: "Unscanned", color: "var(--text-muted)", bg: "var(--surface-2)" },
];

export default function SearchFilter({ searchQuery, onSearchChange, activeFilter, onFilterChange, counts }: SearchFilterProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      {/* Search */}
      <div
        className="glass"
        style={{
          borderRadius: "var(--radius-sm)",
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: "0 1 280px",
          minWidth: 200,
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>⌕</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search targets..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text)",
            outline: "none",
            padding: "9px 0",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, padding: 0 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          const count = counts[f.key] ?? 0;
          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                border: `1px solid ${isActive ? (f.color ?? "var(--accent)") : "var(--border)"}`,
                background: isActive ? (f.bg ?? "var(--accent-dim)") : "transparent",
                color: isActive ? (f.color ?? "var(--accent)") : "var(--text-muted)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              {f.label}
              <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
