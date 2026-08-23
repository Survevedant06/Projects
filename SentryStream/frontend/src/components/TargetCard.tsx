"use client";

import type { Target, ScanEvent, CheckResult } from "@/types";
import TrustScoreRing from "./TrustScoreRing";
import CheckRow from "./CheckRow";

interface TargetCardProps {
  target: Target;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onRescan: () => void;
  isDeleting: boolean;
  isScanning: boolean;
  latestEvent?: ScanEvent;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pass: { label: "SECURE", color: "var(--pass)", bg: "var(--pass-dim)", border: "rgba(0,229,160,0.25)" },
  warn: { label: "WARNING", color: "var(--warn)", bg: "var(--warn-dim)", border: "rgba(255,178,36,0.25)" },
  fail: { label: "CRITICAL", color: "var(--fail)", bg: "var(--fail-dim)", border: "rgba(255,69,115,0.25)" },
  error: { label: "ERROR", color: "var(--fail)", bg: "var(--fail-dim)", border: "rgba(255,69,115,0.25)" },
};

export default function TargetCard({
  target, index, isExpanded, onToggleExpand, onDelete, onRescan, isDeleting, isScanning, latestEvent,
}: TargetCardProps) {
  const status = target.last_status ? statusConfig[target.last_status] : null;
  const trustScore = latestEvent?.trust_score ?? (target.last_status === "pass" ? 95 : target.last_status === "warn" ? 68 : target.last_status === "fail" ? 32 : 100);
  const riskLevel = latestEvent?.risk_level ?? (target.last_status === "pass" ? "Low" : target.last_status === "warn" ? "Medium" : target.last_status === "fail" ? "High" : "—");
  const checks: CheckResult[] = latestEvent?.checks ?? [];
  const insights: string[] = latestEvent?.insights ?? [];

  return (
    <div
      className="glass"
      style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "all var(--transition-base)",
        animation: `slide-up 0.5s ease ${index * 80}ms both`,
        cursor: "pointer",
      }}
      onClick={onToggleExpand}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = status?.border ?? "var(--border-bright)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <TrustScoreRing score={trustScore} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={target.url}>
              {target.url}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
              {target.last_status && status && (
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, padding: "2px 8px", borderRadius: "var(--radius-full)", color: status.color, background: status.bg, border: `1px solid ${status.border}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {status.label}
                </span>
              )}
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500, padding: "2px 8px", borderRadius: "var(--radius-full)", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                Risk: {riskLevel}
              </span>
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)", transition: "transform var(--transition-fast)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", marginLeft: 8 }}>▾</span>
      </div>

      {/* Checks */}
      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {checks.length > 0 ? (
          checks.slice(0, isExpanded ? checks.length : 3).map((check, i) => <CheckRow key={i} check={check} />)
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Last Scan</span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
              {target.last_scanned_at ? new Date(target.last_scanned_at).toLocaleString() : "Never"}
            </span>
          </div>
        )}

        {/* Insights (expanded) */}
        {isExpanded && insights.length > 0 && (
          <div style={{ marginTop: 4, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 6 }}>Insights</div>
            {insights.map((insight, i) => (
              <div key={i} style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", padding: "3px 0", display: "flex", gap: 6, alignItems: "baseline" }}>
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>→</span>
                {insight}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {target.last_scanned_at ? `scanned ${formatRelativeTime(target.last_scanned_at)}` : "not scanned"}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onRescan(); }}
            disabled={isScanning}
            style={{
              fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)",
              background: "transparent", border: "1px solid rgba(108,140,255,0.2)",
              padding: "3px 10px", borderRadius: "var(--radius-sm)",
              cursor: isScanning ? "not-allowed" : "pointer",
              transition: "all var(--transition-fast)", opacity: isScanning ? 0.6 : 1,
            }}
          >
            {isScanning ? "⟳..." : "↺ Rescan"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isDeleting}
            style={{
              fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fail)",
              background: "transparent", border: "1px solid rgba(255,69,115,0.2)",
              padding: "3px 10px", borderRadius: "var(--radius-sm)",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "all var(--transition-fast)", opacity: isDeleting ? 0.5 : 1,
            }}
          >
            {isDeleting ? "..." : "✕ Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
