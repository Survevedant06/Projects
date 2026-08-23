"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import type { Target } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export default function TargetsPage() {
  const { addToast } = useToast();
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<"url" | "status" | "last_scanned">("url");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => { fetchTargets(); }, []);

  async function fetchTargets() {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/targets`);
      setTargets(await resp.json());
    } catch { /* backend may be offline */ }
    finally { setIsLoading(false); }
  }

  async function deleteTarget(id: number) {
    try {
      await fetch(`${API_BASE}/targets/${id}`, { method: "DELETE" });
      await fetchTargets();
      addToast("Target removed", "success");
    } catch { addToast("Failed to remove target", "error"); }
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try { await fetch(`${API_BASE}/targets/${id}`, { method: "DELETE" }); } catch { /* continue */ }
    }
    setSelectedIds(new Set());
    await fetchTargets();
    addToast(`${ids.length} target(s) removed`, "success");
  }

  async function updateLabel(id: number) {
    try {
      await fetch(`${API_BASE}/targets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editLabel }),
      });
      await fetchTargets();
      addToast("Label updated", "success");
    } catch { addToast("Failed to update label", "error"); }
    setEditingId(null);
  }

  async function rescanTarget(id: number, url: string) {
    addToast(`Scanning ${url}...`, "info");
    try {
      await fetch(`${API_BASE}/scans/target/${id}`, { method: "POST" });
    } catch {
      try { await fetch(`${API_BASE}/scans`, { method: "POST" }); } catch { /* noop */ }
    }
    setTimeout(fetchTargets, 3000);
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === targets.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(targets.map((t) => t.id)));
  }

  const sorted = [...targets].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "url") return a.url.localeCompare(b.url) * dir;
    if (sortBy === "status") return (a.last_status ?? "").localeCompare(b.last_status ?? "") * dir;
    return ((a.last_scanned_at ?? "").localeCompare(b.last_scanned_at ?? "")) * dir;
  });

  function handleSort(col: "url" | "status" | "last_scanned") {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  }

  const statusBadge = (status: string | undefined) => {
    const config: Record<string, { color: string; bg: string; label: string }> = {
      pass: { color: "var(--pass)", bg: "var(--pass-dim)", label: "SECURE" },
      warn: { color: "var(--warn)", bg: "var(--warn-dim)", label: "WARNING" },
      fail: { color: "var(--fail)", bg: "var(--fail-dim)", label: "CRITICAL" },
      error: { color: "var(--fail)", bg: "var(--fail-dim)", label: "ERROR" },
    };
    const c = status ? config[status] : null;
    if (!c) return <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>—</span>;
    return (
      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, padding: "2px 8px", borderRadius: "var(--radius-full)", color: c.color, background: c.bg, border: `1px solid ${c.color}33`, textTransform: "uppercase" as const }}>
        {c.label}
      </span>
    );
  };

  const arrow = (col: string) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <>
      {/* Actions bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {targets.length} target(s) registered
        </div>
        {selectedIds.size > 0 && (
          <button onClick={bulkDelete} style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--fail)", background: "var(--fail-dim)", border: "1px solid rgba(255,69,115,0.3)", padding: "6px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
            Delete {selectedIds.size} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Loading targets...</div>
        ) : targets.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 12 }}>⊕</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>No targets registered</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Go to Dashboard to add targets</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", width: 40 }}>
                  <input type="checkbox" checked={selectedIds.size === targets.length && targets.length > 0} onChange={toggleSelectAll} style={{ accentColor: "var(--accent)" }} />
                </th>
                <th onClick={() => handleSort("url")} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em", cursor: "pointer" }}>URL{arrow("url")}</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Label</th>
                <th onClick={() => handleSort("status")} style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em", cursor: "pointer" }}>Status{arrow("status")}</th>
                <th onClick={() => handleSort("last_scanned")} style={{ padding: "12px 16px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em", cursor: "pointer" }}>Last Scanned{arrow("last_scanned")}</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border)", transition: "background var(--transition-fast)" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px" }}>
                    <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelect(t.id)} style={{ accentColor: "var(--accent)" }} />
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={t.url}>{t.url}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {editingId === t.id ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && updateLabel(t.id)} style={{ background: "var(--surface-3)", border: "1px solid var(--border-bright)", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "var(--text)", outline: "none", width: 120 }} autoFocus />
                        <button onClick={() => updateLabel(t.id)} style={{ background: "none", border: "none", color: "var(--pass)", cursor: "pointer", fontSize: 12 }}>✓</button>
                        <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}>✕</button>
                      </div>
                    ) : (
                      <span onClick={() => { setEditingId(t.id); setEditLabel(t.label ?? ""); }} style={{ cursor: "pointer", color: t.label ? "var(--text-secondary)" : "var(--text-muted)", fontStyle: t.label ? "normal" : "italic" }}>
                        {t.label || "click to add"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>{statusBadge(t.last_status)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text-muted)", fontSize: 11 }}>
                    {t.last_scanned_at ? new Date(t.last_scanned_at).toLocaleString() : "Never"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => rescanTarget(t.id, t.url)} style={{ fontSize: 10, color: "var(--accent)", background: "transparent", border: "1px solid rgba(108,140,255,0.2)", padding: "3px 8px", borderRadius: 4, cursor: "pointer" }}>↺ Scan</button>
                      <button onClick={() => deleteTarget(t.id)} style={{ fontSize: 10, color: "var(--fail)", background: "transparent", border: "1px solid rgba(255,69,115,0.2)", padding: "3px 8px", borderRadius: 4, cursor: "pointer" }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
