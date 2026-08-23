"use client";

import { useState, useEffect } from "react";
import type { ScanHistory } from "@/types";
import CheckRow from "@/components/CheckRow";
import EmptyState from "@/components/EmptyState";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { fetchHistory(); }, []);

  async function fetchHistory() {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/scans/history?limit=100`);
      setHistory(await resp.json());
    } catch { /* backend offline */ }
    finally { setIsLoading(false); }
  }

  const filtered = filterStatus === "all" ? history : history.filter((h) => h.aggregate_status === filterStatus);

  const statusColors: Record<string, { color: string; bg: string; label: string }> = {
    pass: { color: "var(--pass)", bg: "var(--pass-dim)", label: "PASS" },
    warn: { color: "var(--warn)", bg: "var(--warn-dim)", label: "WARN" },
    fail: { color: "var(--fail)", bg: "var(--fail-dim)", label: "FAIL" },
    error: { color: "var(--fail)", bg: "var(--fail-dim)", label: "ERROR" },
  };

  const statusFilters = [
    { key: "all", label: "All", count: history.length },
    { key: "pass", label: "Pass", count: history.filter((h) => h.aggregate_status === "pass").length },
    { key: "warn", label: "Warn", count: history.filter((h) => h.aggregate_status === "warn").length },
    { key: "fail", label: "Fail", count: history.filter((h) => h.aggregate_status === "fail").length },
  ];

  return (
    <>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div className="glass" style={{ padding: "16px 20px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)" }}>{history.length}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4 }}>Total Scans</div>
        </div>
        <div className="glass" style={{ padding: "16px 20px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--pass)" }}>{history.filter((h) => h.aggregate_status === "pass").length}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4 }}>Passed</div>
        </div>
        <div className="glass" style={{ padding: "16px 20px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--warn)" }}>{history.filter((h) => h.aggregate_status === "warn").length}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4 }}>Warnings</div>
        </div>
        <div className="glass" style={{ padding: "16px 20px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--fail)" }}>{history.filter((h) => h.aggregate_status === "fail" || h.aggregate_status === "error").length}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4 }}>Failures</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6 }}>
        {statusFilters.map((f) => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{
            padding: "5px 14px", borderRadius: "var(--radius-full)", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500,
            border: `1px solid ${filterStatus === f.key ? "var(--accent)" : "var(--border)"}`,
            background: filterStatus === f.key ? "var(--accent-dim)" : "transparent",
            color: filterStatus === f.key ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer", transition: "all var(--transition-fast)",
          }}>
            {f.label} <span style={{ opacity: 0.7 }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="↺" title="No scan history" description={history.length === 0 ? "Run a scan from the dashboard to see results here" : "No scans match the selected filter"} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: 19, top: 24, bottom: 24, width: 2, background: "var(--border)", zIndex: 0 }} />

          {filtered.map((scan, i) => {
            const sc = statusColors[scan.aggregate_status] ?? statusColors.error;
            const isExpanded = expandedId === scan.id;

            return (
              <div
                key={scan.id}
                onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                style={{
                  display: "flex", gap: 16, alignItems: "flex-start", padding: "12px 0",
                  cursor: "pointer", position: "relative", zIndex: 1,
                  animation: `slide-up 0.4s ease ${i * 40}ms both`,
                }}
              >
                {/* Timeline dot */}
                <div style={{ width: 40, display: "flex", justifyContent: "center", flexShrink: 0, paddingTop: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: sc.color, boxShadow: `0 0 8px ${sc.color}`, border: "2px solid var(--bg)" }} />
                </div>

                {/* Content */}
                <div className="glass" style={{ flex: 1, borderRadius: "var(--radius-md)", overflow: "hidden", transition: "all var(--transition-fast)" }}>
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, padding: "2px 8px", borderRadius: "var(--radius-full)", color: sc.color, background: sc.bg, border: `1px solid ${sc.color}33`, textTransform: "uppercase" as const }}>
                        {sc.label}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                        Target #{scan.target_id}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      <span>Trust: <span style={{ color: sc.color, fontWeight: 600 }}>{scan.trust_score}</span></span>
                      <span>Risk: <span style={{ fontWeight: 600 }}>{scan.risk_level}</span></span>
                      <span>{scan.duration_ms}ms</span>
                      <span>{new Date(scan.finished_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {isExpanded && scan.checks && scan.checks.length > 0 && (
                    <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--text-muted)" }}>Check Results</div>
                      {scan.checks.map((check, ci) => (
                        <CheckRow key={ci} check={check} />
                      ))}
                      {scan.insights && scan.insights.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>Insights</div>
                          {scan.insights.map((insight, ii) => (
                            <div key={ii} style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", padding: "2px 0", display: "flex", gap: 6 }}>
                              <span style={{ color: "var(--accent)" }}>→</span>{insight}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
