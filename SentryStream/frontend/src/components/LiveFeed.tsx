"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { ScanEvent } from "@/types";

const statusColors: Record<string, string> = {
  pass: "var(--pass)",
  warn: "var(--warn)",
  fail: "var(--fail)",
  error: "var(--fail)",
};

interface LiveFeedProps {
  events: ScanEvent[];
  clearEvents: () => void;
}

export default function LiveFeed({ events, clearEvents }: LiveFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    setUserScrolled(feedRef.current.scrollTop > 10);
  }, []);

  useEffect(() => {
    if (!userScrolled && feedRef.current) feedRef.current.scrollTop = 0;
  }, [events, userScrolled]);

  return (
    <section className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          <div className="animate-pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--pass)", boxShadow: "0 0 10px var(--pass-glow)" }} />
          Real-Time Intelligence Stream
          {events.length > 0 && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: "var(--radius-full)", fontWeight: 500 }}>
              {events.length}
            </span>
          )}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>WebSocket /ws/scans</span>
          {events.length > 0 && (
            <button
              onClick={clearEvents}
              style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all var(--transition-fast)" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div ref={feedRef} onScroll={handleScroll} style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12, maxHeight: 260, overflowY: "auto" }}>
        {events.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
            <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.3 }}>◎</div>
            Waiting for scan events...
          </div>
        ) : (
          events.map((ev, i) => {
            const time = ev.finished_at?.slice(11, 19) ?? ev.started_at?.slice(11, 19) ?? "—";
            const isCompleted = ev.event === "scan_completed";
            const statusColor = ev.aggregate_status ? (statusColors[ev.aggregate_status] ?? "var(--text-secondary)") : "var(--text-secondary)";

            return (
              <div
                key={`${ev.scan_id}-${ev.event}-${i}`}
                className={i === 0 ? "animate-flash" : ""}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 12px", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1px solid transparent", transition: "all var(--transition-fast)" }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isCompleted ? statusColor : "var(--accent)", boxShadow: `0 0 6px ${isCompleted ? statusColor : "var(--accent-glow)"}`, flexShrink: 0 }} />
                <span style={{ color: "var(--text-muted)", flexShrink: 0, width: 60 }}>{time}</span>
                <span style={{ color: statusColor, flex: 1 }}>{ev.event.replace("_", " ")}</span>
                <span style={{ color: "var(--text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.target}</span>
                {isCompleted && ev.duration_ms && (
                  <span style={{ color: "var(--text-muted)", fontSize: 10, flexShrink: 0 }}>{ev.duration_ms}ms</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
