"use client";

import type { CheckResult } from "@/types";

const statusColors: Record<string, string> = {
  pass: "var(--pass)",
  warn: "var(--warn)",
  fail: "var(--fail)",
  error: "var(--fail)",
};

export default function CheckRow({ check }: { check: CheckResult }) {
  const color = statusColors[check.status] ?? "var(--text-muted)";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
        {check.check_name}
      </div>
      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color, fontWeight: 500, whiteSpace: "nowrap" }}>
        {check.detail}
      </div>
    </div>
  );
}
