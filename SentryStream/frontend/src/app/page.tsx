"use client";

import { useState, useEffect } from "react";
import { useScanSocket } from "@/hooks/useScanSocket";
import type { Target, ScanEvent } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export default function Dashboard() {
  const { events, isConnected } = useScanSocket();
  const [targets, setTargets] = useState<Target[]>([]);
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [isScanningAll, setIsScanningAll] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchTargets();
  }, []);

  async function fetchTargets() {
    try {
      const resp = await fetch(`${API_BASE}/targets`);
      const data = await resp.json();
      setTargets(data);
    } catch (err) {
      console.error("Failed to fetch targets:", err);
    }
  }

  async function addTarget() {
    if (!newTargetUrl) return;
    try {
      const resp = await fetch(`${API_BASE}/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newTargetUrl }),
      });
      if (resp.ok) {
        setNewTargetUrl("");
        fetchTargets();
        // Trigger scan automatically
        runScan();
      }
    } catch (err) {
      console.error("Failed to add target:", err);
    }
  }

  async function runScan() {
    setIsScanningAll(true);
    try {
      await fetch(`${API_BASE}/scans`, { method: "POST" });
    } catch (err) {
      console.error("Failed to trigger scan:", err);
    } finally {
      setTimeout(() => setIsScanningAll(false), 2000);
    }
  }

  // Derived stats
  const totalTargets = targets.length;
  const healthyCount = targets.filter((t) => t.last_status === "pass").length;
  const warningCount = targets.filter((t) => t.last_status === "warn").length;
  const criticalCount = targets.filter((t) => t.last_status === "fail").length;

  return (
    <div className="flex min-h-screen bg-bg text-text-main font-display">
      {/* SIDEBAR */}
      <aside className="w-[220px] shrink-0 bg-surface border-r border-border-dim flex flex-col p-6 gap-2 sticky top-0 h-screen">
        <div className="text-[13px] font-extrabold tracking-widest uppercase text-accent border-b border-border-dim pb-5 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-pass rounded-full animate-pulse-slow"></div>
          SecMonitor
        </div>
        <nav className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 p-2 rounded-lg text-[13px] font-semibold bg-accent-bg text-accent cursor-pointer">
            <span>◈</span> Dashboard
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg text-[13px] font-semibold text-muted hover:bg-surface2 hover:text-text-main cursor-pointer">
            <span>⊕</span> Targets
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg text-[13px] font-semibold text-muted hover:bg-surface2 hover:text-text-main cursor-pointer">
            <span>↺</span> History
          </div>
        </nav>
        <div className="mt-auto pt-4 border-t border-border-dim text-[11px] text-muted font-mono">
          v1.0.0 · FastAPI + Next.js<br />
          WS: <span className={isConnected ? "text-pass" : "text-fail"}>{isConnected ? "connected" : "offline"}</span>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 flex flex-col gap-7 overflow-y-auto">
        <header className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-tight">System <span className="text-accent">Health</span></h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-pass bg-pass-bg px-2.5 py-1 rounded-full border border-pass/20">
              <div className="w-1.5 h-1.5 bg-pass rounded-full animate-pulse-slow"></div>
              WS Live
            </div>
            <button 
              className="bg-accent text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:opacity-85 disabled:opacity-50"
              onClick={runScan}
              disabled={isScanningAll}
            >
              {isScanningAll ? "Scanning..." : "▶ Scan All"}
            </button>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Targets" value={totalTargets} sub="last scan: just now" color="accent" />
          <StatCard label="Healthy" value={healthyCount} sub="all checks pass" color="pass" />
          <StatCard label="Warning" value={warningCount} sub="attention needed" color="warn" />
          <StatCard label="Critical" value={criticalCount} sub="immediate action" color="fail" />
        </div>

        {/* ADD TARGET */}
        <div className="bg-surface border border-border-dim rounded-xl p-5 flex gap-3 items-center">
          <span className="text-[12px] text-muted font-semibold uppercase tracking-wider whitespace-nowrap">Add Target</span>
          <input 
            className="flex-1 bg-surface2 border border-border-dim rounded-lg px-3.5 py-2.5 font-mono text-[13px] outline-none focus:border-accent"
            placeholder="https://example.com or 192.168.1.1"
            value={newTargetUrl}
            onChange={(e) => setNewTargetUrl(e.target.value)}
          />
          <button 
            className="bg-accent text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold hover:opacity-85"
            onClick={addTarget}
          >
            Add + Scan
          </button>
        </div>

        {/* TARGET CARDS */}
        <section>
          <h2 className="text-[14px] font-bold tracking-wider uppercase text-muted mb-3.5">Monitored Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((target) => (
              <TargetCard key={target.id} target={target} />
            ))}
          </div>
        </section>

        {/* LIVE FEED */}
        <section className="bg-surface border border-border-dim rounded-xl overflow-hidden">
          <div className="p-3.5 px-5 border-b border-border-dim flex items-center justify-between">
            <div className="text-[13px] font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-pass rounded-full"></div>
              Live Event Feed
            </div>
            <span className="text-[11px] text-muted font-mono">WebSocket /ws/scans</span>
          </div>
          <div className="p-3 flex flex-col gap-1.5 font-mono text-[12px] max-h-[220px] overflow-y-auto">
            {events.map((ev, i) => (
              <div key={i} className="flex gap-3 items-baseline p-1.5 px-2.5 rounded-md bg-surface2">
                <span className="text-muted shrink-0">{ev.finished_at ? ev.finished_at.slice(11,19) : ev.started_at?.slice(11,19)}</span>
                <span className={`flex-1 ${ev.aggregate_status ? `text-${ev.aggregate_status}` : ""}`}>
                  {ev.event.replace("_", " ")} · {ev.target}
                </span>
              </div>
            ))}
            {events.length === 0 && <div className="text-muted p-2">Waiting for events...</div>}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string, value: number, sub: string, color: string }) {
  const colorMap: any = {
    pass: "text-pass",
    warn: "text-warn",
    fail: "text-fail",
    accent: "text-accent"
  };
  const borderMap: any = {
    pass: "border-pass",
    warn: "border-warn",
    fail: "border-fail",
    accent: "border-accent"
  };

  return (
    <div className="bg-surface border border-border-dim rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-${color}`}></div>
      <div className="text-[11px] font-semibold tracking-wider uppercase text-muted">{label}</div>
      <div className={`text-[32px] font-extrabold tracking-tighter ${colorMap[color]}`}>{value}</div>
      <div className="text-[12px] text-muted font-mono">{sub}</div>
    </div>
  );
}

function TargetCard({ target }: { target: Target }) {
  const statusLabels: any = { pass: "PASS", warn: "WARN", fail: "FAIL", error: "ERROR" };
  return (
    <div className="bg-surface border border-border-dim rounded-xl overflow-hidden hover:border-border-bright cursor-pointer transition-colors">
      <div className="p-4 px-5 border-b border-border-dim flex items-center justify-between">
        <div className="font-mono text-[13px] font-medium truncate max-w-[200px]" title={target.url}>{target.url}</div>
        <div className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border border-current uppercase ${target.last_status ? `text-${target.last_status} bg-${target.last_status}/10` : "text-muted"}`}>
          {target.last_status ? statusLabels[target.last_status] : "---"}
        </div>
      </div>
      <div className="p-4 px-5 flex flex-col gap-2.5">
        <div className="text-[12px] text-muted flex justify-between items-center">
            <span>Last Scan</span>
            <span className="font-mono text-[11px]">{target.last_scanned_at ? new Date(target.last_scanned_at).toLocaleString() : "Never"}</span>
        </div>
      </div>
    </div>
  );
}
