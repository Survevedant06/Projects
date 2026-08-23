"use client";

import { useState, useEffect } from "react";
import type { ScanHistory } from "@/types";
import EmptyState from "@/components/EmptyState";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export default function AlertsPage() {
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");

  useEffect(() => { fetchAlerts(); }, []);

  async function fetchAlerts() {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/scans/history?limit=200`);
      const data: ScanHistory[] = await resp.json();
      setHistory(data.filter((h) => h.aggregate_status !== "pass"));
    } catch { /* offline */ }
    finally { setIsLoading(false); }
  }

  const criticalCount = history.filter((h) => h.aggregate_status === "fail" || h.aggregate_status === "error").length;
  const warningCount = history.filter((h) => h.aggregate_status === "warn").length;
  const filtered = filterSeverity === "all" ? history
    : filterSeverity === "critical" ? history.filter((h) => h.aggregate_status === "fail" || h.aggregate_status === "error")
    : history.filter((h) => h.aggregate_status === "warn");

  const sevCfg: Record<string, { color: string; bg: string; label: string; icon: string }> = {
    fail: { color: "var(--fail)", bg: "var(--fail-dim)", label: "CRITICAL", icon: "⚠" },
    error: { color: "var(--fail)", bg: "var(--fail-dim)", label: "ERROR", icon: "✕" },
    warn: { color: "var(--warn)", bg: "var(--warn-dim)", label: "WARNING", icon: "◉" },
  };

  return (
    <>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Critical", value: criticalCount, color: "var(--fail)", sub: "immediate action" },
          { label: "Warnings", value: warningCount, color: "var(--warn)", sub: "attention needed" },
          { label: "Total Alerts", value: history.length, color: "var(--accent)", sub: "across all scans" },
        ].map((c) => (
          <div key={c.label} className="glass" style={{ padding: "20px 24px", borderRadius: "var(--radius-lg)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c.color }} />
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6 }}>
        {[{ key: "all", label: "All", count: history.length }, { key: "critical", label: "Critical", count: criticalCount }, { key: "warning", label: "Warnings", count: warningCount }].map((f) => (
          <button key={f.key} onClick={() => setFilterSeverity(f.key)} style={{ padding: "5px 14px", borderRadius: "var(--radius-full)", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, border: `1px solid ${filterSeverity === f.key ? "var(--accent)" : "var(--border)"}`, background: filterSeverity === f.key ? "var(--accent-dim)" : "transparent", color: filterSeverity === f.key ? "var(--accent)" : "var(--text-muted)", cursor: "pointer" }}>
            {f.label} <span style={{ opacity: 0.7 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Alert List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-md)" }} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="◉" title="No security alerts" description="All scans are passing — infrastructure looks clean" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((alert, i) => {
            const sev = sevCfg[alert.aggregate_status] ?? sevCfg.fail;
            return (
              <div key={alert.id} className="glass" style={{ borderRadius: "var(--radius-md)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, borderLeft: `3px solid ${sev.color}`, animation: `slide-up 0.4s ease ${i * 50}ms both` }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: sev.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: sev.color, flexShrink: 0 }}>{sev.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, padding: "2px 8px", borderRadius: "var(--radius-full)", color: sev.color, background: sev.bg, textTransform: "uppercase" as const }}>{sev.label}</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>Target #{alert.target_id}</span>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                    Trust: {alert.trust_score} · Risk: {alert.risk_level} · {alert.duration_ms}ms
                  </div>
                </div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>{new Date(alert.finished_at).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
