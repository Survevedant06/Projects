"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

export default function EmptyState({ icon = "◈", title, description }: EmptyStateProps) {
  return (
    <div
      className="glass"
      style={{
        borderRadius: "var(--radius-lg)",
        padding: "48px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 40, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {description}
      </div>
    </div>
  );
}
