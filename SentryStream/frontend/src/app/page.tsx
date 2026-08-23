"use client";

import { useState, useEffect, useMemo } from "react";
import { useScanSocket } from "@/hooks/useScanSocket";
import { useToast } from "@/contexts/ToastContext";
import type { Target, ScanEvent } from "@/types";
import StatCard from "@/components/StatCard";
import TargetCard from "@/components/TargetCard";
import LiveFeed from "@/components/LiveFeed";
import SearchFilter from "@/components/SearchFilter";
import EmptyState from "@/components/EmptyState";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export default function DashboardPage() {
  const { events, isConnected, latencyMs, clearEvents } = useScanSocket();
  const { addToast } = useToast();
  const [targets, setTargets] = useState<Target[]>([]);
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [addingTarget, setAddingTarget] = useState(false);
  const [expandedTarget, setExpandedTarget] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [scanningTargetId, setScanningTargetId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => { fetchTargets(); }, []);

  async function fetchTargets() {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/targets`);
      const data = await resp.json();
      setTargets(data);
    } catch {
      // Backend may be offline
    } finally {
      setIsLoading(false);
    }
  }

  // URL validation
  useEffect(() => {
    if (!newTargetUrl) { setUrlValid(null); return; }
    try {
      const hasProtocol = /^https?:\/\//i.test(newTargetUrl);
      const isIP = /^(\d{1,3}\.){3}\d{1,3}/.test(newTargetUrl);
      const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/.test(newTargetUrl);
      setUrlValid(hasProtocol ? !!new URL(newTargetUrl) : isIP || isDomain);
    } catch { setUrlValid(false); }
  }, [newTargetUrl]);

  async function addTarget() {
    if (!newTargetUrl || urlValid === false) return;
    setAddingTarget(true);
    try {
      const resp = await fetch(`${API_BASE}/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newTargetUrl }),
      });
      if (resp.ok) {
        setNewTargetUrl("");
        await fetchTargets();
        addToast(`Target "${newTargetUrl}" added successfully`, "success");
        runScan();
      } else {
        addToast("Failed to add target", "error");
      }
    } catch {
      addToast("Failed to add target — backend may be offline", "error");
    } finally {
      setAddingTarget(false);
    }
  }

  async function deleteTarget(id: number) {
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/targets/${id}`, { method: "DELETE" });
      await fetchTargets();
      addToast("Target removed", "success");
    } catch {
      addToast("Failed to remove target", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function runScan() {
    setIsScanningAll(true);
    addToast("Scanning all targets...", "info");
    try {
      await fetch(`${API_BASE}/scans`, { method: "POST" });
    } catch {
      addToast("Failed to trigger scan", "error");
    } finally {
      setTimeout(() => { setIsScanningAll(false); fetchTargets(); }, 3000);
    }
  }

  async function rescanTarget(targetId: number, url: string) {
    setScanningTargetId(targetId);
    addToast(`Scanning ${url}...`, "info");
    try {
      await fetch(`${API_BASE}/scans/target/${targetId}`, { method: "POST" });
    } catch {
      // Fallback to scan all if endpoint doesn't exist
      try { await fetch(`${API_BASE}/scans`, { method: "POST" }); } catch { /* noop */ }
    } finally {
      setTimeout(() => { setScanningTargetId(null); fetchTargets(); }, 3000);
    }
  }

  // Derived stats
  const totalTargets = targets.length;
  const healthyCount = targets.filter((t) => t.last_status === "pass").length;
  const warningCount = targets.filter((t) => t.last_status === "warn").length;
  const criticalCount = targets.filter((t) => t.last_status === "fail" || t.last_status === "error").length;
  const unscannedCount = targets.filter((t) => !t.last_status).length;

  // Filtered targets
  const filteredTargets = useMemo(() => {
    let result = targets;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.url.toLowerCase().includes(q) || t.label?.toLowerCase().includes(q));
    }
    if (activeFilter !== "all") {
      if (activeFilter === "none") {
        result = result.filter((t) => !t.last_status);
      } else {
        result = result.filter((t) => t.last_status === activeFilter || (activeFilter === "fail" && t.last_status === "error"));
      }
    }
    return result;
  }, [targets, searchQuery, activeFilter]);

  const filterCounts: Record<string, number> = {
    all: totalTargets,
    pass: healthyCount,
    warn: warningCount,
    fail: criticalCount,
    none: unscannedCount,
  };

  return (
    <>
      {/* Connection + Actions bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)",
            color: isConnected ? "var(--pass)" : "var(--fail)",
            background: isConnected ? "var(--pass-dim)" : "var(--fail-dim)",
            padding: "5px 12px", borderRadius: "var(--radius-full)",
            border: `1px solid ${isConnected ? "rgba(0,229,160,0.2)" : "rgba(255,69,115,0.2)"}`,
          }}>
            <div className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: isConnected ? "var(--pass)" : "var(--fail)" }} />
            {isConnected ? "LIVE" : "OFFLINE"}
            {latencyMs && <span style={{ color: "var(--text-muted)" }}>({latencyMs}ms)</span>}
          </div>
        </div>
        <button
          onClick={runScan}
          disabled={isScanningAll}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: isScanningAll ? "var(--accent-dim)" : "var(--accent)",
            color: isScanningAll ? "var(--accent)" : "#fff",
            border: "none", padding: "8px 20px", borderRadius: "var(--radius-sm)",
            fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
            cursor: isScanningAll ? "not-allowed" : "pointer",
            transition: "all var(--transition-fast)",
            boxShadow: isScanningAll ? "none" : "var(--shadow-glow-accent)",
            opacity: isScanningAll ? 0.7 : 1,
          }}
        >
          {isScanningAll ? (<><span className="animate-radar" style={{ display: "inline-block" }}>⟳</span>Scanning...</>) : "▶ Scan All"}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Total Targets" value={totalTargets} sub="infrastructure assets" color="accent" icon="◈" delay={0} />
        <StatCard label="Healthy" value={healthyCount} sub="all checks passing" color="pass" icon="✓" delay={1} />
        <StatCard label="Warning" value={warningCount} sub="attention needed" color="warn" icon="⚠" delay={2} />
        <StatCard label="Critical" value={criticalCount} sub="immediate action" color="fail" icon="✕" delay={3} />
      </div>

      {/* Add Target */}
      <div className="glass hover-glow" style={{ borderRadius: "var(--radius-lg)", padding: "6px 6px 6px 20px", display: "flex", alignItems: "center", gap: 12, transition: "all var(--transition-base)" }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>⊕</span>Add Target
        </div>
        <div style={{ height: 24, width: 1, background: "var(--border-bright)", flexShrink: 0 }} />
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text" value={newTargetUrl}
            onChange={(e) => setNewTargetUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTarget()}
            placeholder="https://example.com  ·  192.168.1.1  ·  domain.io"
            style={{ width: "100%", background: "transparent", border: "none", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", outline: "none", padding: "10px 0" }}
          />
          {urlValid !== null && (
            <span style={{ position: "absolute", right: 8, fontSize: 14, color: urlValid ? "var(--pass)" : "var(--fail)", transition: "all var(--transition-fast)" }}>
              {urlValid ? "✓" : "✕"}
            </span>
          )}
        </div>
        <button
          onClick={addTarget} disabled={addingTarget || urlValid === false}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: addingTarget ? "var(--surface-3)" : "var(--accent)",
            color: addingTarget ? "var(--text-muted)" : "#fff",
            border: "none", padding: "10px 20px", borderRadius: "var(--radius-sm)",
            fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
            cursor: addingTarget || urlValid === false ? "not-allowed" : "pointer",
            transition: "all var(--transition-fast)", whiteSpace: "nowrap",
            opacity: urlValid === false ? 0.5 : 1,
          }}
        >
          {addingTarget ? <span className="animate-radar" style={{ display: "inline-block" }}>⟳</span> : "Add + Scan"}
        </button>
      </div>

      {/* Targets Section */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--accent)" }}>◈</span>Monitored Targets
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 500 }}>
              {filteredTargets.length}
            </span>
          </h2>
        </div>

        <div style={{ marginBottom: 16 }}>
          <SearchFilter
            searchQuery={searchQuery} onSearchChange={setSearchQuery}
            activeFilter={activeFilter} onFilterChange={setActiveFilter}
            counts={filterCounts}
          />
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />)}
          </div>
        ) : filteredTargets.length === 0 ? (
          <EmptyState icon="◈" title={targets.length === 0 ? "No targets monitored" : "No matching targets"} description={targets.length === 0 ? "Add a URL, IP, or domain above to begin scanning" : "Try adjusting your search or filter"} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
            {filteredTargets.map((target, idx) => (
              <TargetCard
                key={target.id} target={target} index={idx}
                isExpanded={expandedTarget === target.id}
                onToggleExpand={() => setExpandedTarget(expandedTarget === target.id ? null : target.id)}
                onDelete={() => deleteTarget(target.id)}
                onRescan={() => rescanTarget(target.id, target.url)}
                isDeleting={deletingId === target.id}
                isScanning={scanningTargetId === target.id}
                latestEvent={events.find((e: ScanEvent) => e.target === target.url && e.event === "scan_completed")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Live Feed */}
      <LiveFeed events={events} clearEvents={clearEvents} />
    </>
  );
}
